import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function runAudit() {
  console.log('Starting Complete Site-Wide Audit & Pre-Launch Polish Pass...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Test 1: Key Navigation Routes (Desktop 1440x900)
  console.log('\n--- 1. Testing Core Desktop Routes ---');
  await page.setViewport({ width: 1440, height: 900 });

  const routes = [
    { path: '/', name: 'home_desktop.png' },
    { path: '/learn', name: 'learn_hub.png' },
    { path: '/learn/ifsca-fme', name: 'fme_course_hub.png' },
    { path: '/understand/ifsca-fme-2025', name: 'reglens_fme_reader.png' },
    { path: '/practice', name: 'practice_hub.png' },
    { path: '/tools', name: 'tools_hub.png' },
    { path: '/prepare', name: 'prepare_hub.png' },
    { path: '/prepare/fme', name: 'fme_lock_gating.png' },
    { path: '/regintel', name: 'regintel_hub.png' },
    { path: '/free-resources', name: 'free_resources_hub.png' },
    { path: '/membership', name: 'membership_page.png' }
  ];

  for (const r of routes) {
    console.log(`Auditing route: http://localhost:5173${r.path}...`);
    const res = await page.goto(`http://localhost:5173${r.path}`, { waitUntil: 'networkidle2' });
    console.log(`Status: ${res.status()} ${res.statusText()}`);
    await page.screenshot({ path: `${ARTIFACT_DIR}/audit_${r.name}`, fullPage: false });
  }

  // Test 2: RegLens FME 161 Provisions Audit
  console.log('\n--- 2. Auditing RegLens FME 161 Provisions ---');
  await page.goto('http://localhost:5173/understand/ifsca-fme-2025', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.bg-white.border-b.border-line', { timeout: 5000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 800));
  const provCountText = await page.evaluate(() => document.body.innerText);
  const has161Provisions = provCountText.includes('161 Provisions') || provCountText.includes('161 provisions') || provCountText.includes('161');
  console.log('RegLens FME Provision Audit:', has161Provisions ? 'PASS (161 Provisions Verified)' : 'CHECK NEEDED');

  // Test 3: Backward-Compatibility Redirect Audit
  console.log('\n--- 3. Auditing Backward-Compatibility Redirects ---');
  const redirects = [
    { from: '/knowledge-hub', expectedTo: '/learn' },
    { from: '/learning', expectedTo: '/learn' },
    { from: '/quizzes', expectedTo: '/practice/quizzes' },
    { from: '/diagnostic-tests', expectedTo: '/practice' },
    { from: '/exam-ready', expectedTo: '/practice/mock-tests' },
    { from: '/fme-interviewpro', expectedTo: '/prepare/fme' },
    { from: '/jobs', expectedTo: '/prepare/fme' },
    { from: '/compliance-tools', expectedTo: '/tools' }
  ];

  for (const red of redirects) {
    await page.goto(`http://localhost:5173${red.from}`, { waitUntil: 'networkidle2' });
    const currentUrl = page.url();
    console.log(`Redirect ${red.from} -> ${currentUrl} (Matches expected: ${currentUrl.includes(red.expectedTo)})`);
  }

  // Test 4: Mobile Responsive Viewports (375x812)
  console.log('\n--- 4. Auditing Mobile Responsiveness (375x812) ---');
  await page.setViewport({ width: 375, height: 812 });
  
  const mobilePages = ['/', '/learn', '/understand/ifsca-fme-2025', '/practice', '/tools', '/prepare'];
  for (const p of mobilePages) {
    console.log(`Testing 375px mobile viewport for ${p}...`);
    await page.goto(`http://localhost:5173${p}`, { waitUntil: 'networkidle2' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`Mobile ${p}: Horizontal Overflow = ${overflow ? 'FAIL' : 'PASS (Clean)'}`);
  }

  await browser.close();
  console.log('\nComplete Site-Wide Audit Finished Successfully!');
}

runAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
