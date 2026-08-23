import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function diagnoseAll() {
  console.log('=== STEP 1: DIAGNOSING CHALLENGES & COURSE CATALOGUE CLICKS ===\n');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
      console.log(`  ❌ CONSOLE ERROR: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(`[Page Crash Error] ${err.message}\nStack:\n${err.stack}`);
    console.log(`  💥 PAGE CRASH ERROR: ${err.message}`);
  });

  // 1. Diagnose Catalogue (/learn)
  console.log('--- 1. Testing Course Catalogue (/learn) ---');
  await page.goto('http://localhost:5173/learn', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: `${ARTIFACT_DIR}/diag_catalogue_initial.png` });

  // Test buttons on /learn
  const catalogueLinks = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a, button'));
    return anchors.map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href') || '' }));
  });
  console.log('Found links/buttons on /learn:', catalogueLinks.filter(l => l.text.includes('Preview') || l.text.includes('Unlock') || l.text.includes('Start') || l.text.includes('Explore')));

  // 2. Diagnose CourseHub Challenges (/learn/sebi-aif)
  console.log('\n--- 2. Testing CourseHub Challenges (/learn/sebi-aif) ---');
  await page.goto('http://localhost:5173/learn/sebi-aif', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/diag_coursehub_sebi_aif.png` });

  const challengeCards = [
    { id: 'quick-recall', title: 'Quick Recall' },
    { id: 'find-mistake', title: 'Find the Mistake' },
    { id: 'scenario', title: 'Compliance Scenario' },
    { id: 'which-number', title: 'Which Number?' },
    { id: 'interview', title: 'Interview Drill' },
    { id: 'weak-areas', title: 'Fix My Weak Areas' }
  ];

  for (const cc of challengeCards) {
    console.log(`\nTesting Challenge Card: "${cc.title}" (/learn/sebi-aif/challenge/${cc.id})...`);
    consoleErrors.length = 0;
    pageErrors.length = 0;

    await page.goto(`http://localhost:5173/learn/sebi-aif/challenge/${cc.id}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    // Check if screen is white / crashed / empty
    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    const isWhiteScreen = bodyText.length < 20;

    if (isWhiteScreen || pageErrors.length > 0 || consoleErrors.length > 0) {
      console.log(`🔴 RESULT FOR "${cc.title}": FAILED / CRASHED / WHITE SCREEN`);
      console.log(`   Body Text length: ${bodyText.length}`);
      console.log(`   Page Errors:`, pageErrors);
      console.log(`   Console Errors:`, consoleErrors);
    } else {
      console.log(`🟢 RESULT FOR "${cc.title}": PASSED (Body length: ${bodyText.length})`);
    }

    await page.screenshot({ path: `${ARTIFACT_DIR}/diag_challenge_${cc.id}.png` });
  }

  // 3. Diagnose CourseHub Challenges (/learn/ifsca-cmi)
  console.log('\n--- 3. Testing CourseHub Challenges (/learn/ifsca-cmi) ---');
  for (const cc of challengeCards) {
    console.log(`Testing CMI Challenge: "${cc.title}" (/learn/ifsca-cmi/challenge/${cc.id})...`);
    await page.goto(`http://localhost:5173/learn/ifsca-cmi/challenge/${cc.id}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: `${ARTIFACT_DIR}/diag_cmi_challenge_${cc.id}.png` });
  }

  // 4. Diagnose CourseHub Challenges (/learn/ifsca-fme)
  console.log('\n--- 4. Testing CourseHub Challenges (/learn/ifsca-fme) ---');
  for (const cc of challengeCards) {
    console.log(`Testing FME Challenge: "${cc.title}" (/learn/ifsca-fme/challenge/${cc.id})...`);
    await page.goto(`http://localhost:5173/learn/ifsca-fme/challenge/${cc.id}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: `${ARTIFACT_DIR}/diag_fme_challenge_${cc.id}.png` });
  }

  await browser.close();
  console.log('\n=== DIAGNOSIS RUN COMPLETED! ===');
}

diagnoseAll().catch(err => {
  console.error('Diagnosis failed:', err);
  process.exit(1);
});
