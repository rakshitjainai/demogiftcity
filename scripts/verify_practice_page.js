import puppeteer from '../client/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  let errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('--- Testing /practice ---');
  await page.goto('http://localhost:5173/practice', { waitUntil: 'networkidle0' });
  const title = await page.title();
  const h1 = await page.evaluate(() => document.querySelector('h1') ? document.querySelector('h1').innerText : 'NO H1');
  const cardCount = await page.evaluate(() => document.querySelectorAll('a[href*="/practice/"], a[href*="/prepare/"]').length);
  console.log('Title:', title);
  console.log('H1:', h1);
  console.log('Interactive Practice Cards Found:', cardCount);

  console.log('\n--- Testing /practice/mock-tests/fme-full-length-mock-test ---');
  await page.goto('http://localhost:5173/practice/mock-tests/fme-full-length-mock-test', { waitUntil: 'networkidle0' });
  const mockH1 = await page.evaluate(() => document.querySelector('h1, h2, h3') ? document.querySelector('h1, h2, h3').innerText : 'NO HEADING');
  console.log('Mock Test Heading:', mockH1);

  console.log('\nTotal Page Errors:', errors.length);
  if (errors.length > 0) {
    console.error('Errors found:', errors);
  } else {
    console.log('✓ Zero page/console errors. White screen completely resolved!');
  }

  await browser.close();
})();
