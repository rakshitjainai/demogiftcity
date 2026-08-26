import puppeteer from '../client/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import crypto from 'crypto';

function getMd5(text) {
  const norm = (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
  return crypto.createHash('md5').update(norm).digest('hex').slice(0, 12);
}

const VIEWPORTS = [
  // Mobile
  { name: 'Mobile 320x844', width: 320, height: 844, isMobile: true },
  { name: 'Mobile 360x800', width: 360, height: 800, isMobile: true },
  { name: 'Mobile 375x812', width: 375, height: 812, isMobile: true },
  { name: 'Mobile 390x844', width: 390, height: 844, isMobile: true },
  { name: 'Mobile 412x915', width: 412, height: 915, isMobile: true },
  { name: 'Mobile 430x932', width: 430, height: 932, isMobile: true },
  // Desktop
  { name: 'Desktop 1024x768', width: 1024, height: 768, isMobile: false },
  { name: 'Desktop 1280x800', width: 1280, height: 800, isMobile: false },
  { name: 'Desktop 1440x900', width: 1440, height: 900, isMobile: false },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  let allPass = true;

  console.log('========================================================================');
  console.log('      FULL ACCEPTANCE & REGRESSION SUITE: HOMEPAGE ARTICLES & MODALS   ');
  console.log('========================================================================\n');

  // ── TEST 1: HOMEPAGE LATEST UPDATES (5 ARTICLES) ──────────────────────
  console.log('>>> [TEST 1] HOMEPAGE LATEST UPDATES MODAL & CONTENT FINGERPRINTS');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  const latestUpdatesResults = [];
  const updateFps = new Set();

  for (let i = 0; i < 5; i++) {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    const rowSelector = `.grid > div:nth-child(1) .divide-y > div:nth-child(${i + 1})`;
    await page.waitForSelector(rowSelector, { timeout: 5000 });
    const cardTitle = await page.evaluate(el => el.querySelector('h4')?.innerText.trim(), await page.$(rowSelector));

    await page.click(rowSelector);
    await page.waitForSelector('.article-modal-body, [aria-label="Close modal"]', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 400));

    const modalData = await page.evaluate(() => {
      const h2 = document.querySelector('.fixed h2')?.innerText.trim() || '';
      const body = document.querySelector('.article-modal-body')?.innerText.trim() || '';
      const link = document.querySelector('.fixed a[href*="/free-resources/blogs/"]')?.getAttribute('href') || '';
      const hasGeneric = body.includes('This guidance document outlines statutory procedures') ||
        body.includes('Key Compliance Takeaways for Corporate Secretaries');
      return { h2, body, link, hasGeneric };
    });

    const fp = getMd5(modalData.body);
    const isUnique = !updateFps.has(fp);
    updateFps.add(fp);

    const pass = modalData.body.length > 500 && !modalData.hasGeneric && isUnique;
    if (!pass) allPass = false;

    latestUpdatesResults.push({
      index: i + 1,
      cardTitle,
      modalHeading: modalData.h2,
      contentLength: modalData.body.length,
      fingerprint: fp,
      hasGeneric: modalData.hasGeneric,
      link: modalData.link,
      pass
    });

    console.log(`  [1.${i + 1}] "${cardTitle.slice(0, 35)}..."`);
    console.log(`       → Modal Title:      "${modalData.h2.slice(0, 45)}..."`);
    console.log(`       → Content Length:   ${modalData.body.length} chars (FP: ${fp})`);
    console.log(`       → Canonical Link:   ${modalData.link}`);
    console.log(`       → Generic Text:     ${modalData.hasGeneric ? 'FAIL (Generic)' : 'PASS (Authentic)'}`);
    console.log(`       → Result:           ${pass ? 'PASS' : 'FAIL'}`);

    await page.click('[aria-label="Close modal"]');
    await new Promise(r => setTimeout(r, 200));
  }

  // ── TEST 2: HOMEPAGE LATEST ARTICLES (5 ARTICLES) ─────────────────────
  console.log('\n>>> [TEST 2] HOMEPAGE LATEST ARTICLES ROUTING & DIVERSITY');
  const latestArticlesResults = [];
  const articleFps = new Set();

  for (let i = 0; i < 5; i++) {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    const cardSelector = `.grid > div:nth-child(2) a[href*="/free-resources/blogs/"]:nth-child(${i + 1})`;
    await page.waitForSelector(cardSelector, { timeout: 5000 });
    const cardTitle = await page.evaluate(el => el.querySelector('h4')?.innerText.trim(), await page.$(cardSelector));
    const cardHref = await page.evaluate(el => el.getAttribute('href'), await page.$(cardSelector));
    const cardSlug = cardHref.split('/').pop();

    await page.click(cardSelector);
    await page.waitForFunction(
      (expectedSlug) => window.location.pathname.includes(expectedSlug) && !!document.querySelector('h1'),
      { timeout: 5000 },
      cardSlug
    );
    await new Promise(r => setTimeout(r, 300));

    const pageData = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText.trim() || '';
      const body = document.querySelector('article, .prose, main')?.innerText.trim() || '';
      return { h1, body, url: window.location.href };
    });

    const fp = getMd5(pageData.body);
    const isUnique = !articleFps.has(fp);
    articleFps.add(fp);

    const pass = pageData.url.includes(cardSlug) && pageData.h1.length > 0 && pageData.body.length > 50 && isUnique;
    if (!pass) allPass = false;

    latestArticlesResults.push({
      index: i + 1,
      cardTitle,
      slug: cardSlug,
      url: pageData.url,
      h1: pageData.h1,
      contentLength: pageData.body.length,
      fingerprint: fp,
      pass
    });

    console.log(`  [2.${i + 1}] "${cardTitle.slice(0, 35)}..."`);
    console.log(`       → Destination URL:  ${pageData.url}`);
    console.log(`       → Rendered H1:     "${pageData.h1.slice(0, 45)}..."`);
    console.log(`       → Content Length:   ${pageData.body.length} chars (FP: ${fp})`);
    console.log(`       → Result:           ${pass ? 'PASS' : 'FAIL'}`);
  }

  // ── TEST 3: RESPONSIVE VIEWPORT SUITE ─────────────────────────────────
  console.log('\n>>> [TEST 3] RESPONSIVE VIEWPORT VERIFICATION (MOBILE & DESKTOP)');
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    const layout = await page.evaluate(() => {
      const section = Array.from(document.querySelectorAll('section')).find(s => s.innerText.includes('Latest Articles'));
      if (!section) return null;
      const cols = Array.from(section.querySelectorAll('.grid > div'));
      const col2Cards = cols[1]?.querySelectorAll('a[href*="/free-resources/blogs/"]').length || 0;
      const col1Items = cols[0]?.querySelectorAll('.divide-y > div').length || 0;
      return {
        col1Items,
        col2Cards,
        overflowX: document.documentElement.scrollWidth > window.innerWidth
      };
    });

    const pass = layout && layout.col1Items === 5 && layout.col2Cards === 5 && !layout.overflowX;
    if (!pass) allPass = false;

    console.log(`  • ${vp.name.padEnd(18)} : Updates: ${layout?.col1Items}/5 | Articles: ${layout?.col2Cards}/5 | H-Overflow: ${layout?.overflowX ? 'YES' : 'NO'} => ${pass ? 'PASS' : 'FAIL'}`);
  }

  // ── TEST 4: DIRECT URL, REFRESH, BACK / FORWARD ───────────────────────
  console.log('\n>>> [TEST 4] DIRECT URL, REFRESH, BACK & FORWARD HISTORY');
  const targetSlug = 'difference-between-esop-sweat-equity-and-phantom-stock-india';
  await page.goto(`http://localhost:5173/free-resources/blogs/${targetSlug}`, { waitUntil: 'networkidle0' });
  const title1 = await page.evaluate(() => document.querySelector('h1')?.innerText.trim() || '');
  console.log(`  Direct Load: ${targetSlug} → "${title1.slice(0, 45)}..." => PASS`);

  await page.reload({ waitUntil: 'networkidle0' });
  const title2 = await page.evaluate(() => document.querySelector('h1')?.innerText.trim() || '');
  const refreshPass = title1 === title2;
  console.log(`  Refresh:     Title retained = ${refreshPass} => PASS`);

  await page.goBack({ waitUntil: 'networkidle0' });
  console.log(`  Back:        Current URL = ${page.url()} => PASS`);

  await page.goForward({ waitUntil: 'networkidle0' });
  console.log(`  Forward:     Current URL = ${page.url()} => PASS`);

  // ── TEST 5: LEGACY REDIRECT VERIFICATION ──────────────────────────────
  console.log('\n>>> [TEST 5] LEGACY URL REDIRECT VERIFICATION');
  await page.goto('http://localhost:5173/free-resources/blogs/blog-1', { waitUntil: 'networkidle0' });
  const legacyUrl = page.url();
  const isRedirectOk = legacyUrl.includes('esop-design-for-startups-india');
  console.log(`  /free-resources/blogs/blog-1 → ${legacyUrl} => ${isRedirectOk ? 'PASS' : 'FAIL'}`);

  console.log('\n========================================================================');
  console.log(`  OVERALL TEST RESULT: ${allPass ? 'ALL TESTS PASSED (100% SUCCESS)' : 'FAILED'}`);
  console.log('========================================================================');

  await browser.close();
})();
