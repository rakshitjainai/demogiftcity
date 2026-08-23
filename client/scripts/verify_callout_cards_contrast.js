import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function verifyCalloutCards() {
  console.log('=== CAPTURING FULLY CENTERED CALLOUT CARD SCREENSHOTS ===\n');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. SEBI AIF Blog Post
  console.log('Capturing SEBI AIF Blog Callout Card...');
  await page.goto('http://localhost:5173/free-resources/blogs/learn-sebi-aif-regulations', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollBy(0, 650));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/card_sebi_aif_contrast_fixed.png`, fullPage: false });

  // 2. IFSCA CMI Blog Post
  console.log('Capturing IFSCA CMI Blog Callout Card...');
  await page.goto('http://localhost:5173/free-resources/blogs/ifsca-cmi-regulations-learning-module', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollBy(0, 650));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/card_cmi_contrast_fixed.png`, fullPage: false });

  // 3. Compliance Calendar Blog Post
  console.log('Capturing Compliance Calendar Callout Card...');
  await page.goto('http://localhost:5173/free-resources/blogs/ifsc-compliance-calendar-builder', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollBy(0, 650));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/card_calendar_contrast_fixed.png`, fullPage: false });

  await browser.close();
  console.log('\n=== ALL FULLY CENTERED CALLOUT CARD SCREENSHOTS CAPTURED! ===');
}

verifyCalloutCards().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
