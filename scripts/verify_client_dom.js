process.env.NODE_ENV = 'test';
import app from '../server/index.js';
import puppeteer from '../client/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const server = app.listen(5098, async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    await page.goto('http://localhost:5098/free-resources/blogs/retail-fme-gift-ifsc-setup', { waitUntil: 'networkidle0' });

    const ogTitleLength = await page.evaluate(() => {
      return document.querySelectorAll('meta[property="og:title"]').length;
    });

    const ogDescLength = await page.evaluate(() => {
      return document.querySelectorAll('meta[property="og:description"]').length;
    });

    const ogImageLength = await page.evaluate(() => {
      return document.querySelectorAll('meta[property="og:image"]').length;
    });

    const twitterCardLength = await page.evaluate(() => {
      return document.querySelectorAll('meta[name="twitter:card"]').length;
    });

    const bodyParagraphAlignments = await page.evaluate(() => {
      const pElements = Array.from(document.querySelectorAll('.blog-content-body p'));
      return pElements.map(p => window.getComputedStyle(p).textAlign);
    });

    const coverImageStyles = await page.evaluate(() => {
      const img = document.querySelector('.blog-cover-image');
      if (!img) return null;
      const cs = window.getComputedStyle(img);
      return {
        width: cs.width,
        height: cs.height,
        objectFit: cs.objectFit,
        display: cs.display
      };
    });

    console.log('=== CLIENT DOM HYDRATION METADATA AUDIT ===');
    console.log(`meta[property="og:title"] count: ${ogTitleLength}`);
    console.log(`meta[property="og:description"] count: ${ogDescLength}`);
    console.log(`meta[property="og:image"] count: ${ogImageLength}`);
    console.log(`meta[name="twitter:card"] count: ${twitterCardLength}`);
    console.log('\n=== MOBILE LAYOUT AUDIT (375px Viewport) ===');
    console.log('Cover Image Computed Styles:', coverImageStyles);
    console.log('Body Paragraph Alignments:', bodyParagraphAlignments.slice(0, 5));

  } catch (err) {
    console.error('Puppeteer verification failed:', err);
  } finally {
    if (browser) await browser.close();
    server.close();
    process.exit(0);
  }
});
