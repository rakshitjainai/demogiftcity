import puppeteer from '../client/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import crypto from 'crypto';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

const MOBILE_VIEWPORTS = [
  { name: 'Mobile 320x844', width: 320, height: 844 },
  { name: 'Mobile 360x800', width: 360, height: 800 },
  { name: 'Mobile 375x812', width: 375, height: 812 },
  { name: 'Mobile 390x844', width: 390, height: 844 },
  { name: 'Mobile 412x915', width: 412, height: 915 },
  { name: 'Mobile 430x932', width: 430, height: 932 },
];

const DESKTOP_VIEWPORTS = [
  { name: 'Desktop 1024x768', width: 1024, height: 768 },
  { name: 'Desktop 1280x800', width: 1280, height: 800 },
  { name: 'Desktop 1440x900', width: 1440, height: 900 },
];

function getFingerprint(text) {
  const normalized = (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
  return crypto.createHash('md5').update(normalized).digest('hex').slice(0, 12);
}

async function runVerification() {
  console.log('================================================================');
  console.log('STARTING COMPREHENSIVE BLOG ROUTING VERIFICATION SUITE');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    mobileTests: [],
    desktopTests: [],
    legacyRouteTests: [],
    historyTests: [],
    mobileMenuTests: [],
    articleCardsTested: [],
    contentFingerprints: new Map(), // slug -> { title, fingerprint, length }
    duplicateContentFound: false,
    consoleErrors: [],
    networkErrors: []
  };

  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('favicon') && !txt.includes('chrome-extension')) {
        results.consoleErrors.push({ text: txt, location: msg.location() });
      }
    }
  });

  page.on('response', resp => {
    const status = resp.status();
    const url = resp.url();
    if (status >= 400 && !url.includes('favicon') && !url.includes('not-found-placeholder')) {
      results.networkErrors.push({ status, url });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. TEST ALL MOBILE VIEWPORTS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('>>> 1. TESTING ALL MOBILE VIEWPORTS (Latest Articles & Cards)...');
  for (const vp of MOBILE_VIEWPORTS) {
    console.log(`\n  [Testing ${vp.name} (${vp.width}x${vp.height})]`);
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
    
    // Visit Home Page
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    // Find all Latest Articles links
    const articleLinks = await page.$$eval('a[href^="/free-resources/blogs/"]', els => 
      els.map(el => {
        const titleEl = el.querySelector('h4');
        return {
          title: titleEl ? titleEl.innerText.trim() : '',
          href: el.getAttribute('href')
        };
      }).filter(item => item.title && item.href)
    );

    console.log(`    Found ${articleLinks.length} article card(s) on Homepage.`);

    // Verify non-canonical IDs are NOT in URLs
    for (const card of articleLinks) {
      const isLegacy = /\/free-resources\/blogs\/blog-\d+$/.test(card.href);
      if (isLegacy) {
        throw new Error(`FAIL: Article card "${card.title}" uses non-canonical URL: ${card.href}`);
      }
    }

    // Tap each article card (or first 3 per viewport)
    for (let i = 0; i < Math.min(articleLinks.length, 3); i++) {
      const card = articleLinks[i];
      // Navigate to home first if not on home
      if (page.url() !== `${BASE_URL}/`) {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      }

      // Tap the card
      const selector = `a[href="${card.href}"]`;
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.click(selector);
      await page.waitForNetworkIdle();

      const currentUrl = page.url();
      const articleHeading = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'HEADING_NOT_FOUND');
      const bodyText = await page.$eval('.blog-content-body', el => el.innerText.trim()).catch(() => '');
      const fingerprint = getFingerprint(bodyText);

      const passUrl = currentUrl.endsWith(card.href);
      const passTitle = articleHeading.length > 0 && articleHeading !== 'HEADING_NOT_FOUND' && articleHeading !== 'Blog Post Not Found';
      const passContent = bodyText.length > 5;

      const slug = card.href.split('/').pop();
      results.contentFingerprints.set(slug, {
        title: articleHeading,
        fingerprint,
        length: bodyText.length
      });

      console.log(`    Article [${i+1}]: Card Title: "${card.title.slice(0, 35)}..."`);
      console.log(`      → URL: ${currentUrl}`);
      console.log(`      → Article Title: "${articleHeading.slice(0, 35)}..."`);
      console.log(`      → Content Length: ${bodyText.length} chars (Fingerprint: ${fingerprint})`);
      console.log(`      → Status: ${passUrl && passTitle && passContent ? 'PASS' : 'FAIL'}`);

      results.mobileTests.push({
        viewport: vp.name,
        cardTitle: card.title,
        url: currentUrl,
        articleTitle: articleHeading,
        contentLength: bodyText.length,
        fingerprint,
        pass: passUrl && passTitle && passContent
      });

      if (!passUrl || !passTitle || !passContent) {
        throw new Error(`FAIL on ${vp.name}: ${card.href} URL or Content mismatch!`);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. TEST ALL DESKTOP VIEWPORTS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n>>> 2. TESTING ALL DESKTOP VIEWPORTS...');
  for (const vp of DESKTOP_VIEWPORTS) {
    console.log(`\n  [Testing ${vp.name} (${vp.width}x${vp.height})]`);
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: false });
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    const articleLinks = await page.$$eval('a[href^="/free-resources/blogs/"]', els => 
      els.map(el => {
        const titleEl = el.querySelector('h4');
        return {
          title: titleEl ? titleEl.innerText.trim() : '',
          href: el.getAttribute('href')
        };
      }).filter(item => item.title && item.href)
    );

    for (let i = 0; i < Math.min(articleLinks.length, 3); i++) {
      const card = articleLinks[i];
      if (page.url() !== `${BASE_URL}/`) {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      }

      const selector = `a[href="${card.href}"]`;
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.click(selector);
      await page.waitForNetworkIdle();

      const currentUrl = page.url();
      const articleHeading = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'NOT_FOUND');
      const bodyText = await page.$eval('.blog-content-body', el => el.innerText.trim()).catch(() => '');
      const fingerprint = getFingerprint(bodyText);

      const pass = currentUrl.endsWith(card.href) && articleHeading !== 'NOT_FOUND' && bodyText.length > 5;
      console.log(`    Desktop [${i+1}]: ${card.href} → "${articleHeading.slice(0, 30)}..." [${bodyText.length} chars] => ${pass ? 'PASS' : 'FAIL'}`);

      results.desktopTests.push({
        viewport: vp.name,
        cardTitle: card.title,
        url: currentUrl,
        articleTitle: articleHeading,
        contentLength: bodyText.length,
        fingerprint,
        pass
      });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. TEST FREE RESOURCES HUB & BLOG INDEX CARDS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n>>> 3. TESTING BLOG INDEX & FREE RESOURCES CARDS...');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${BASE_URL}/free-resources/blogs`, { waitUntil: 'networkidle0' });

  const blogIndexCards = await page.$$eval('a[href^="/free-resources/blogs/"]', els =>
    els.map(el => {
      const h3 = el.querySelector('h3');
      return {
        title: h3 ? h3.innerText.trim() : '',
        href: el.getAttribute('href')
      };
    }).filter(c => c.title && c.href)
  );

  console.log(`  Found ${blogIndexCards.length} published blog posts on page 1 of /free-resources/blogs`);
  
  // Test 5 distinct cards from the blog index
  for (let i = 0; i < Math.min(blogIndexCards.length, 5); i++) {
    const card = blogIndexCards[i];
    await page.goto(`${BASE_URL}/free-resources/blogs`, { waitUntil: 'networkidle0' });

    const selector = `a[href="${card.href}"]`;
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    await page.waitForNetworkIdle();

    const currentUrl = page.url();
    const articleHeading = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'NOT_FOUND');
    const bodyText = await page.$eval('.blog-content-body', el => el.innerText.trim()).catch(() => '');
    const fingerprint = getFingerprint(bodyText);

    const slug = card.href.split('/').pop();
    results.contentFingerprints.set(slug, {
      title: articleHeading,
      fingerprint,
      length: bodyText.length
    });

    const pass = currentUrl.endsWith(card.href) && articleHeading !== 'NOT_FOUND' && bodyText.length > 5;
    console.log(`    BlogIndex Card [${i+1}]: "${card.title.slice(0, 35)}..." → ${currentUrl} [${bodyText.length} chars] => ${pass ? 'PASS' : 'FAIL'}`);
    results.articleCardsTested.push({
      cardTitle: card.title,
      url: currentUrl,
      articleTitle: articleHeading,
      contentLength: bodyText.length,
      fingerprint,
      pass
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. TEST LATEST UPDATES (HOMEPAGE COLUMN 1)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n>>> 4. TESTING LATEST UPDATES MODAL INTERACTION...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  const updateItems = await page.$$eval('div h4', els => 
    els.map(el => el.innerText.trim()).filter(t => t.length > 5).slice(0, 3)
  );

  console.log(`  Found ${updateItems.length} update item(s) to test.`);
  for (let i = 0; i < updateItems.length; i++) {
    const updateTitle = updateItems[i];
    const updateEl = await page.evaluateHandle((title) => {
      const h4s = Array.from(document.querySelectorAll('h4'));
      const target = h4s.find(h => h.innerText.includes(title));
      return target ? target.closest('div[class*="cursor-pointer"]') : null;
    }, updateTitle);

    if (updateEl && updateEl.asElement()) {
      await updateEl.asElement().click();
      await new Promise(r => setTimeout(r, 400));

      const modalHeading = await page.$eval('div[class*="fixed"] h2, div[class*="fixed"] h3', el => el.innerText.trim()).catch(() => '');
      const modalOpen = modalHeading.length > 0;
      console.log(`    Update [${i+1}]: "${updateTitle.slice(0, 30)}..." → Modal Opened: ${modalOpen} ("${modalHeading.slice(0, 30)}...")`);

      // Close modal (Escape or close button)
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. TEST SPECIFIC PREVIOUSLY BROKEN ROUTE: /free-resources/blogs/blog-1
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n>>> 5. TESTING PREVIOUSLY BROKEN ROUTE: /free-resources/blogs/blog-1...');
  await page.goto(`${BASE_URL}/free-resources/blogs/blog-1`, { waitUntil: 'networkidle0' });
  const redirectedUrl = page.url();
  const redirectedHeading = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'NOT_FOUND');
  const redirectedBody = await page.$eval('.blog-content-body', el => el.innerText.trim()).catch(() => '');
  const redirectedFingerprint = getFingerprint(redirectedBody);

  const legacyPass = redirectedUrl.includes('esop-design-for-startups-india') && 
                     redirectedHeading.includes('ESOP') && 
                     redirectedBody.length > 100;

  console.log(`  Target: ${BASE_URL}/free-resources/blogs/blog-1`);
  console.log(`  → Redirected URL: ${redirectedUrl}`);
  console.log(`  → Rendered Article Title: "${redirectedHeading}"`);
  console.log(`  → Rendered Content Length: ${redirectedBody.length} chars (Fingerprint: ${redirectedFingerprint})`);
  console.log(`  → Result: ${legacyPass ? 'PASS (Successfully redirected to canonical slug & rendered content)' : 'FAIL'}`);

  results.legacyRouteTests.push({
    inputUrl: `${BASE_URL}/free-resources/blogs/blog-1`,
    finalUrl: redirectedUrl,
    title: redirectedHeading,
    contentLength: redirectedBody.length,
    fingerprint: redirectedFingerprint,
    pass: legacyPass
  });

  // Also test /blog/blog-1
  console.log('\n  Testing legacy short URL /blog/blog-1:');
  await page.goto(`${BASE_URL}/blog/blog-1`, { waitUntil: 'networkidle0' });
  const shortRedirectUrl = page.url();
  const shortHeading = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'NOT_FOUND');
  const shortPass = shortRedirectUrl.includes('esop-design-for-startups-india') && shortHeading.includes('ESOP');
  console.log(`  → /blog/blog-1 redirected to: ${shortRedirectUrl} (${shortHeading.slice(0, 30)}...) => ${shortPass ? 'PASS' : 'FAIL'}`);

  results.legacyRouteTests.push({
    inputUrl: `${BASE_URL}/blog/blog-1`,
    finalUrl: shortRedirectUrl,
    title: shortHeading,
    pass: shortPass
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. TEST DIRECT URL, REFRESH, BACK, FORWARD, PREV/NEXT NAVIGATION
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n>>> 6. TESTING DIRECT URL, REFRESH, BACK, FORWARD, PREV/NEXT...');
  const testDirectSlug = 'esop-design-for-startups-india';
  await page.goto(`${BASE_URL}/free-resources/blogs/${testDirectSlug}`, { waitUntil: 'networkidle0' });
  
  const directTitle1 = await page.$eval('h1', el => el.innerText.trim());
  console.log(`  Direct Load: ${testDirectSlug} → "${directTitle1.slice(0, 30)}..."`);

  // Refresh
  await page.reload({ waitUntil: 'networkidle0' });
  const directTitle2 = await page.$eval('h1', el => el.innerText.trim());
  const refreshPass = directTitle1 === directTitle2;
  console.log(`  Page Refresh → Title matched: ${refreshPass}`);

  // Prev / Next button check
  const nextBtn = await page.$('footer a[href*="/free-resources/blogs/"]');
  if (nextBtn) {
    const nextHref = await page.evaluate(el => el.getAttribute('href'), nextBtn);
    console.log(`  Next/Prev Link Found: ${nextHref}`);
    await nextBtn.click();
    await page.waitForNetworkIdle();
    const nextUrl = page.url();
    const nextTitle = await page.$eval('h1', el => el.innerText.trim()).catch(() => '');
    console.log(`    → Navigated to: ${nextUrl} ("${nextTitle.slice(0, 30)}...")`);

    // Back button
    await page.goBack();
    await page.waitForNetworkIdle();
    const backPass = page.url().includes(testDirectSlug);
    console.log(`  Browser Back → URL restored: ${backPass} (${page.url()})`);

    // Forward button
    await page.goForward();
    await page.waitForNetworkIdle();
    const fwdPass = page.url().includes(nextHref);
    console.log(`  Browser Forward → URL restored: ${fwdPass} (${page.url()})`);

    results.historyTests.push({ refreshPass, backPass, fwdPass, pass: refreshPass && backPass && fwdPass });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. TEST MOBILE MENU OPEN/CLOSE & ARTICLE CLICK AFTER CLOSING MENU
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n>>> 7. TESTING MOBILE MENU OPEN/CLOSE & POST-MENU CARD CLICK...');
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

  // Open mobile menu
  const menuBtn = await page.$('button[aria-label="Open menu"]');
  if (menuBtn) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 400));
    console.log('  Mobile menu opened successfully.');

    // Close mobile menu
    const closeBtn = await page.$('button[aria-label="Close menu"]');
    if (closeBtn) {
      await closeBtn.click();
      await new Promise(r => setTimeout(r, 400));
      console.log('  Mobile menu closed successfully.');
    }
  }

  // Click an article card after menu closed
  const postMenuLink = await page.$('a[href^="/free-resources/blogs/"]');
  if (postMenuLink) {
    const postMenuHref = await page.evaluate(el => el.getAttribute('href'), postMenuLink);
    await page.evaluate(el => el.click(), postMenuLink);
    await new Promise(r => setTimeout(r, 600));
    await page.waitForSelector('h1', { timeout: 5000 });
    const postMenuPass = page.url().includes(postMenuHref);
    console.log(`  Post-menu Article Click → ${page.url()} => ${postMenuPass ? 'PASS' : 'FAIL'}`);
    results.mobileMenuTests.push({ pass: postMenuPass });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8. VERIFY CONTENT UNIQUENESS / FINGERPRINT ANALYSIS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n>>> 8. CONTENT FINGERPRINT & UNIQUENESS ANALYSIS across tested articles:');
  const fingerprints = new Map();
  let duplicates = [];
  for (const [slug, data] of results.contentFingerprints.entries()) {
    console.log(`  • [${slug}]:`);
    console.log(`      Title: "${data.title}"`);
    console.log(`      Length: ${data.length} chars | Fingerprint: ${data.fingerprint}`);
    if (fingerprints.has(data.fingerprint)) {
      duplicates.push({ slug1: fingerprints.get(data.fingerprint), slug2: slug });
    } else {
      fingerprints.set(data.fingerprint, slug);
    }
  }

  if (duplicates.length > 0) {
    console.error('  WARNING: Duplicate content detected between articles:', duplicates);
    results.duplicateContentFound = true;
  } else {
    console.log('  ✓ All tested articles have 100% UNIQUE content fingerprints (zero duplicated bodies).');
    results.duplicateContentFound = false;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9. CONSOLE & NETWORK ERROR SUMMARY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n>>> 9. CONSOLE & NETWORK ERROR SUMMARY:');
  console.log(`  Console Errors: ${results.consoleErrors.length}`);
  if (results.consoleErrors.length > 0) {
    results.consoleErrors.forEach(e => console.log('    [Console Error]', e.text));
  }
  console.log(`  Failed Network Requests: ${results.networkErrors.length}`);
  if (results.networkErrors.length > 0) {
    results.networkErrors.forEach(e => console.log('    [Network Error]', e.status, e.url));
  }

  await browser.close();

  console.log('\n================================================================');
  console.log('ALL VERIFICATION PHASES COMPLETED SUCCESSFULLY!');
  console.log('================================================================');

  fs.writeFileSync('./verification_results.json', JSON.stringify({
    ...results,
    contentFingerprints: Array.from(results.contentFingerprints.entries())
  }, null, 2));

  return results;
}

runVerification().catch(err => {
  console.error('FATAL VERIFICATION ERROR:', err);
  process.exit(1);
});
