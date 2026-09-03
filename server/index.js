import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// In-memory bundled static posts for Vercel Serverless reliability
let staticWordpressPosts = null;
try {
  staticWordpressPosts = require('./data/wordpress-posts.json');
} catch (_e1) {
  try {
    staticWordpressPosts = require('../server/data/wordpress-posts.json');
  } catch (_e2) {}
}

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

// ─── Site constants ───────────────────────────────────────────────────────────
const SITE_ROOT = 'https://www.regmate.in';
const FALLBACK_OG_IMAGE = `${SITE_ROOT}/assets/og-fallback-blog.jpg`;

// Allowed origins for CORS
const allowedOrigins = [
  'https://demogiftcity.vercel.app',
  'https://www.regmate.in',
  'https://regmate.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

// Middlewares
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
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

// ─── Blog SSR: Data Lookup ────────────────────────────────────────────────────
// Priority: MongoDB → server/data/wordpress-posts.json → client/src/data/posts.json

const LEGACY_ID_MAP = {
  'blog-1': 'esop-design-for-startups-india',
  'blog-2': 'does-scra-apply-to-ifsc-listings-indian-companies',
  'blog-3': 'uae-trademark-filing-process',
  'blog-4': 'board-resolution-appointment-additional-director-india',
  'blog-5': 'board-resolution-appointment-first-auditor',
};

async function getBlogPostForSSR(slug) {
  if (!slug) return null;
  let cleanSlug = slug.toLowerCase().trim();
  if (LEGACY_ID_MAP[cleanSlug]) {
    cleanSlug = LEGACY_ID_MAP[cleanSlug];
  }

  // 1. MongoDB (primary CMS source)
  try {
    const dbPost = await BlogPost.findOne({
      $or: [
        { slug: cleanSlug },
        { _id: mongoose.Types.ObjectId.isValid(cleanSlug) ? cleanSlug : null }
      ]
    }).lean();
    if (dbPost && dbPost.status === 'published') return dbPost;
  } catch (_e) {
    // Fall through to static files
  }

  // 2. Static JSON fallback files & debug logging (as requested in Step 2)
  const serverPostsPath = path.join(__dirname, 'data', 'wordpress-posts.json');
  const clientPostsPath = path.join(__dirname, '..', 'client', 'src', 'data', 'posts.json');
  const cwdServerPosts = path.join(process.cwd(), 'server', 'data', 'wordpress-posts.json');
  const cwdClientPosts = path.join(process.cwd(), 'client', 'src', 'data', 'posts.json');

  console.log(`[SSR DEBUG] getBlogPostForSSR slug: "${slug}", cleanSlug: "${cleanSlug}"`);
  console.log(`[SSR DEBUG] serverPostsPath exists: ${fs.existsSync(serverPostsPath)} (${serverPostsPath})`);
  console.log(`[SSR DEBUG] clientPostsPath exists: ${fs.existsSync(clientPostsPath)} (${clientPostsPath})`);
  console.log(`[SSR DEBUG] cwdServerPosts exists: ${fs.existsSync(cwdServerPosts)} (${cwdServerPosts})`);
  console.log(`[SSR DEBUG] cwdClientPosts exists: ${fs.existsSync(cwdClientPosts)} (${cwdClientPosts})`);

  const candidateFiles = [serverPostsPath, cwdServerPosts, clientPostsPath, cwdClientPosts];
  for (const f of candidateFiles) {
    if (fs.existsSync(f)) {
      try {
        const raw = fs.readFileSync(f, 'utf-8');
        const posts = JSON.parse(raw);
        const matched = posts.find(
          p => p.slug === cleanSlug || p.id === cleanSlug || p.id === `wp-${cleanSlug}`
        );
        if (matched) {
          console.log(`[SSR DEBUG] Found post on filesystem in "${f}": "${matched.title}"`);
          return matched;
        }
      } catch (_e) {
        // Continue to next candidate
      }
    }
  }

  // 3. In-memory bundled JSON fallback (guaranteed in Vercel lambda bundle)
  if (Array.isArray(staticWordpressPosts)) {
    const matched = staticWordpressPosts.find(
      p => p.slug === cleanSlug || p.id === cleanSlug || p.id === `wp-${cleanSlug}`
    );
    if (matched) {
      console.log(`[SSR DEBUG] Found post in bundled staticWordpressPosts: "${matched.title}"`);
      return matched;
    }
  }

  console.warn(`[SSR DEBUG] Post not found for slug "${cleanSlug}". Using default site meta.`);
  return null; // Unknown slug — caller will use generic brand fallback
}

// ─── Blog SSR: Helpers ────────────────────────────────────────────────────────

function decodeHtmlEntities(str = '') {
  return String(str || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#91;[^&#]+&#93;/gi, '')
    .replace(/\[[^\]]+\]/g, '');
}

function extractDescription(post, maxLen = 160) {
  if (!post) return '';
  let raw =
    post.metaDescription ||
    post.ogDescription ||
    post.excerpt ||
    post.desc ||
    post.subtitle ||
    '';

  if (!raw && post.content) {
    raw = post.content
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ');
  }

  const cleaned = decodeHtmlEntities(raw)
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.slice(0, maxLen).trim();
}

function resolveOgImage(post) {
  let img = (
    post
      ? post.ogImage || post.coverImage || post.image || post.featuredImage || ''
      : ''
  ).trim();

  // If no explicit image, extract first <img> tag from content
  if (!img && post && post.content) {
    const match = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) {
      img = match[1].trim();
    }
  }

  if (!img) return FALLBACK_OG_IMAGE;
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img.replace(/^http:\/\//i, 'https://');
  }
  return `${SITE_ROOT}${img.startsWith('/') ? '' : '/'}${img}`;
}

/**
 * Strip all existing OG/Twitter/description/title/canonical/robots tags from the HTML
 * and inject a fresh, fully-populated, crawlable meta block before </head>.
 */
function injectOGMetaIntoHtml(html, { title, description, ogImage, canonicalUrl, publishedTime }) {
  let out = html;

  // Remove existing meta/title/link tags to avoid duplicate metadata
  out = out.replace(/<title>[\s\S]*?<\/title>/i, '');
  out = out.replace(/<meta\s[^>]*name=["']description["'][^>]*\/?>/gi, '');
  out = out.replace(/<meta\s[^>]*property=["']og:[^"']*["'][^>]*\/?>/gi, '');
  out = out.replace(/<meta\s[^>]*name=["']twitter:[^"']*["'][^>]*\/?>/gi, '');
  out = out.replace(/<meta\s[^>]*name=["']robots["'][^>]*\/?>/gi, '');
  out = out.replace(/<link\s[^>]*rel=["']canonical["'][^>]*\/?>/gi, '');

  // HTML-safe values
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cleanTitle = decodeHtmlEntities(title);
  const displayTitle = cleanTitle.includes('RegMate') ? cleanTitle : `${cleanTitle} | RegMate`;
  const t = esc(cleanTitle);
  const dt = esc(displayTitle);
  const d = esc(description);
  const img = ogImage; // already absolute HTTPS URL
  const url = canonicalUrl;

  let imageType = 'image/jpeg';
  if (img.toLowerCase().endsWith('.png')) imageType = 'image/png';
  else if (img.toLowerCase().endsWith('.webp')) imageType = 'image/webp';
  else if (img.toLowerCase().endsWith('.gif')) imageType = 'image/gif';
  else if (img.toLowerCase().endsWith('.svg')) imageType = 'image/svg+xml';

  const metaBlock = `
    <!-- SSR Blog Social Meta — RegMate OG Engine -->
    <title>${dt}</title>
    <meta name="description" content="${d}">
    <link rel="canonical" href="${url}">
    <meta name="robots" content="index, follow, max-image-preview:large">

    <!-- Open Graph (Facebook, WhatsApp, Telegram, LinkedIn, iMessage) -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="RegMate">
    <meta property="og:title" content="${t}">
    <meta property="og:description" content="${d}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${img}">
    <meta property="og:image:secure_url" content="${img}">
    <meta property="og:image:type" content="${imageType}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${t}">
    ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}">` : ''}

    <!-- Twitter / X Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@RegMateIn">
    <meta name="twitter:title" content="${t}">
    <meta name="twitter:description" content="${d}">
    <meta name="twitter:image" content="${img}">
    <meta name="twitter:image:alt" content="${t}">
`;

  return out.replace('</head>', `${metaBlock}</head>`);
}

// ─── Blog SSR Route Handler ───────────────────────────────────────────────────

async function handleBlogSSR(req, res, next) {
  try {
    const rawSlug = req.params?.slug || req.query?.ssrSlug;
    let slug = rawSlug;
    if (!slug) {
      const matchedPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.originalUrl || req.url || '';
      const m = matchedPath.match(/\/(?:free-resources\/blogs|blog)\/([^/?#]+)/i);
      if (m) slug = m[1];
    }

    const ua = req.headers['user-agent'] || '';
    console.log(`🤖 Social/SSR Request [${ua.slice(0, 40)}] -> url: ${req.originalUrl || req.url}, extracted slug: "${slug}"`);

    const post = await getBlogPostForSSR(slug);
    const targetSlug = (post && post.slug) ? post.slug : slug;

    const title = post
      ? post.ogTitle || post.metaTitle || post.title || 'RegMate Blog'
      : 'RegMate — Navigate Regulations. Stay Ahead.';

    const description = post
      ? extractDescription(post) ||
        'Expert insights on Indian corporate law, GIFT City IFSC and compliance.'
      : "RegMate is India's premier compliance learning platform for CS, CA, and legal professionals.";

    const ogImage = resolveOgImage(post);
    const canonicalUrl = `${SITE_ROOT}/free-resources/blogs/${targetSlug || ''}`;
    const publishedTime =
      post && (post.publishedAt || post.rawDate)
        ? new Date(post.publishedAt || post.rawDate).toISOString()
        : null;

    // Load HTML shell candidates (checking both __dirname and process.cwd() for Vercel lambdas)
    const candidateHtmlPaths = [
      path.join(__dirname, '..', 'client', 'dist', 'index.html'),
      path.join(process.cwd(), 'client', 'dist', 'index.html'),
      path.join(process.cwd(), 'dist', 'index.html'),
      path.join(__dirname, '..', 'client', 'index.html'),
      path.join(process.cwd(), 'client', 'index.html'),
      path.join(process.cwd(), 'index.html')
    ];

    console.log('[SSR DEBUG] HTML shell candidate lookup:');
    let html = '';
    for (const p of candidateHtmlPaths) {
      const exists = fs.existsSync(p);
      console.log(`  Candidate: ${p} -> exists: ${exists}`);
      if (exists && !html) {
        try {
          html = fs.readFileSync(p, 'utf-8');
        } catch (e) {
          console.error(`  Error reading ${p}:`, e.message);
        }
      }
    }

    if (!html) {
      console.warn('[SSR DEBUG] No static HTML shell file found on filesystem. Using standalone shell.');
      html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/assets/sitelogo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Public+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
    }

    const modifiedHtml = injectOGMetaIntoHtml(html, {
      title,
      description,
      ogImage,
      canonicalUrl,
      publishedTime
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'index, follow, max-image-preview:large');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    return res.status(200).send(modifiedHtml);
  } catch (err) {
    console.error('SSR OG Injection Error:', err);
    return next();
  }
}

// ─── Blog SSR Routes (MUST come before static file middleware) ────────────────
app.get('/free-resources/blogs/:slug', handleBlogSSR);
app.get('/blog/:slug', handleBlogSSR);
app.get('/api/index.js', (req, res, next) => {
  if (req.query?.ssrSlug || req.headers['x-matched-path']?.includes('/blog')) {
    return handleBlogSSR(req, res, next);
  }
  next();
});

// SSR Catch-all Middleware to intercept Vercel rewrites before static files
app.use((req, res, next) => {
  const pathToCheck = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.originalUrl || req.url || '';
  const blogMatch = pathToCheck.match(/\/(?:free-resources\/blogs|blog)\/([^/?#]+)/i);
  if (blogMatch && blogMatch[1]) {
    req.params = req.params || {};
    req.params.slug = blogMatch[1];
    return handleBlogSSR(req, res, next);
  }
  if (req.query?.ssrSlug) {
    req.params = req.params || {};
    req.params.slug = req.query.ssrSlug;
    return handleBlogSSR(req, res, next);
  }
  next();
});

// ─── robots.txt — dynamically served so it's always accurate ─────────────────
app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(
    [
      'User-agent: *',
      'Allow: /',
      '',
      '# Allow all social media crawlers explicitly',
      'User-agent: facebookexternalhit',
      'Allow: /',
      '',
      'User-agent: Twitterbot',
      'Allow: /',
      '',
      'User-agent: LinkedInBot',
      'Allow: /',
      '',
      'User-agent: WhatsApp',
      'Allow: /',
      '',
      `Sitemap: ${SITE_ROOT}/sitemap.xml`
    ].join('\n')
  );
});

// ─── API Routes ───────────────────────────────────────────────────────────────
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

// Health check endpoint
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/health', (_req, res) =>
  res.json({
    status: 'ok',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
);

// ─── SPA Fallback ─────────────────────────────────────────────────────────────
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

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: err.name || 'SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.'
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 RegMate Server running on http://localhost:${PORT}`);
  });
}

// ─── MongoDB ──────────────────────────────────────────────────────────────────
console.log('⏳ Connecting to MongoDB...');
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected successfully to MongoDB Database'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.warn('⚠️ Application running in fallback mode — DB unavailable.');
  });

mongoose.connection.on('error', err => console.error('❌ Mongoose Runtime Error:', err.message));
mongoose.connection.on('disconnected', () => console.warn('⚠️ Mongoose disconnected.'));

export default app;
