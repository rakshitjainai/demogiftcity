import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function verifyFixed() {
  console.log('=== CAPTURING CENTERED CATALOGUE & CHALLENGE SCREENSHOTS ===\n');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Catalogue (/learn)
  console.log('1. Capturing Course Catalogue cards...');
  await page.goto('http://localhost:5173/learn', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/fixed_catalogue_desktop.png` });

  // 375px mobile screenshot of catalogue
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  await page.evaluate(() => window.scrollBy(0, 550));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/fixed_catalogue_mobile_375px.png` });
  await page.setViewport({ width: 1280, height: 900 });

  // 2. Challenge Engine Screenshots
  console.log('2. Capturing Challenge Engine Cards...');

  // Find the Mistake
  await page.goto('http://localhost:5173/learn/sebi-aif/challenge/find-mistake', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/fixed_challenge_find-mistake_desktop.png` });

  // Which Number?
  await page.goto('http://localhost:5173/learn/sebi-aif/challenge/which-number', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/fixed_challenge_which-number_desktop.png` });

  // Compliance Scenario
  await page.goto('http://localhost:5173/learn/sebi-aif/challenge/scenario', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/fixed_challenge_scenario_desktop.png` });

  // Interview Drill
  await page.goto('http://localhost:5173/learn/sebi-aif/challenge/interview', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/fixed_challenge_interview_desktop.png` });

  await browser.close();
  console.log('\n=== ALL SCREENSHOTS CAPTURED SUCCESSFULLY! ===');
}

verifyFixed().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
