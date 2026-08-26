import puppeteer from '../client/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Get columns from ContentGrid
  const result = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(s => s.innerText.includes('Latest Articles'));
    if (!section) return { error: 'ContentGrid section not found' };
    const cols = Array.from(section.querySelectorAll('.grid > div'));
    return {
      colCount: cols.length,
      col1Heading: cols[0]?.querySelector('h3')?.innerText,
      col1Items: Array.from(cols[0]?.querySelectorAll('h4') || []).map(h => h.innerText),
      col2Heading: cols[1]?.querySelector('h3')?.innerText,
      col2Items: Array.from(cols[1]?.querySelectorAll('a[href*="/free-resources/blogs/"]') || []).map(a => ({
        href: a.getAttribute('href'),
        title: a.querySelector('h4')?.innerText,
        text: a.innerText
      })),
      col3Heading: cols[2]?.querySelector('h3')?.innerText,
      col3Items: Array.from(cols[2]?.querySelectorAll('h4') || []).map(h => h.innerText)
    };
  });

  console.log(JSON.stringify(result, null, 2));

  await browser.close();
})();
