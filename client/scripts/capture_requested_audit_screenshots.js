import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function capture() {
  console.log('Capturing requested audit screenshots...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // 1. RegLens 161-provision page (Desktop 1440x900)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/understand/ifsca-fme-2025', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/audit_reglens_161_provisions_desktop.png`, fullPage: false });
  console.log('Captured audit_reglens_161_provisions_desktop.png');

  // 2. FME-InterviewPro Payment Gate Overlay (Desktop 1440x900)
  await page.goto('http://localhost:5173/prepare/fme', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${ARTIFACT_DIR}/audit_fme_interviewpro_payment_gate.png`, fullPage: false });
  console.log('Captured audit_fme_interviewpro_payment_gate.png');

  // 3. RegLens 161-provision page (Mobile 375x812)
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/understand/ifsca-fme-2025', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/audit_reglens_161_provisions_mobile.png`, fullPage: false });
  console.log('Captured audit_reglens_161_provisions_mobile.png');

  // 4. FME-InterviewPro Payment Gate Overlay (Mobile 375x812)
  await page.goto('http://localhost:5173/prepare/fme', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${ARTIFACT_DIR}/audit_fme_interviewpro_payment_gate_mobile.png`, fullPage: false });
  console.log('Captured audit_fme_interviewpro_payment_gate_mobile.png');

  await browser.close();
  console.log('All requested screenshots captured successfully!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
