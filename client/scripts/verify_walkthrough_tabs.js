import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function verifyWalkthroughTabs() {
  console.log('=== VERIFYING PRACTITIONER WALKTHROUGH TABS SITE-WIDE ===\n');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. SEBI AIF Chapter 1 - Walkthrough Tab
  console.log('1. Testing SEBI AIF Chapter 1 Walkthrough tab...');
  await page.goto('http://localhost:5173/learn/sebi-aif/chapter/1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.no-scrollbar button'));
    const wBtn = btns.find(b => b.textContent.includes('Walkthrough'));
    if (wBtn) wBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/walkthrough_sebi_aif_ch1_fixed.png`, fullPage: false });

  // 2. SEBI AIF Chapter 2 - Walkthrough Tab
  console.log('2. Testing SEBI AIF Chapter 2 Walkthrough tab...');
  await page.goto('http://localhost:5173/learn/sebi-aif/chapter/2', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.no-scrollbar button'));
    const wBtn = btns.find(b => b.textContent.includes('Walkthrough'));
    if (wBtn) wBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/walkthrough_sebi_aif_ch2_fixed.png`, fullPage: false });

  // 3. IFSCA CMI Chapter 1 - Walkthrough Tab
  console.log('3. Testing IFSCA CMI Chapter 1 Walkthrough tab...');
  await page.goto('http://localhost:5173/learn/ifsca-cmi/chapter/1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.no-scrollbar button'));
    const wBtn = btns.find(b => b.textContent.includes('Walkthrough'));
    if (wBtn) wBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/walkthrough_ifsca_cmi_ch1_fixed.png`, fullPage: false });

  // 4. IFSCA FME Chapter 1 - Walkthrough Tab
  console.log('4. Testing IFSCA FME Chapter 1 Walkthrough tab...');
  await page.goto('http://localhost:5173/learn/ifsca-fme/chapter/1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.no-scrollbar button'));
    const wBtn = btns.find(b => b.textContent.includes('Walkthrough'));
    if (wBtn) wBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/walkthrough_ifsca_fme_ch1_fixed.png`, fullPage: false });

  // 5. Spot-checking all other tabs on SEBI AIF Chapter 1
  console.log('5. Spot-checking all 5 tabs on SEBI AIF Chapter 1...');
  await page.goto('http://localhost:5173/learn/sebi-aif/chapter/1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));

  // Learn tab
  await page.screenshot({ path: `${ARTIFACT_DIR}/tab_sebi_aif_ch1_learn.png`, fullPage: false });

  // Recall tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.no-scrollbar button'));
    const b = btns.find(x => x.textContent.includes('Recall'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/tab_sebi_aif_ch1_recall.png`, fullPage: false });

  // Practice tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.no-scrollbar button'));
    const b = btns.find(x => x.textContent.includes('Practice'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/tab_sebi_aif_ch1_practice.png`, fullPage: false });

  // Challenge tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.no-scrollbar button'));
    const b = btns.find(x => x.textContent.includes('Challenge'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/tab_sebi_aif_ch1_challenge.png`, fullPage: false });

  await browser.close();
  console.log('\n=== ALL WALKTHROUGH & TAB VERIFICATIONS COMPLETED SUCCESSFULLY! ===');
}

verifyWalkthroughTabs().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
