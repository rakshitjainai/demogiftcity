import puppeteer from '../client/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  const overflowElements = await page.evaluate(() => {
    const docWidth = window.innerWidth;
    const all = Array.from(document.querySelectorAll('*'));
    const overflowing = [];
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1) {
        overflowing.push({
          tag: el.tagName,
          className: el.className?.toString?.().slice(0, 50),
          id: el.id,
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          docWidth
        });
      }
    }
    return overflowing.slice(0, 10);
  });

  console.log('Overflowing elements at 1024px:', overflowElements);
  await browser.close();
})();
