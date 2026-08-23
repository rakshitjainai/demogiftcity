import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function runVerification() {
  console.log('Starting Puppeteer verification for Orbit Animation and Crisp Hero Banners...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // 1. CAPTURE HERO BANNER CONTRAST FIXES
  const pagesToTest = [
    { url: 'http://localhost:5173/learn', name: 'hero_reglearn_fixed.png' },
    { url: 'http://localhost:5173/tools', name: 'hero_regtools_fixed.png' },
    { url: 'http://localhost:5173/practice', name: 'hero_regpractice_fixed.png' },
    { url: 'http://localhost:5173/prepare', name: 'hero_regready_fixed.png' },
    { url: 'http://localhost:5173/regintel', name: 'hero_regintel_fixed.png' }
  ];

  for (const item of pagesToTest) {
    console.log(`Capturing hero banner at ${item.url}...`);
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(item.url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: `${ARTIFACT_DIR}/${item.name}`, fullPage: false });
    console.log(`Saved ${item.name}`);
  }

  // 2. CAPTURE HOMEPAGE ORBIT ANIMATION IN MOTION (Sequential frames)
  console.log('Capturing homepage Orbit animation sequence...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Frame 1 (t = 0s)
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/orbit_frame_0s.png`, fullPage: false });
  console.log('Saved orbit_frame_0s.png');

  // Frame 2 (t = 3s)
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: `${ARTIFACT_DIR}/orbit_frame_3s.png`, fullPage: false });
  console.log('Saved orbit_frame_3s.png');

  // Frame 3 (t = 6s)
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: `${ARTIFACT_DIR}/orbit_frame_6s.png`, fullPage: false });
  console.log('Saved orbit_frame_6s.png');

  // 3. CAPTURE MOBILE VIEWPORT (375x812)
  console.log('Capturing mobile view (375x812)...');
  await page.setViewport({ width: 375, height: 812 });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_orbit_375px.png`, fullPage: false });
  console.log('Saved mobile_orbit_375px.png');

  await browser.close();
  console.log('Verification completed successfully!');
}

runVerification().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
