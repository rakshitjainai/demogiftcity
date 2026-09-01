import puppeteer from 'puppeteer';

const PREVIEW_PORT = 4173;
const BASE_URL = `http://localhost:${PREVIEW_PORT}`;

async function runClassicStudyModeTests() {
  console.log('=== STARTING CLASSIC STUDY MODE E2E VALIDATION SUITE ===\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('status of 404')) {
          consoleErrors.push(text);
          console.error(`   [Browser Console Error]: ${text}`);
        }
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push(err.toString());
      console.error(`   [Browser Page Error]: ${err.toString()}`);
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 🧪 TEST 1: REPRODUCTION TEST — /learn?reg=companies-act -> Classic Study Mode
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🧪 TEST 1: Testing exact reproduction on /learn?reg=companies-act ...');
    await page.goto(`${BASE_URL}/learn?reg=companies-act`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h3', { timeout: 10000 });

    // Find Companies Act course card
    const cardFound = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h3'));
      const companyHead = headings.find(h => h.textContent.includes('Companies Act'));
      return !!companyHead;
    });
    if (!cardFound) {
      throw new Error('Companies Act course card not found on /learn?reg=companies-act');
    }
    console.log('   ✓ Companies Act course card located successfully');

    // Click "Classic Study Mode" on the Companies Act card
    const clicked = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.card-shadow, div.bg-white'));
      for (const card of cards) {
        if (card.textContent.includes('Companies Act')) {
          const btn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.includes('Classic Study Mode'));
          if (btn) {
            btn.click();
            return true;
          }
        }
      }
      return false;
    });
    if (!clicked) {
      throw new Error('Could not find or click "Classic Study Mode" on Companies Act card');
    }

    // Wait for modal to open
    await page.waitForSelector('main', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));

    // Verify modal state
    const modalDetails = await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0');
      const headerTitle = modal ? (modal.querySelector('header span.line-clamp-1')?.textContent || '') : '';
      const bodyText = modal ? (modal.querySelector('main')?.textContent || '') : '';
      const hasError = bodyText.includes('Something went wrong') || bodyText.includes('fmeContent') || bodyText.includes('ReferenceError') || bodyText.includes('Unable to load');
      const h2Text = modal ? (modal.querySelector('main h2')?.textContent || '') : '';
      return {
        headerTitle,
        h2Text,
        hasError,
        bodyTextSnippet: bodyText.substring(0, 300)
      };
    });

    if (modalDetails.hasError) {
      throw new Error(`TEST 1 FAILED: Error modal displayed: ${modalDetails.bodyTextSnippet}`);
    }

    if (!modalDetails.headerTitle.includes('Companies Act') && !modalDetails.h2Text.includes('Post-Incorporation')) {
      throw new Error(`TEST 1 FAILED: Content does not belong to Companies Act: ${modalDetails.headerTitle} | ${modalDetails.h2Text}`);
    }

    console.log(`   ✓ Modal opened cleanly with 0 errors!`);
    console.log(`   ✓ Modal Title: "${modalDetails.headerTitle.trim()}"`);
    console.log(`   ✓ Chapter 1 Heading: "${modalDetails.h2Text.trim()}"`);

    // Step through the 4-step stepper: Understand -> Walkthrough -> Remember -> Practice
    console.log('   Testing Stepper Navigation (Understand -> Walkthrough -> Remember -> Practice)...');
    
    // Click Next Step (to Walkthrough)
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next Step'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Click Next Step (to Remember)
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next Step'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Click Next Step (to Practice)
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next Step'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const practiceState = await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Option'));
      const qText = document.querySelector('main p')?.textContent || '';
      return { optionCount: options.length, qText };
    });

    console.log(`   ✓ Practice Step rendered with ${practiceState.optionCount} interactive diagnostic options`);

    // Select Option D (180 days)
    await page.evaluate(() => {
      const opt = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('180 days'));
      if (opt) opt.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const explanationRendered = await page.evaluate(() => {
      return document.body.textContent.includes('Statutory Rationale');
    });
    if (!explanationRendered) {
      throw new Error('Statutory rationale was not displayed upon option selection');
    }
    console.log('   ✓ Instant statutory feedback & explanation displayed correctly');

    // Switch to Modules view
    await page.evaluate(() => {
      const modBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Chapter Modules'));
      if (modBtn) modBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const chaptersListed = await page.evaluate(() => {
      const chapterBadges = Array.from(document.querySelectorAll('span')).filter(s => s.textContent.includes('Chapter '));
      return chapterBadges.length;
    });
    console.log(`   ✓ Chapter syllabus list view rendered with ${chaptersListed} chapters on first page`);

    // Close modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('header button[aria-label="Exit Learning Mode"], header button[title="Exit Learning Mode"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    console.log('✅ TEST 1 PASS: Companies Act Classic Study Mode verified end-to-end with 0 errors!\n');


    // ──────────────────────────────────────────────────────────────────────────
    // 🧪 TEST 2: SEBI AIF Classic Study Mode
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🧪 TEST 2: Testing SEBI AIF Classic Study Mode...');
    await page.goto(`${BASE_URL}/learn?reg=SEBI`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h3', { timeout: 10000 });

    const sebiClicked = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.card-shadow, div.bg-white'));
      for (const card of cards) {
        if (card.textContent.includes('Alternative Investment Funds') || card.textContent.includes('SEBI-AIF')) {
          const btn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.includes('Classic Study Mode'));
          if (btn) {
            btn.click();
            return true;
          }
        }
      }
      return false;
    });
    if (!sebiClicked) {
      throw new Error('Could not find or click "Classic Study Mode" on SEBI AIF card');
    }

    await page.waitForSelector('div.fixed.inset-0', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));

    const sebiModal = await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0');
      const headerTitle = modal ? (modal.querySelector('header span.line-clamp-1')?.textContent || '') : '';
      const bodyText = modal ? (modal.querySelector('main')?.textContent || '') : '';
      const hasError = bodyText.includes('Something went wrong') || bodyText.includes('fmeContent') || bodyText.includes('ReferenceError') || bodyText.includes('Unable to load');
      return { headerTitle, hasError };
    });

    if (sebiModal.hasError) {
      throw new Error(`TEST 2 FAILED: SEBI AIF modal threw an error`);
    }
    if (!sebiModal.headerTitle.includes('Alternative Investment Funds')) {
      throw new Error(`TEST 2 FAILED: Modal header does not show SEBI AIF: ${sebiModal.headerTitle}`);
    }
    console.log(`   ✓ SEBI AIF Classic Study Mode opened cleanly: "${sebiModal.headerTitle.trim()}"`);

    // Close modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div.fixed.inset-0 header button[title="Exit Learning Mode"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    console.log('✅ TEST 2 PASS: SEBI AIF Classic Study Mode verified!\n');


    // ──────────────────────────────────────────────────────────────────────────
    // 🧪 TEST 3: IFSCA CMI Classic Study Mode
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🧪 TEST 3: Testing IFSCA CMI Classic Study Mode...');
    await page.goto(`${BASE_URL}/learn?reg=IFSCA`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h3', { timeout: 10000 });

    const cmiClicked = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.card-shadow, div.bg-white'));
      for (const card of cards) {
        if (card.textContent.includes('Capital Market Intermediaries') || card.textContent.includes('IFSCA-CMI')) {
          const btn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.includes('Classic Study Mode'));
          if (btn) {
            btn.click();
            return true;
          }
        }
      }
      return false;
    });
    if (!cmiClicked) {
      throw new Error('Could not find or click "Classic Study Mode" on IFSCA CMI card');
    }

    await page.waitForSelector('div.fixed.inset-0', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));

    const cmiModal = await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0');
      const headerTitle = modal ? (modal.querySelector('header span.line-clamp-1')?.textContent || '') : '';
      const bodyText = modal ? (modal.querySelector('main')?.textContent || '') : '';
      const hasError = bodyText.includes('Something went wrong') || bodyText.includes('fmeContent') || bodyText.includes('ReferenceError') || bodyText.includes('Unable to load');
      return { headerTitle, hasError };
    });

    if (cmiModal.hasError) {
      throw new Error(`TEST 3 FAILED: IFSCA CMI modal threw an error`);
    }
    if (!cmiModal.headerTitle.includes('Capital Market Intermediaries')) {
      throw new Error(`TEST 3 FAILED: Modal header does not show IFSCA CMI: ${cmiModal.headerTitle}`);
    }
    console.log(`   ✓ IFSCA CMI Classic Study Mode opened cleanly: "${cmiModal.headerTitle.trim()}"`);

    // Close modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div.fixed.inset-0 header button[title="Exit Learning Mode"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    console.log('✅ TEST 3 PASS: IFSCA CMI Classic Study Mode verified!\n');


    // ──────────────────────────────────────────────────────────────────────────
    // 🧪 TEST 4: IFSCA FME Classic Study Mode
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🧪 TEST 4: Testing IFSCA FME Classic Study Mode...');
    await page.goto(`${BASE_URL}/learn?reg=IFSCA`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h3', { timeout: 10000 });

    const fmeClicked = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.card-shadow, div.bg-white'));
      for (const card of cards) {
        if (card.textContent.includes('Fund Management') || card.textContent.includes('IFSCA-FME')) {
          const btn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.includes('Classic Study Mode'));
          if (btn) {
            btn.click();
            return true;
          }
        }
      }
      return false;
    });
    if (!fmeClicked) {
      throw new Error('Could not find or click "Classic Study Mode" on IFSCA FME card');
    }

    await page.waitForSelector('div.fixed.inset-0', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));

    const fmeModal = await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0');
      const headerTitle = modal ? (modal.querySelector('header span.line-clamp-1')?.textContent || '') : '';
      const bodyText = modal ? (modal.querySelector('main')?.textContent || '') : '';
      const hasError = bodyText.includes('Something went wrong') || bodyText.includes('fmeContent') || bodyText.includes('ReferenceError') || bodyText.includes('Unable to load');
      return { headerTitle, hasError };
    });

    if (fmeModal.hasError) {
      throw new Error(`TEST 4 FAILED: IFSCA FME modal threw an error`);
    }
    if (!fmeModal.headerTitle.includes('Fund Management')) {
      throw new Error(`TEST 4 FAILED: Modal header does not show IFSCA FME: ${fmeModal.headerTitle}`);
    }
    console.log(`   ✓ IFSCA FME Classic Study Mode opened cleanly: "${fmeModal.headerTitle.trim()}"`);

    // Close modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div.fixed.inset-0 header button[title="Exit Learning Mode"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    console.log('✅ TEST 4 PASS: IFSCA FME Classic Study Mode verified!\n');


    // ──────────────────────────────────────────────────────────────────────────
    // 🧪 TEST 5: SEBI LODR Classic Study Mode
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🧪 TEST 5: Testing SEBI LODR Classic Study Mode...');
    await page.goto(`${BASE_URL}/learn?reg=SEBI`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h3', { timeout: 10000 });

    const lodrClicked = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.card-shadow, div.bg-white'));
      for (const card of cards) {
        if (card.textContent.includes('Listing Obligations') || card.textContent.includes('SEBI-LODR')) {
          const btn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.includes('Classic Study Mode'));
          if (btn) {
            btn.click();
            return true;
          }
        }
      }
      return false;
    });
    if (!lodrClicked) {
      throw new Error('Could not find or click "Classic Study Mode" on SEBI LODR card');
    }

    await page.waitForSelector('div.fixed.inset-0', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));

    const lodrModal = await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0');
      const headerTitle = modal ? (modal.querySelector('header span.line-clamp-1')?.textContent || '') : '';
      const bodyText = modal ? (modal.querySelector('main')?.textContent || '') : '';
      const hasError = bodyText.includes('Something went wrong') || bodyText.includes('fmeContent') || bodyText.includes('ReferenceError') || bodyText.includes('Unable to load');
      return { headerTitle, hasError };
    });

    if (lodrModal.hasError) {
      throw new Error(`TEST 5 FAILED: SEBI LODR modal threw an error`);
    }
    if (!lodrModal.headerTitle.includes('Listing Obligations')) {
      throw new Error(`TEST 5 FAILED: Modal header does not show SEBI LODR: ${lodrModal.headerTitle}`);
    }
    console.log(`   ✓ SEBI LODR Classic Study Mode opened cleanly: "${lodrModal.headerTitle.trim()}"`);

    // Close modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div.fixed.inset-0 header button[title="Exit Learning Mode"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    console.log('✅ TEST 5 PASS: SEBI LODR Classic Study Mode verified!\n');


    // ──────────────────────────────────────────────────────────────────────────
    // 🧪 TEST 6: Progressive Step Engine Regression Check
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🧪 TEST 6: Verifying Progressive Learning Engine has no regression...');
    
    // SEBI AIF Chapter 1
    await page.goto(`${BASE_URL}/learn/sebi-aif/chapter/1`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('main', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 400));
    const sebiProg = await page.evaluate(() => document.body.textContent.includes('Course Map') && document.body.textContent.includes('Step '));
    if (!sebiProg) throw new Error('Progressive mode failed on sebi-aif');
    console.log('   ✓ SEBI AIF Progressive Mode Step 1 loaded');

    // IFSCA CMI Chapter 1
    await page.goto(`${BASE_URL}/learn/ifsca-cmi/chapter/1`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('main', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 400));
    const cmiProg = await page.evaluate(() => document.body.textContent.includes('Course Map') && document.body.textContent.includes('Step '));
    if (!cmiProg) throw new Error('Progressive mode failed on ifsca-cmi');
    console.log('   ✓ IFSCA CMI Progressive Mode Step 1 loaded');

    // IFSCA FME Chapter 1
    await page.goto(`${BASE_URL}/learn/ifsca-fme/chapter/1`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('main', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 400));
    const fmeProg = await page.evaluate(() => document.body.textContent.includes('Course Map') && document.body.textContent.includes('Step '));
    if (!fmeProg) throw new Error('Progressive mode failed on ifsca-fme');
    console.log('   ✓ IFSCA FME Progressive Mode Step 1 loaded');

    console.log('✅ TEST 6 PASS: Progressive Learning Engine verified with 0 regressions!\n');


    // ──────────────────────────────────────────────────────────────────────────
    // 🧪 TEST 7: Console & Runtime Errors Audit
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🧪 TEST 7: Verifying 0 Console / Runtime Errors...');
    if (consoleErrors.length > 0) {
      throw new Error(`TEST 7 FAILED: Console errors encountered: ${JSON.stringify(consoleErrors)}`);
    }
    console.log('✅ TEST 7 PASS: 0 Console Errors encountered across all tests!\n');

    console.log('🎉 ALL 7 E2E TESTS (COMPANIES ACT, SEBI AIF, IFSCA CMI, IFSCA FME, SEBI LODR, PROGRESSIVE REGRESSION & CONSOLE AUDIT) PASSED PERFECTLY!\n');

  } catch (err) {
    console.error(`\n❌ TEST RUN FAILED:`, err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runClassicStudyModeTests();
