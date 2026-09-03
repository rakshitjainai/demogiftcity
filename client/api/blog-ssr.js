import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let posts = [];
try {
  posts = require('./posts.json');
} catch (_e) {
  try {
    posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'posts.json'), 'utf-8'));
  } catch (_e2) {
    try {
      posts = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'client', 'src', 'data', 'posts.json'), 'utf-8'));
    } catch (_e3) {}
  }
}

function stripHtml(html = '') {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req, res) {
  try {
    // 1. Extract slug
    const matchedPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.url || '';
    let slug = req.query?.slug || req.query?.ssrSlug;
    if (!slug) {
      const match = matchedPath.match(/\/(?:free-resources\/blogs|blog)\/([^/?#]+)/i);
      if (match) slug = match[1];
    }
    if (!slug) {
      const segments = req.url.split('?')[0].split('/').filter(Boolean);
      slug = segments[segments.length - 1];
    }
    const cleanSlug = (slug || '').trim().toLowerCase();

    // 2. Lookup post
    const post = posts.find(
      p => (p.slug && p.slug.toLowerCase() === cleanSlug) || (p.id && p.id.toLowerCase() === cleanSlug)
    );

    const title = post
      ? (post.ogTitle || post.metaTitle || post.title || 'RegMate Blog')
      : 'RegMate — Navigate Regulations. Stay Ahead. | India\'s Premier Compliance Platform';

    const fullTitle = post ? `${title} | RegMate` : title;

    const rawDesc = post
      ? (post.ogDescription || post.metaDescription || post.desc || stripHtml(post.content || ''))
      : 'Smart tools, interactive regulations, and expert insights for corporate law, GIFT City IFSC, and compliance professionals across India.';
    const description = (stripHtml(rawDesc) || '').slice(0, 160);

    const ogImage = (post && (post.ogImage || post.coverImage))
      ? (post.ogImage || post.coverImage)
      : 'https://www.regmate.in/assets/og-fallback-blog.jpg';

    const canonicalUrl = `https://www.regmate.in/free-resources/blogs/${(post && post.slug) ? post.slug : cleanSlug}`;

    // 3. Load or build HTML shell
    let html = '';
    const candidatePaths = [
      path.join(__dirname, '..', 'dist', 'index.html'),
      path.join(process.cwd(), 'client', 'dist', 'index.html'),
      path.join(process.cwd(), 'dist', 'index.html'),
      path.join(__dirname, '..', 'index.html'),
      path.join(process.cwd(), 'client', 'index.html'),
      path.join(process.cwd(), 'index.html')
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          html = fs.readFileSync(p, 'utf-8');
          if (html) break;
        } catch (_e) {}
      }
    }

    if (!html) {
      html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/assets/sitelogo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${fullTitle}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
    }

    // 4. Inject metadata
    if (html.includes('<title>')) {
      html = html.replace(/<title>.*?<\/title>/s, `<title>${fullTitle}</title>`);
    } else {
      html = html.replace('</head>', `<title>${fullTitle}</title></head>`);
    }

    html = html.replace(/<meta\s+(?:property|name)=["']og:[^"']*["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+(?:name|property)=["']twitter:[^"']*["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');

    const metaTags = `
    <!-- Dynamic Open Graph & Twitter Cards -->
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="RegMate">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:secure_url" content="${ogImage}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${title}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@RegMateIn">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${ogImage}">
    <meta name="twitter:image:alt" content="${title}">
`;

    html = html.replace('</head>', `${metaTags}</head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'index, follow, max-image-preview:large');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    return res.status(200).send(html);
  } catch (err) {
    console.error('SSR Error:', err);
    return res.status(500).send('Internal Server Error');
  }
}
