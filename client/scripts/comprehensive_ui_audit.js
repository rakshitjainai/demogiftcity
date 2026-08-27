import puppeteer from 'puppeteer';

const BASE_URL = process.argv[2] || 'http://localhost:5173';

const VIEWPORTS = {
  mobile_small: { name: 'Phone - iPhone SE / Compact (320x568)', width: 320, height: 568, isMobile: true },
  mobile_standard: { name: 'Phone - iPhone 14 / Modern (390x844)', width: 390, height: 844, isMobile: true },
  mobile_large: { name: 'Phone - Android Pixel 7 / Large (412x915)', width: 412, height: 915, isMobile: true },
  laptop_compact: { name: 'Laptop - 13" MacBook / Laptop (1280x800)', width: 1280, height: 800, isMobile: false },
  laptop_standard: { name: 'Laptop - 15" / 16" Standard (1440x900)', width: 1440, height: 900, isMobile: false }
};

const ROUTES = [
  { name: 'Home Page', path: '/' },
  { name: 'Public Blog Index', path: '/free-resources/blogs' },
  { name: 'Article Detail Page', path: '/free-resources/blogs/how-art-shapes-the-way-we-experience-everyday-life' },
  { name: 'RegLearn Hub', path: '/learn' },
  { name: 'RegTools Hub', path: '/tools' },
  { name: 'RegPractice Hub', path: '/practice' },
  { name: 'RegReady / Prepare Hub', path: '/prepare' },
  { name: 'RegIntel Hub', path: '/regintel' },
  { name: 'Admin Dashboard / CMS', path: '/admin', requiresAuth: true },
  { name: 'Admin Create Article CMS', path: '/admin/blogs/create', requiresAuth: true }
];

async function runUIAudit() {
  console.log('================================================================');
  console.log('📱 💻 STARTING COMPREHENSIVE PHONE & LAPTOP UI / UX AUDIT');
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[${page.url()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`[${page.url()}] Uncaught Page Error: ${err.message}`);
  });

  // Setup admin auth token
  const adminToken = 'audit_token_' + Date.now();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('adminToken', token);
    localStorage.setItem('user', JSON.stringify({ name: 'UI Auditor', role: 'admin', email: 'admin@regmate.com' }));
  }, adminToken);

  const findings = [];

  for (const [vpKey, vp] of Object.entries(VIEWPORTS)) {
    console.log(`\n================================================================`);
    console.log(`🔍 AUDITING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`================================================================`);

    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile
    });

    for (const route of ROUTES) {
      const fullUrl = `${BASE_URL}${route.path}`;
      try {
        await page.goto(fullUrl, { waitUntil: 'networkidle0', timeout: 15000 });
        await new Promise(r => setTimeout(r, 400));

        // Evaluate UI metrics
        const auditResult = await page.evaluate((vpWidth, vpHeight, isMobile) => {
          const body = document.body;
          const html = document.documentElement;

          // 1. Horizontal scroll overflow check
          const scrollWidth = Math.max(body.scrollWidth, html.scrollWidth, document.documentElement.offsetWidth);
          const hasHorizontalOverflow = scrollWidth > (vpWidth + 1); // 1px threshold for subpixel rounding

          // Find specific overflowing elements
          const overflowingElements = [];
          if (hasHorizontalOverflow) {
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.right > vpWidth + 2 && rect.width > 0) {
                const tag = el.tagName.toLowerCase();
                const cls = (el.className && typeof el.className === 'string') ? el.className.split(' ').slice(0, 3).join('.') : '';
                const id = el.id ? `#${el.id}` : '';
                overflowingElements.push(`${tag}${id}${cls ? '.' + cls : ''} (right: ${Math.round(rect.right)}px, width: ${Math.round(rect.width)}px)`);
              }
            });
          }

          // 2. Broken image check
          const images = Array.from(document.querySelectorAll('img'));
          const brokenImages = images
            .filter(img => img.src && !img.src.startsWith('data:') && (!img.complete || img.naturalWidth === 0))
            .map(img => img.src.substring(0, 80));

          // 3. Touch target check on mobile (<32px)
          const tinyTouchTargets = [];
          if (isMobile) {
            const clickables = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]'));
            clickables.forEach(el => {
              const rect = el.getBoundingClientRect();
              // Check if visible
              if (rect.width > 0 && rect.height > 0 && el.offsetParent !== null) {
                if (rect.width < 28 || rect.height < 28) {
                  const text = (el.innerText || el.getAttribute('aria-label') || el.title || el.tagName).trim().substring(0, 20);
                  tinyTouchTargets.push(`"${text}" (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
                }
              }
            });
          }

          // 4. Header & Navigation presence
          const header = document.querySelector('header, nav');
          const hasHeader = !!header;

          // 5. Mobile hamburger menu check
          let hamburgerVisible = false;
          if (isMobile) {
            const menuBtn = document.querySelector('button[aria-label*="menu" i], button[aria-label*="navigation" i], button.mobile-menu-toggle, nav button');
            hamburgerVisible = !!menuBtn;
          }

          return {
            scrollWidth,
            vpWidth,
            hasHorizontalOverflow,
            overflowingElements: overflowingElements.slice(0, 5),
            brokenImagesCount: brokenImages.length,
            brokenImages: brokenImages.slice(0, 3),
            tinyTouchTargetsCount: tinyTouchTargets.length,
            tinyTouchTargets: tinyTouchTargets.slice(0, 4),
            hasHeader,
            hamburgerVisible
          };
        }, vp.width, vp.height, vp.isMobile);

        const isClean = !auditResult.hasHorizontalOverflow && auditResult.brokenImagesCount === 0;

        console.log(`  ${isClean ? '✅' : '⚠️'} [${route.name}] (${route.path})`);
        console.log(`     - Layout Width: ${auditResult.scrollWidth}px / ${auditResult.vpWidth}px | Overflow: ${auditResult.hasHorizontalOverflow ? `YES (${auditResult.scrollWidth - auditResult.vpWidth}px over)` : 'NONE (0px)'}`);
        
        if (auditResult.hasHorizontalOverflow) {
          console.log(`       ⚠️ Culprit elements:`, auditResult.overflowingElements);
          findings.push({
            type: 'HORIZONTAL_OVERFLOW',
            viewport: vp.name,
            route: route.name,
            path: route.path,
            details: `Scroll width ${auditResult.scrollWidth}px exceeds viewport ${auditResult.vpWidth}px by ${auditResult.scrollWidth - auditResult.vpWidth}px. Culprits: ${auditResult.overflowingElements.join(', ')}`
          });
        }

        if (auditResult.brokenImagesCount > 0) {
          console.log(`       ⚠️ Broken images detected (${auditResult.brokenImagesCount}):`, auditResult.brokenImages);
          findings.push({
            type: 'BROKEN_IMAGE',
            viewport: vp.name,
            route: route.name,
            path: route.path,
            details: `${auditResult.brokenImagesCount} image(s) failed to render naturalWidth.`
          });
        }

        if (vp.isMobile && auditResult.tinyTouchTargetsCount > 0) {
          console.log(`     - Touch targets: ${auditResult.tinyTouchTargetsCount} compact interactive element(s) found (e.g. ${auditResult.tinyTouchTargets.join(', ')})`);
        }

      } catch (err) {
        console.error(`  ❌ Error loading [${route.name}] on ${vp.name}:`, err.message);
        findings.push({
          type: 'NAVIGATION_ERROR',
          viewport: vp.name,
          route: route.name,
          path: route.path,
          details: err.message
        });
      }
    }
  }

  // Mobile Hamburger Interaction Test
  console.log(`\n================================================================`);
  console.log(`📱 TESTING MOBILE NAVIGATION MENU DRAWER INTERACTION`);
  console.log(`================================================================`);
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

  const hamburgerTest = await page.evaluate(async () => {
    const btn = document.querySelector('header button[aria-label*="menu" i], header button svg, header button');
    if (!btn) return { found: false, opened: false };
    
    btn.click();
    await new Promise(r => setTimeout(r, 400));
    
    // Check if mobile menu is now visible
    const mobileMenu = document.querySelector('[role="dialog"], .mobile-menu, nav[class*="fixed"], div[class*="fixed inset-0"]');
    const isVisible = mobileMenu ? (window.getComputedStyle(mobileMenu).display !== 'none' && window.getComputedStyle(mobileMenu).visibility !== 'hidden') : false;
    
    return { found: true, opened: isVisible };
  });

  console.log(`  Hamburger Menu Toggle: ${hamburgerTest.found ? 'Found' : 'Not Found'} | Drawer Opens: ${hamburgerTest.opened ? 'YES ✅' : 'NO'}`);

  await browser.close();

  console.log(`\n================================================================`);
  console.log(`📊 UI AUDIT COMPLETE SUMMARY`);
  console.log(`================================================================`);
  console.log(`Total Viewports Tested: ${Object.keys(VIEWPORTS).length}`);
  console.log(`Total Routes per Viewport: ${ROUTES.length}`);
  console.log(`Total Page Checks: ${Object.keys(VIEWPORTS).length * ROUTES.length}`);
  console.log(`Total Findings / Issues: ${findings.length}`);
  console.log(`Uncaught Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console Errors:', consoleErrors);
  }

  return { findings, consoleErrors };
}

runUIAudit().catch(e => {
  console.error('Audit crashed:', e);
  process.exit(1);
});
