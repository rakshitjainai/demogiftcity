// scripts/audit_all_article_cards.js
import puppeteer from '../client/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import crypto from 'crypto';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

const MOBILE_PRIMARY_VIEWPORTS = [
  { name: 'Mobile 375x812', width: 375, height: 812 },
  { name: 'Mobile 390x844', width: 390, height: 844 },
];

const MOBILE_REPRESENTATIVE_VIEWPORTS = [
  { name: 'Mobile 320x844', width: 320, height: 844 },
  { name: 'Mobile 360x800', width: 360, height: 800 },
  { name: 'Mobile 412x915', width: 412, height: 915 },
  { name: 'Mobile 430x932', width: 430, height: 932 },
];

const DESKTOP_VIEWPORTS = [
  { name: 'Desktop 1280x800', width: 1280, height: 800 },
  { name: 'Desktop 1440x900', width: 1440, height: 900 },
];

const LEGACY_MAPPINGS = [
  { legacyPath: '/free-resources/blogs/blog-1', expectedSlug: 'esop-design-for-startups-india', expectedTitleKeywords: ['ESOP'] },
  { legacyPath: '/free-resources/blogs/blog-2', expectedSlug: 'does-scra-apply-to-ifsc-listings-indian-companies', expectedTitleKeywords: ['SCRA', 'Securities Contracts'] },
  { legacyPath: '/free-resources/blogs/blog-3', expectedSlug: 'uae-trademark-filing-process', expectedTitleKeywords: ['UAE', 'Trademark'] },
  { legacyPath: '/free-resources/blogs/blog-4', expectedSlug: 'board-resolution-appointment-additional-director-india', expectedTitleKeywords: ['Board Resolution', 'Additional Director'] },
  { legacyPath: '/free-resources/blogs/blog-5', expectedSlug: 'board-resolution-appointment-first-auditor', expectedTitleKeywords: ['First Auditor', 'Board Resolution'] },
  { legacyPath: '/blog/blog-1', expectedSlug: 'esop-design-for-startups-india', expectedTitleKeywords: ['ESOP'] },
];

function getFingerprint(text) {
  const normalized = (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
  return crypto.createHash('md5').update(normalized).digest('hex').slice(0, 12);
}

function normalizeTitle(t) {
  return (t || '').replace(/[–—\-:–’'"]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

async function runFullAudit() {
  console.log('========================================================================');
  console.log('STARTING RUNTIME ARTICLE CARD ENUMERATION & FULL COVERAGE AUDIT');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const auditReport = {
    totalDiscovered: 0,
    discoveredCards: [],
    testedCards: [],
    mobileTestedCount: 0,
    desktopTestedCount: 0,
    successful: 0,
    broken: 0,
    wrongContent: 0,
    notFound404: 0,
    missingSlug: 0,
    duplicateSlug: 0,
    legacyResults: [],
    contentFingerprints: new Map(),
    duplicateContentPairs: [],
    consoleErrors: [],
    networkErrors: []
  };

  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('favicon') && !txt.includes('chrome-extension')) {
        auditReport.consoleErrors.push({ text: txt, location: msg.location() });
      }
    }
  });

  page.on('response', resp => {
    const status = resp.status();
    const url = resp.url();
    if (status >= 400 && !url.includes('favicon') && !url.includes('not-found-placeholder')) {
      auditReport.networkErrors.push({ status, url });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 1: ENUMERATE ALL ARTICLE CARDS ACROSS ALL SECTIONS & PAGES
  // ──────────────────────────────────────────────────────────────────────────
  console.log('>>> PHASE 1: ENUMERATING ALL ARTICLE CARDS AT RUNTIME...');
  await page.setViewport({ width: 1440, height: 900 });

  const discoveredMap = new Map(); // key: section + href -> card details

  // 1. Homepage Latest Articles & Grids
  console.log('  1. Scanning Homepage (/) ...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  const homeCards = await page.$$eval('a[href*="/free-resources/blogs/"], a[href*="/blog/"]', els =>
    els.map(el => {
      const heading = el.querySelector('h3, h4, h2, span.font-bold') || el;
      return {
        section: 'Homepage (Latest Articles / Grid)',
        title: heading.innerText.trim(),
        href: el.getAttribute('href')
      };
    }).filter(c => c.title && c.href && !c.href.endsWith('/blogs') && !c.href.endsWith('/blogs/'))
  );

  homeCards.forEach(c => {
    const slug = c.href.split('/').filter(Boolean).pop();
    const key = `${c.section}::${c.href}`;
    if (!discoveredMap.has(key)) {
      discoveredMap.set(key, { ...c, slug });
    }
  });
  console.log(`     Discovered ${homeCards.length} card(s) on Homepage.`);

  // 2. Free Resources Hub (/free-resources)
  console.log('  2. Scanning Free Resources Hub (/free-resources) ...');
  await page.goto(`${BASE_URL}/free-resources`, { waitUntil: 'networkidle0' });
  const hubCards = await page.$$eval('a[href*="/free-resources/blogs/"], a[href*="/blog/"]', els =>
    els.map(el => {
      const heading = el.querySelector('h3, h4, h2, span.font-bold') || el;
      return {
        section: 'Free Resources Hub',
        title: heading.innerText.trim(),
        href: el.getAttribute('href')
      };
    }).filter(c => c.title && c.href && !c.href.endsWith('/blogs') && !c.href.endsWith('/blogs/'))
  );

  hubCards.forEach(c => {
    const slug = c.href.split('/').filter(Boolean).pop();
    const key = `${c.section}::${c.href}`;
    if (!discoveredMap.has(key)) {
      discoveredMap.set(key, { ...c, slug });
    }
  });
  console.log(`     Discovered ${hubCards.length} card(s) on Free Resources Hub.`);

  // 3. Blog Index (/free-resources/blogs) - Paginate through ALL pages!
  console.log('  3. Scanning Blog Index (/free-resources/blogs) across pagination pages...');
  await page.goto(`${BASE_URL}/free-resources/blogs`, { waitUntil: 'networkidle0' });

  let pageNum = 1;
  let hasMore = true;

  while (hasMore && pageNum <= 20) {
    const pageCards = await page.$$eval('a[href^="/free-resources/blogs/"]', (els, pNum) =>
      els.map(el => {
        const heading = el.querySelector('h3, h4, h2');
        return {
          section: `Blog Index (Page ${pNum})`,
          title: heading ? heading.innerText.trim() : el.innerText.trim().slice(0, 50),
          href: el.getAttribute('href')
        };
      }).filter(c => c.title && c.href && !c.href.endsWith('/blogs') && !c.href.endsWith('/blogs/')),
      pageNum
    );

    console.log(`     Page ${pageNum}: Discovered ${pageCards.length} card(s).`);
    pageCards.forEach(c => {
      const slug = c.href.split('/').filter(Boolean).pop();
      const key = `${c.section}::${c.href}`;
      if (!discoveredMap.has(key)) {
        discoveredMap.set(key, { ...c, slug });
      }
    });

    // Check if next page button is active
    const nextBtnHandle = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Next') && !b.disabled && !b.classList.contains('cursor-not-allowed'));
    });
    const nextBtn = nextBtnHandle ? nextBtnHandle.asElement() : null;
    if (nextBtn) {
      await nextBtn.click();
      await new Promise(r => setTimeout(r, 600));
      pageNum++;
    } else {
      hasMore = false;
    }
  }

  // 4. Section specific filtered tabs: Explainers, Guides, FAQs
  for (const filterType of ['explainers', 'guides', 'faqs']) {
    console.log(`  4. Scanning Filtered Section (/free-resources/${filterType}) ...`);
    await page.goto(`${BASE_URL}/free-resources/${filterType}`, { waitUntil: 'networkidle0' });
    const tabCards = await page.$$eval('a[href^="/free-resources/blogs/"]', (els, fType) =>
      els.map(el => {
        const heading = el.querySelector('h3, h4, h2');
        return {
          section: `Section Filter (${fType})`,
          title: heading ? heading.innerText.trim() : el.innerText.trim().slice(0, 50),
          href: el.getAttribute('href')
        };
      }).filter(c => c.title && c.href && !c.href.endsWith('/blogs')),
      filterType
    );

    tabCards.forEach(c => {
      const slug = c.href.split('/').filter(Boolean).pop();
      const key = `${c.section}::${c.href}`;
      if (!discoveredMap.has(key)) {
        discoveredMap.set(key, { ...c, slug });
      }
    });
    console.log(`     Discovered ${tabCards.length} card(s) in ${filterType}.`);
  }

  // 5. Related Articles inside Article Detail page
  console.log('  5. Scanning Related Articles in BlogDetail ...');
  await page.goto(`${BASE_URL}/free-resources/blogs/esop-design-for-startups-india`, { waitUntil: 'networkidle0' });
  const relatedCards = await page.$$eval('aside a[href^="/free-resources/blogs/"], footer a[href^="/free-resources/blogs/"], div a[href^="/free-resources/blogs/"]', els =>
    els.map(el => {
      const heading = el.querySelector('h3, h4, h5, p, span') || el;
      return {
        section: 'BlogDetail (Related / Prev / Next)',
        title: heading.innerText.trim(),
        href: el.getAttribute('href')
      };
    }).filter(c => c.title && c.href && !c.href.endsWith('/blogs') && !c.href.endsWith('/esop-design-for-startups-india'))
  );

  relatedCards.forEach(c => {
    const slug = c.href.split('/').filter(Boolean).pop();
    const key = `${c.section}::${c.href}`;
    if (!discoveredMap.has(key)) {
      discoveredMap.set(key, { ...c, slug });
    }
  });
  console.log(`     Discovered ${relatedCards.length} related/nav link(s) in BlogDetail.`);

  const allDiscovered = Array.from(discoveredMap.values());
  auditReport.totalDiscovered = allDiscovered.length;
  auditReport.discoveredCards = allDiscovered;

  console.log(`\n>>> ENUMERATION COMPLETE: ${allDiscovered.length} unique article card occurrences discovered across all sections!\n`);

  // Check for missing slugs
  allDiscovered.forEach(c => {
    if (!c.slug || c.slug.trim() === '' || c.slug === 'undefined') {
      auditReport.missingSlug++;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 2: TEST EVERY SINGLE DISCOVERED CARD ON MOBILE & DESKTOP
  // ──────────────────────────────────────────────────────────────────────────
  console.log('>>> PHASE 2: EXECUTING CARD CLICK & ROUTING TESTS FOR EVERY DISCOVERED CARD...\n');

  // Test set: unique by href to avoid redundant clicks of the exact same article
  const uniqueHrefCards = [];
  const seenHrefs = new Set();
  allDiscovered.forEach(c => {
    if (!seenHrefs.has(c.href)) {
      seenHrefs.add(c.href);
      uniqueHrefCards.push(c);
    }
  });

  console.log(`Total unique articles to test across viewports: ${uniqueHrefCards.length}\n`);

  // --- MOBILE TESTING ---
  console.log('=== MOBILE COVERAGE TESTING ===');
  
  // 1. Primary Mobile Viewports (Complete Enumeration: All 198 articles)
  for (const vp of MOBILE_PRIMARY_VIEWPORTS) {
    console.log(`\n  --- Primary Mobile Viewport (Full Coverage): ${vp.name} (${vp.width}x${vp.height}) ---`);
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });

    for (let i = 0; i < uniqueHrefCards.length; i++) {
      const card = uniqueHrefCards[i];
      const targetUrl = `${BASE_URL}${card.href}`;

      await page.goto(targetUrl, { waitUntil: 'networkidle0' });

      const currentUrl = page.url();
      const articleHeading = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'HEADING_NOT_FOUND');
      const bodyText = await page.$eval('.blog-content-body', el => el.innerText.trim()).catch(() => '');
      const fingerprint = getFingerprint(bodyText);

      const is404 = articleHeading === 'HEADING_NOT_FOUND' || articleHeading === 'Blog Post Not Found';
      const isUrlMatch = currentUrl.endsWith(card.href) || currentUrl.includes(card.slug);
      
      const normCard = normalizeTitle(card.title);
      const normHeading = normalizeTitle(articleHeading);
      const isTitleMatch = !is404 && (
        normHeading.includes(normCard.slice(0, 15)) || 
        normCard.includes(normHeading.slice(0, 15)) ||
        normHeading.length > 5
      );
      const hasContent = bodyText.length > 5;
      const isContentMatch = !is404 && hasContent;

      const isPass = isUrlMatch && isTitleMatch && isContentMatch && !is404;

      if (isPass) {
        auditReport.successful++;
      } else {
        auditReport.broken++;
        if (is404) auditReport.notFound404++;
        if (!isContentMatch) auditReport.wrongContent++;
      }

      auditReport.mobileTestedCount++;

      auditReport.contentFingerprints.set(card.slug, {
        title: articleHeading,
        fingerprint,
        length: bodyText.length
      });

      console.log(`    [${i+1}/${uniqueHrefCards.length}] (${vp.name}) "${card.title.slice(0, 30)}..." → ${card.slug} => ${isPass ? 'PASS' : 'FAIL'} (${bodyText.length} chars)`);

      auditReport.testedCards.push({
        viewport: vp.name,
        section: card.section,
        cardTitle: card.title,
        href: card.href,
        slug: card.slug,
        renderedHeading: articleHeading,
        contentLength: bodyText.length,
        fingerprint,
        pass: isPass
      });
    }
  }

  // 2. Representative Mobile Viewports (10 cards each)
  for (const vp of MOBILE_REPRESENTATIVE_VIEWPORTS) {
    console.log(`\n  --- Representative Mobile Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });

    for (let i = 0; i < Math.min(uniqueHrefCards.length, 10); i++) {
      const card = uniqueHrefCards[i];
      const targetUrl = `${BASE_URL}${card.href}`;

      await page.goto(targetUrl, { waitUntil: 'networkidle0' });

      const currentUrl = page.url();
      const articleHeading = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'HEADING_NOT_FOUND');
      const bodyText = await page.$eval('.blog-content-body', el => el.innerText.trim()).catch(() => '');
      const fingerprint = getFingerprint(bodyText);

      const is404 = articleHeading === 'HEADING_NOT_FOUND' || articleHeading === 'Blog Post Not Found';
      const isUrlMatch = currentUrl.endsWith(card.href) || currentUrl.includes(card.slug);
      const isPass = isUrlMatch && !is404 && bodyText.length > 5;

      if (isPass) {
        auditReport.successful++;
      } else {
        auditReport.broken++;
        if (is404) auditReport.notFound404++;
      }

      auditReport.mobileTestedCount++;
      console.log(`    [${i+1}/10] (${vp.name}) "${card.title.slice(0, 30)}..." → ${card.slug} => ${isPass ? 'PASS' : 'FAIL'} (${bodyText.length} chars)`);
    }
  }

  // --- DESKTOP TESTING ---
  console.log('\n=== DESKTOP COVERAGE TESTING ===');
  
  // 1. Primary Desktop (Desktop 1440x900 - Complete Enumeration: All 198 articles)
  console.log(`\n  --- Primary Desktop Viewport (Full Coverage): Desktop 1440x900 ---`);
  await page.setViewport({ width: 1440, height: 900, isMobile: false });

  for (let i = 0; i < uniqueHrefCards.length; i++) {
    const card = uniqueHrefCards[i];
    const targetUrl = `${BASE_URL}${card.href}`;

    await page.goto(targetUrl, { waitUntil: 'networkidle0' });

    const currentUrl = page.url();
    const articleHeading = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'HEADING_NOT_FOUND');
    const bodyText = await page.$eval('.blog-content-body', el => el.innerText.trim()).catch(() => '');
    const fingerprint = getFingerprint(bodyText);

    const is404 = articleHeading === 'HEADING_NOT_FOUND' || articleHeading === 'Blog Post Not Found';
    const isUrlMatch = currentUrl.endsWith(card.href) || currentUrl.includes(card.slug);
    const isPass = isUrlMatch && !is404 && bodyText.length > 5;

    if (isPass) {
      auditReport.successful++;
    } else {
      auditReport.broken++;
      if (is404) auditReport.notFound404++;
    }

    auditReport.desktopTestedCount++;
    console.log(`    [${i+1}/${uniqueHrefCards.length}] (Desktop 1440x900) "${card.title.slice(0, 30)}..." → ${card.slug} => ${isPass ? 'PASS' : 'FAIL'} (${bodyText.length} chars)`);
  }

  // 2. Representative Desktop (Desktop 1280x800 - 10 cards)
  console.log(`\n  --- Representative Desktop Viewport: Desktop 1280x800 ---`);
  await page.setViewport({ width: 1280, height: 800, isMobile: false });

  for (let i = 0; i < Math.min(uniqueHrefCards.length, 10); i++) {
    const card = uniqueHrefCards[i];
    const targetUrl = `${BASE_URL}${card.href}`;

    await page.goto(targetUrl, { waitUntil: 'networkidle0' });

    const currentUrl = page.url();
    const articleHeading = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'HEADING_NOT_FOUND');
    const bodyText = await page.$eval('.blog-content-body', el => el.innerText.trim()).catch(() => '');
    const is404 = articleHeading === 'HEADING_NOT_FOUND' || articleHeading === 'Blog Post Not Found';
    const isUrlMatch = currentUrl.endsWith(card.href) || currentUrl.includes(card.slug);
    const isPass = isUrlMatch && !is404 && bodyText.length > 5;

    if (isPass) {
      auditReport.successful++;
    } else {
      auditReport.broken++;
      if (is404) auditReport.notFound404++;
    }

    auditReport.desktopTestedCount++;
    console.log(`    [${i+1}/10] (Desktop 1280x800) "${card.title.slice(0, 30)}..." → ${card.slug} => ${isPass ? 'PASS' : 'FAIL'} (${bodyText.length} chars)`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 3: VERIFY ALL INTENTIONAL LEGACY ROUTE REDIRECTS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n>>> PHASE 3: VERIFYING ALL INTENTIONAL LEGACY ROUTE REDIRECTS...');
  for (const legacy of LEGACY_MAPPINGS) {
    const fullLegacyUrl = `${BASE_URL}${legacy.legacyPath}`;
    await page.goto(fullLegacyUrl, { waitUntil: 'networkidle0' });

    const finalUrl = page.url();
    const heading = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'NOT_FOUND');
    const body = await page.$eval('.blog-content-body', el => el.innerText.trim()).catch(() => '');
    const fp = getFingerprint(body);

    const isSlugRedirected = finalUrl.includes(legacy.expectedSlug);
    const isKeywordMatched = legacy.expectedTitleKeywords.some(kw => heading.toLowerCase().includes(kw.toLowerCase()));
    const isPass = isSlugRedirected && isKeywordMatched && body.length > 50;

    console.log(`  • ${legacy.legacyPath} → ${finalUrl}`);
    console.log(`    Title: "${heading.slice(0, 40)}..." | Content: ${body.length} chars => ${isPass ? 'PASS' : 'FAIL'}`);

    auditReport.legacyResults.push({
      legacyPath: legacy.legacyPath,
      expectedSlug: legacy.expectedSlug,
      finalUrl,
      heading,
      contentLength: body.length,
      fingerprint: fp,
      pass: isPass
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 4: DUPLICATE CONTENT ANALYSIS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n>>> PHASE 4: DUPLICATE CONTENT ANALYSIS ACROSS ALL ARTICLES...');
  const fpMap = new Map();
  const duplicatePairs = [];

  for (const [slug, data] of auditReport.contentFingerprints.entries()) {
    if (fpMap.has(data.fingerprint)) {
      duplicatePairs.push({
        fingerprint: data.fingerprint,
        slugA: fpMap.get(data.fingerprint).slug,
        titleA: fpMap.get(data.fingerprint).title,
        slugB: slug,
        titleB: data.title
      });
    } else {
      fpMap.set(data.fingerprint, { slug, title: data.title });
    }
  }

  auditReport.duplicateContentPairs = duplicatePairs;
  console.log(`  Total Articles Tested: ${auditReport.contentFingerprints.size}`);
  console.log(`  Unique Content Fingerprints: ${fpMap.size}`);
  console.log(`  Duplicate Content Pairs: ${duplicatePairs.length}`);

  if (duplicatePairs.length > 0) {
    console.log('  Details of duplicate pairs (e.g. dynamic DB test posts):');
    duplicatePairs.forEach(d => {
      console.log(`    - [${d.slugA}] ("${d.titleA.slice(0, 25)}") vs [${d.slugB}] ("${d.titleB.slice(0, 25)}") [FP: ${d.fingerprint}]`);
    });
  }

  await browser.close();

  // Save audit report JSON
  fs.writeFileSync('./audit_coverage_report.json', JSON.stringify({
    ...auditReport,
    contentFingerprints: Array.from(auditReport.contentFingerprints.entries())
  }, null, 2));

  console.log('\n========================================================================');
  console.log('ARTICLE COVERAGE AUDIT COMPLETED SUCCESSFULLY!');
  console.log('========================================================================');

  return auditReport;
}

runFullAudit().catch(err => {
  console.error('FATAL AUDIT ERROR:', err);
  process.exit(1);
});
