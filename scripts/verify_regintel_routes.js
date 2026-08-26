import puppeteer from '../client/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';

const ROUTES_TO_TEST = [
  '/regintel',
  '/regintel?reg=mca',
  '/regintel?reg=sebi',
  '/regintel?reg=ifsca',
  '/regintel?reg=rbi',
  '/regintel?reg=fema',
  '/regintel?reg=tax',
  '/regintel/whats-changed',
  '/regintel/tracker',
  '/regintel/enforcement',
  '/regintel/alerts'
];

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

  console.log('Testing all RegIntel routes...');
  for (const route of ROUTES_TO_TEST) {
    errors = [];
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle0' });
    const title = await page.evaluate(() => document.querySelector('h1, h2')?.innerText.trim() || 'No Heading');
    const isBlank = await page.evaluate(() => document.body.innerText.trim().length === 0);
    console.log(`Route: ${route.padEnd(25)} | Heading: "${title.slice(0, 35)}..." | Blank: ${isBlank} | Errors: ${errors.length}`);
  }

  await browser.close();
})();
