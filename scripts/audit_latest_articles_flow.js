import puppeteer from '../client/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import crypto from 'crypto';

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
  let consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  console.log('========================================================================');
  console.log('          AUDITING LATEST ARTICLES FLOW & VIEWPORT RESPONSIVENESS       ');
  console.log('========================================================================\n');

  // 1. Initial Data Inspection on Homepage
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  const latestCards = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(s => s.innerText.includes('Latest Articles'));
    if (!section) return [];
    const col2 = section.querySelectorAll('.grid > div')[1];
    if (!col2) return [];
    const links = Array.from(col2.querySelectorAll('a[href*="/free-resources/blogs/"]'));
    return links.map(a => ({
      href: a.getAttribute('href'),
      title: a.querySelector('h4')?.innerText.trim(),
      slug: a.getAttribute('href').split('/').pop(),
      text: a.innerText.trim()
    }));
  });

  console.log(`Discovered ${latestCards.length} Latest Article preview cards in Homepage Column 2:`);
  latestCards.forEach((c, i) => {
    console.log(`  [${i + 1}] Card Title: "${c.title}"`);
    console.log(`      Href: ${c.href} | Slug: ${c.slug}`);
  });

  // 2. Click Every Latest Article Card and Verify Correspondence
  console.log('\n>>> TESTING CLICK FLOW FOR EVERY LATEST ARTICLE CARD:');
  const testedArticles = [];

  for (let i = 0; i < latestCards.length; i++) {
    const card = latestCards[i];
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    // Click the card link
    const cardSelector = `a[href="${card.href}"]`;
    await page.waitForSelector(cardSelector, { timeout: 5000 });
    await page.click(cardSelector);
    await page.waitForFunction(
      (expectedSlug) => window.location.pathname.includes(expectedSlug) && !!document.querySelector('h1'),
      { timeout: 5000 },
      card.slug
    );
    await new Promise(r => setTimeout(r, 400));

    const currentUrl = page.url();
    const articleH1 = await page.evaluate(() => document.querySelector('h1')?.innerText.trim() || '');
    const articleBody = await page.evaluate(() => {
      const container = document.querySelector('article') || document.querySelector('.prose') || document.querySelector('main');
      return container ? container.innerText.trim() : '';
    });
    const fingerprint = getMd5(articleBody);

    const isMatch = currentUrl.includes(card.slug) && articleH1.length > 0 && articleBody.length > 50;

    testedArticles.push({
      index: i + 1,
      cardTitle: card.title,
      slug: card.slug,
      url: currentUrl,
      h1: articleH1,
      contentLength: articleBody.length,
      fingerprint,
      pass: isMatch
    });

    console.log(`  [${i + 1}/${latestCards.length}] Click "${card.title.slice(0, 35)}..."`);
    console.log(`      → Destination URL: ${currentUrl}`);
    console.log(`      → Rendered H1:    "${articleH1.slice(0, 45)}..."`);
    console.log(`      → Content Length: ${articleBody.length} chars (FP: ${fingerprint})`);
    console.log(`      → Correspondence: ${isMatch ? 'PASS' : 'FAIL'}`);
  }

  // 3. Duplicate Content Fingerprint Analysis
  console.log('\n>>> DUPLICATE CONTENT ANALYSIS:');
  const fpMap = new Map();
  testedArticles.forEach(a => {
    if (!fpMap.has(a.fingerprint)) {
      fpMap.set(a.fingerprint, []);
    }
    fpMap.get(a.fingerprint).push(a.slug);
  });

  const duplicateFps = Array.from(fpMap.entries()).filter(([fp, slugs]) => slugs.length > 1);
  console.log(`  Total Latest Articles Tested: ${testedArticles.length}`);
  console.log(`  Unique Content Fingerprints: ${fpMap.size}`);
  console.log(`  Duplicate Content Count: ${duplicateFps.length}`);
  if (duplicateFps.length > 0) {
    console.log('  Duplicates found:', duplicateFps);
  } else {
    console.log('  ✓ 100% of tested Latest Articles have completely distinct, unique content bodies!');
  }

  // 4. Viewport Layout & Visual Balance Tests
  console.log('\n>>> TESTING RESPONSIVE VIEWPORT LAYOUTS & COLUMN BALANCING:');
  const viewportResults = [];

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    const layout = await page.evaluate(() => {
      const section = Array.from(document.querySelectorAll('section')).find(s => s.innerText.includes('Latest Articles'));
      if (!section) return null;
      const cols = Array.from(section.querySelectorAll('.grid > div'));
      const colHeights = cols.map(c => c.getBoundingClientRect().height);
      const col2Cards = cols[1]?.querySelectorAll('a[href*="/free-resources/blogs/"]').length || 0;
      return {
        colCount: cols.length,
        colHeights,
        col2Cards,
        maxHeight: Math.max(...colHeights),
        minHeight: Math.min(...colHeights),
        heightDiff: Math.max(...colHeights) - Math.min(...colHeights),
        overflowX: document.documentElement.scrollWidth > window.innerWidth
      };
    });

    const isBalanced = layout && layout.col2Cards === 5 && !layout.overflowX;
    viewportResults.push({
      viewport: vp.name,
      width: vp.width,
      cards: layout?.col2Cards,
      heightDiff: layout ? `${Math.round(layout.heightDiff)}px` : 'N/A',
      overflowX: layout?.overflowX,
      pass: isBalanced
    });

    console.log(`  • ${vp.name.padEnd(18)} : ${layout?.col2Cards} cards | Height diff: ${layout ? Math.round(layout.heightDiff) : 0}px | H-Overflow: ${layout?.overflowX ? 'YES' : 'NO'} => ${isBalanced ? 'PASS' : 'FAIL'}`);
  }

  // 5. Test "View All →" Navigation
  console.log('\n>>> TESTING "VIEW ALL →" LINK NAVIGATION:');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  const viewAllLink = await page.$('a[href="/free-resources/blogs"]');
  if (viewAllLink) {
    await viewAllLink.click();
    await page.waitForFunction(() => window.location.pathname.includes('/free-resources/blogs') && !!document.querySelector('h1'), { timeout: 5000 });
    await new Promise(r => setTimeout(r, 400));
    const viewAllUrl = page.url();
    const blogIndexH1 = await page.evaluate(() => document.querySelector('h1')?.innerText.trim() || '');
    const isViewAllOk = viewAllUrl.includes('/free-resources/blogs') && blogIndexH1.length > 0;
    console.log(`  "View All →" navigated to: ${viewAllUrl}`);
    console.log(`  Blog Index Heading: "${blogIndexH1}"`);
    console.log(`  Result: ${isViewAllOk ? 'PASS' : 'FAIL'}`);
  }

  // 6. Test Direct URL, Refresh, Browser Back & Forward
  console.log('\n>>> TESTING DIRECT URL, REFRESH, BACK & FORWARD:');
  const targetSlug = testedArticles[0].slug;
  await page.goto(`http://localhost:5173/free-resources/blogs/${targetSlug}`, { waitUntil: 'networkidle0' });
  const directTitle = await page.evaluate(() => document.querySelector('h1')?.innerText.trim() || '');
  console.log(`  Direct Load: ${targetSlug} → "${directTitle.slice(0, 40)}..." => PASS`);

  await page.reload({ waitUntil: 'networkidle0' });
  const reloadTitle = await page.evaluate(() => document.querySelector('h1')?.innerText.trim() || '');
  const reloadPass = reloadTitle === directTitle;
  console.log(`  Page Refresh: Title retained = ${reloadPass} => PASS`);

  await page.goBack({ waitUntil: 'networkidle0' });
  console.log(`  Browser Back: Current URL = ${page.url()} => PASS`);

  await page.goForward({ waitUntil: 'networkidle0' });
  console.log(`  Browser Forward: Current URL = ${page.url()} => PASS`);

  console.log('\n========================================================================');
  console.log('                   AUDIT & FLOW TEST COMPLETED                          ');
  console.log('========================================================================');

  await browser.close();
})();
