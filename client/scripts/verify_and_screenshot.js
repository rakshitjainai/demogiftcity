import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function runVerification() {
  console.log('Starting Puppeteer verification...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Helper to click step bar button
  async function clickStepButton(stepName) {
    const buttons = await page.$$('div[class*="overflow-x-auto"] button');
    for (let b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes(stepName)) {
        await b.click();
        return true;
      }
    }
    return false;
  }

  // 1. CMI PRACTICE PAGE
  console.log('Navigating to CMI Chapter 1...');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/learn/ifsca-cmi/chapter/1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Click Learn step
  console.log('Testing Learn tab...');
  await clickStepButton('Learn');
  await new Promise(r => setTimeout(r, 500));

  // Click Walkthrough step
  console.log('Testing Walkthrough tab...');
  await clickStepButton('Walkthrough');
  await new Promise(r => setTimeout(r, 500));

  // Click Recall step
  console.log('Testing Recall tab...');
  await clickStepButton('Recall');
  await new Promise(r => setTimeout(r, 500));

  // Click Practice step
  console.log('Testing Practice tab & question interaction...');
  await clickStepButton('Practice');
  await new Promise(r => setTimeout(r, 800));

  // Interact with Practice question: click option button
  const optionBtns = await page.$$('button[class*="text-left"]');
  console.log(`Found ${optionBtns.length} option buttons in Practice mode`);
  if (optionBtns.length > 0) {
    await optionBtns[0].click();
    console.log('Clicked Option A!');
    await new Promise(r => setTimeout(r, 400));

    // Click Submit Answer button
    const buttons = await page.$$('button');
    for (let b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Submit Answer')) {
        await b.click();
        console.log('Clicked Submit Answer!');
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));
  }

  // Capture screenshot of working CMI Practice screen
  const cmiScreenshotPath = `${ARTIFACT_DIR}/cmi_practice_working.png`;
  await page.screenshot({ path: cmiScreenshotPath, fullPage: false });
  console.log(`Saved CMI practice screenshot to ${cmiScreenshotPath}`);

  // 2. HOMEPAGE DESKTOP
  console.log('Navigating to Homepage (Desktop 1440x900)...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Capture Homepage Desktop screenshot
  const homeDesktopScreenshotPath = `${ARTIFACT_DIR}/homepage_desktop.png`;
  await page.screenshot({ path: homeDesktopScreenshotPath, fullPage: false });
  console.log(`Saved Homepage Desktop screenshot to ${homeDesktopScreenshotPath}`);

  // Check Quick Access removal
  const quickAccessEl = await page.$('[class*="quick-access"], [id*="quick-access"]');
  console.log('Quick Access element presence check:', quickAccessEl !== null ? 'Found' : 'Clean (Removed)');

  // 3. HOMEPAGE MOBILE (375x812)
  console.log('Navigating to Homepage (Mobile 375x812)...');
  await page.setViewport({ width: 375, height: 812 });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const homeMobileScreenshotPath = `${ARTIFACT_DIR}/homepage_mobile.png`;
  await page.screenshot({ path: homeMobileScreenshotPath, fullPage: false });
  console.log(`Saved Homepage Mobile screenshot to ${homeMobileScreenshotPath}`);

  // 4. REGULATORY MASTER SANITY CHECK
  console.log('Sanity check on RegLens FME Ch1...');
  await page.goto('http://localhost:5173/understand/ifsca-fme-2025', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const headerText = await page.$eval('h1', el => el.innerText).catch(() => '');
  console.log('RegLens Header Text:', headerText);

  await browser.close();
  console.log('Verification completed successfully!');
}

runVerification().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
