import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import server app
import app from '../index.js';

const PORT = 5099;

async function runAudit() {
  console.log('🚀 Starting Local Audit Server on port', PORT);
  const server = app.listen(PORT, async () => {
    console.log('✅ Server listening for audit tests...\n');

    try {
      // Load all slugs from wordpress-posts.json
      const postsPath = path.join(__dirname, '..', 'data', 'wordpress-posts.json');
      const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      console.log(`📚 Total articles in static database: ${posts.length}`);

      // Test all 193 blog posts plus legacy IDs
      const testSlugs = [
        'retail-fme-gift-ifsc-setup',
        'blog-1',
        'blog-2',
        'blog-3',
        'blog-4',
        'blog-5',
        ...posts.map(p => p.slug).filter(Boolean)
      ];

      console.log(`\n🔍 Auditing ${testSlugs.length} blog routes for WhatsApp/Social Rich Preview compliance...\n`);

      let totalPassed = 0;
      let totalFailed = 0;

      for (const slug of testSlugs) {
        const url = `http://localhost:${PORT}/free-resources/blogs/${slug}`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'WhatsApp/2.21.12.21 A (Bot Social Preview Test)'
          }
        });

        const html = await res.text();
        const status = res.status;

        // Parse metadata tags robustly
        const getMetaContent = (attr, val) => {
          const regex1 = new RegExp(`<meta\\s+[^>]*?${attr}=["']${val}["'][^>]*?content=["']([\\s\\S]*?)["'](?:\\s|>|\\/)`, 'i');
          const regex2 = new RegExp(`<meta\\s+[^>]*?content=["']([\\s\\S]*?)["'][^>]*?${attr}=["']${val}["'](?:\\s|>|\\/)`, 'i');
          const match = html.match(regex1) || html.match(regex2);
          return match ? match[1] : null;
        };

        const getTitle = () => {
          const m = html.match(/<title>([^<]*)<\/title>/i);
          return m ? m[1] : null;
        };

        const getCanonical = () => {
          const m = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
          return m ? m[1] : null;
        };

        const title = getTitle();
        const ogTitle = getMetaContent('property', 'og:title');
        const ogDesc = getMetaContent('property', 'og:description');
        const ogImage = getMetaContent('property', 'og:image');
        const ogUrl = getMetaContent('property', 'og:url');
        const ogType = getMetaContent('property', 'og:type');
        const twitterCard = getMetaContent('name', 'twitter:card');
        const canonical = getCanonical();

        // Validations
        const checks = [
          { name: 'HTTP Status 200', pass: status === 200, val: status },
          { name: 'og:title present', pass: Boolean(ogTitle && ogTitle.length > 5), val: ogTitle },
          { name: 'og:description present', pass: Boolean(ogDesc && ogDesc.length > 10), val: ogDesc },
          { name: 'og:image is absolute HTTPS URL', pass: Boolean(ogImage && ogImage.startsWith('https://')), val: ogImage },
          { name: 'og:url is absolute HTTPS URL', pass: Boolean(ogUrl && ogUrl.startsWith('https://www.regmate.in/free-resources/blogs/')), val: ogUrl },
          { name: 'og:type is article', pass: ogType === 'article', val: ogType },
          { name: 'twitter:card is summary_large_image', pass: twitterCard === 'summary_large_image', val: twitterCard },
          { name: 'canonical link valid', pass: Boolean(canonical && canonical.startsWith('https://www.regmate.in')), val: canonical }
        ];

        const failedChecks = checks.filter(c => !c.pass);
        const pass = failedChecks.length === 0;

        if (pass) {
          totalPassed++;
          console.log(`✅ [PASS] ${slug}`);
          console.log(`   └─ Page Title: "${title}"`);
          console.log(`   └─ OG Title: "${ogTitle}"`);
          console.log(`   └─ Description: "${ogDesc.slice(0, 80)}..."`);
          console.log(`   └─ Image: ${ogImage}`);
          console.log(`   └─ URL: ${ogUrl}\n`);
        } else {
          totalFailed++;
          console.log(`❌ [FAIL] ${slug}`);
          failedChecks.forEach(fc => console.log(`   └─ FAILED CHECK: ${fc.name} (Value: ${fc.val})`));
          console.log('');
        }
      }

      console.log('='.repeat(60));
      console.log(`SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed`);
      console.log('='.repeat(60));

      server.close(() => {
        process.exit(totalFailed === 0 ? 0 : 1);
      });
    } catch (err) {
      console.error('Audit execution error:', err);
      server.close(() => process.exit(1));
    }
  });
}

runAudit();
