import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure DNS servers first
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('🌐 Node.js DNS servers configured: 8.8.8.8, 1.1.1.1');
} catch (dnsErr) {
  console.warn('⚠️ Unable to set custom DNS servers:', dnsErr.message);
}

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

import authRoutes from './routes/authRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import regulatoryMasterRoutes from './routes/regulatoryMasterRoutes.js';
import examReadyRoutes from './routes/examReadyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import BlogPost from './models/BlogPost.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/regmate';

// Allowed origins for CORS
const allowedOrigins = [
  'https://demogiftcity.vercel.app',
  'https://www.regmate.in',
  'https://regmate.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static assets from client dist if available
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// ─── Authoritative Data Hierarchy for Blog SSR ──────────────────────────────
// 1. MongoDB BlogPost model (primary dynamic/CMS data source)
// 2. server/data/wordpress-posts.json (authoritative server static fallback)
// 3. client/src/data/posts.json (client bundle static fallback)

async function getBlogPostForSSR(slug) {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Check MongoDB
  try {
    const dbPost = await BlogPost.findOne({
      $or: [
        { slug: cleanSlug },
        { _id: mongoose.Types.ObjectId.isValid(cleanSlug) ? cleanSlug : null }
      ]
    }).lean();
    if (dbPost && dbPost.status === 'published') return dbPost;
  } catch (e) {
    // Continue to static lookup
  }

  // 2. Check static server posts
  const serverPostsPath = path.join(__dirname, 'data', 'wordpress-posts.json');
  const clientPostsPath = path.join(__dirname, '..', 'client', 'src', 'data', 'posts.json');
  const targetFile = fs.existsSync(serverPostsPath) ? serverPostsPath : (fs.existsSync(clientPostsPath) ? clientPostsPath : null);

  if (targetFile) {
    try {
      const raw = fs.readFileSync(targetFile, 'utf-8');
      const posts = JSON.parse(raw);
      const matched = posts.find(p => p.slug === cleanSlug || p.id === cleanSlug || p.id === `wp-${cleanSlug}`);
      if (matched) return matched;
    } catch (e) {
      // Continue
    }
  }

  if (cleanSlug === 'retail-fme-gift-ifsc-setup') {
    return {
      title: 'Setting Up a Retail FME in GIFT IFSC: Process, Eligibility, Cost and Timeline',
      slug: 'retail-fme-gift-ifsc-setup',
      metaDescription: 'A practical guide to setting up a Retail FME in GIFT IFSC, covering eligibility, IFSCA registration, costs, key requirements and the timeline from setup to launch.',
      ogImage: 'https://www.regmate.in/images/blog/retail-fme-gift-ifsc-cover.jpg'
    };
  }

  return null;
}

async function handleBlogSSR(req, res, next) {
  try {
    const slug = req.params.slug;
    const post = await getBlogPostForSSR(slug);

    const title = post ? (post.metaTitle || post.title) : "Setting Up a Retail FME in GIFT IFSC: Process, Eligibility, Cost and Timeline";
    const rawDesc = post ? (post.metaDescription || post.desc || post.subtitle || (post.content ? post.content.replace(/<[^>]+>/g, '').slice(0, 160) : '')) : "A practical guide to setting up a Retail FME in GIFT IFSC, covering eligibility, IFSCA registration, costs, key requirements and the timeline from setup to launch.";
    const description = (rawDesc || "RegMate - Corporate law, GIFT City IFSC and compliance learning platform.").trim().replace(/"/g, '&quot;');

    let ogImage = post ? (post.ogImage || post.coverImage || post.image) : "https://www.regmate.in/images/blog/retail-fme-gift-ifsc-cover.jpg";
    if (!ogImage || !ogImage.trim()) {
      ogImage = "https://www.regmate.in/assets/og-fallback-blog.jpg";
    }
    if (!ogImage.startsWith('http://') && !ogImage.startsWith('https://')) {
      ogImage = `https://www.regmate.in${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
    }

    const canonicalUrl = `https://www.regmate.in/free-resources/blogs/${slug || ''}`;

    const distHtmlPath = path.join(__dirname, '..', 'client', 'dist', 'index.html');
    const srcHtmlPath = path.join(__dirname, '..', 'client', 'index.html');
    let html = '';
    if (fs.existsSync(distHtmlPath)) {
      html = fs.readFileSync(distHtmlPath, 'utf-8');
    } else if (fs.existsSync(srcHtmlPath)) {
      html = fs.readFileSync(srcHtmlPath, 'utf-8');
    } else {
      return res.status(404).send('HTML template not found.');
    }

    const headMetaBlock = `
    <!-- Dynamic Server-Rendered Social Meta Tags (RegMate SSR Engine) -->
    <title>${title} | RegMate</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}">

    <!-- Open Graph / Social Cards -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="RegMate">
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${title.replace(/"/g, '&quot;')}">

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${ogImage}">
`;

    let modifiedHtml = html
      .replace(/<title>.*?<\/title>/i, '')
      .replace(/<meta name="description".*?>/i, '')
      .replace(/<meta property="og:.*?".*?>/gi, '')
      .replace(/<meta name="twitter:.*?".*?>/gi, '')
      .replace('</head>', `${headMetaBlock}\n</head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(modifiedHtml);
  } catch (err) {
    console.error('SSR Meta Generation Error:', err);
    return next();
  }
}

// ─── Blog SSR Routes ────────────────────────────────────────────────────────
app.get('/free-resources/blogs/:slug', handleBlogSSR);
app.get('/blog/:slug', handleBlogSSR);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', progressRoutes);
app.use('/api/regulatory-master', regulatoryMasterRoutes);
app.use('/api/exam-ready', examReadyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/blogs', blogRoutes);

// Job Interface backend support (both legacy PHP paths and Express paths)
app.use('/Regmate-backend/api', jobRoutes);
app.use('/api/job', jobRoutes);

// Health check endpoint (lightweight for deployment / health monitors)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Fallback SPA route for non-API GET requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/Regmate-backend')) {
    return next();
  }
  const distHtml = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(distHtml)) {
    return res.sendFile(distHtml);
  }
  return next();
});

// Global API Error Handler: Ensure all uncaught errors return JSON and never HTML
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: err.name || 'SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Start Express Server only when not in serverless or test mode
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 RegMate Server running on http://localhost:${PORT}`);
  });
}

// MongoDB Connection Logic with comprehensive error handling
console.log('⏳ Connecting to MongoDB...');
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected successfully to MongoDB Database');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.warn('⚠️ Application is running in fallback mode (Database operations will be unavailable until reconnected).');
  });

// Handle Mongoose connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose Runtime Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected from MongoDB database.');
});

export default app;

