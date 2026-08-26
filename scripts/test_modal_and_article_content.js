import puppeteer from '../client/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import crypto from 'crypto';

function getMd5(text) {
  const norm = (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
  return crypto.createHash('md5').update(norm).digest('hex').slice(0, 12);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('========================================================================');
  console.log('         TESTING HOMEPAGE LATEST UPDATES MODAL & ARTICLE CONTENT        ');
  console.log('========================================================================\n');

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // 1. Enumerate and Click Every Latest Update in Column 1
  const updateItems = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(s => s.innerText.includes('Latest Updates'));
    if (!section) return [];
    const col1 = section.querySelectorAll('.grid > div')[0];
    if (!col1) return [];
    const items = Array.from(col1.querySelectorAll('.divide-y > div'));
    return items.map((el, i) => ({
      index: i,
      title: el.querySelector('h4')?.innerText.trim()
    }));
  });

  console.log(`Discovered ${updateItems.length} Latest Updates in Column 1:`);
  updateItems.forEach(u => console.log(`  [${u.index + 1}] "${u.title}"`));

  const testedUpdates = [];

  for (let i = 0; i < updateItems.length; i++) {
    const item = updateItems[i];
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    // Click the update item in Column 1
    const updateItemSelector = `.grid > div:nth-child(1) .divide-y > div:nth-child(${i + 1})`;
    await page.waitForSelector(updateItemSelector, { timeout: 5000 });
    await page.click(updateItemSelector);

    // Wait for ArticleModal to appear
    await page.waitForSelector('.article-modal-body, [aria-label="Close modal"]', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 400));

    const modalData = await page.evaluate(() => {
      const h2 = document.querySelector('.fixed h2')?.innerText.trim() || '';
      const summary = document.querySelector('.fixed .border-l-4')?.innerText.trim() || '';
      const body = document.querySelector('.article-modal-body')?.innerText.trim() || '';
      const link = document.querySelector('.fixed a[href*="/free-resources/blogs/"]')?.getAttribute('href') || '';
      const isGenericFallback = body.includes('This guidance document outlines statutory procedures') ||
        body.includes('Key Compliance Takeaways for Corporate Secretaries');
      return { h2, summary, body, link, isGenericFallback };
    });

    const fp = getMd5(modalData.body);

    testedUpdates.push({
      index: i + 1,
      cardTitle: item.title,
      modalHeading: modalData.h2,
      contentLength: modalData.body.length,
      fullArticleLink: modalData.link,
      fingerprint: fp,
      isGenericFallback: modalData.isGenericFallback,
      pass: modalData.body.length > 200 && !modalData.isGenericFallback
    });

    console.log(`\n  [${i + 1}/${updateItems.length}] Clicked "${item.title}"`);
    console.log(`      → Modal Title:       "${modalData.h2}"`);
    console.log(`      → Content Length:    ${modalData.body.length} chars`);
    console.log(`      → Body Fingerprint:  ${fp}`);
    console.log(`      → Canonical Link:    ${modalData.link}`);
    console.log(`      → Generic Fallback:  ${modalData.isGenericFallback ? 'YES (DEFECT)' : 'NO (AUTHENTIC)'}`);
    console.log(`      → Excerpt:           "${modalData.body.slice(0, 120).replace(/\s+/g, ' ')}..."`);

    // Close modal
    await page.click('[aria-label="Close modal"]');
    await new Promise(r => setTimeout(r, 300));
  }

  // Check uniqueness of fingerprints
  console.log('\n>>> FINGERPRINT DIVERSITY ANALYSIS FOR LATEST UPDATES:');
  const fps = testedUpdates.map(u => u.fingerprint);
  const uniqueFps = new Set(fps);
  console.log(`  Total Updates Tested: ${testedUpdates.length}`);
  console.log(`  Unique Content Fingerprints: ${uniqueFps.size}`);
  console.log(`  Duplicate Fingerprints: ${testedUpdates.length - uniqueFps.size}`);

  if (uniqueFps.size === testedUpdates.length) {
    console.log('  ✓ 100% of tested Latest Updates render distinct, unique, authentic legal article bodies!');
  } else {
    console.log('  ❌ Found duplicate fingerprints!');
  }

  // 2. Also Test Clicking All Column 2 Latest Articles
  console.log('\n========================================================================');
  console.log('             TESTING HOMEPAGE COLUMN 2 LATEST ARTICLES FLOW             ');
  console.log('========================================================================\n');

  const latestArticles = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(s => s.innerText.includes('Latest Articles'));
    if (!section) return [];
    const col2 = section.querySelectorAll('.grid > div')[1];
    if (!col2) return [];
    const links = Array.from(col2.querySelectorAll('a[href*="/free-resources/blogs/"]'));
    return links.map(a => ({
      href: a.getAttribute('href'),
      title: a.querySelector('h4')?.innerText.trim(),
      slug: a.getAttribute('href').split('/').pop()
    }));
  });

  console.log(`Discovered ${latestArticles.length} Latest Articles in Column 2:`);
  const testedCol2 = [];

  for (let i = 0; i < latestArticles.length; i++) {
    const art = latestArticles[i];
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    const selector = `a[href="${art.href}"]`;
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    await page.waitForFunction(
      (slug) => window.location.pathname.includes(slug) && !!document.querySelector('h1'),
      { timeout: 5000 },
      art.slug
    );
    await new Promise(r => setTimeout(r, 400));

    const pageData = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText.trim() || '';
      const body = document.querySelector('article, .prose, main')?.innerText.trim() || '';
      return { h1, body, url: window.location.href };
    });

    const fp = getMd5(pageData.body);
    testedCol2.push({
      index: i + 1,
      title: art.title,
      url: pageData.url,
      h1: pageData.h1,
      length: pageData.body.length,
      fp
    });

    console.log(`  [${i + 1}/${latestArticles.length}] Card: "${art.title.slice(0, 35)}..."`);
    console.log(`      → URL:    ${pageData.url}`);
    console.log(`      → H1:     "${pageData.h1.slice(0, 45)}..."`);
    console.log(`      → Length: ${pageData.body.length} chars (FP: ${fp})`);
  }

  const col2Fps = new Set(testedCol2.map(c => c.fp));
  console.log(`\n  Column 2 Unique Content Fingerprints: ${col2Fps.size}/${testedCol2.length}`);

  await browser.close();
})();
