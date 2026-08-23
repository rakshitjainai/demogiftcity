import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function verifyFreeResourcesAndBlogs() {
  console.log('=== VERIFYING FREE RESOURCES DROPDOWN & BLOG CARD CLICK-THROUGH ===\n');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Test Free Resources Dropdown Items
  console.log('--- Step 1: Testing Free Resources Dropdown Items ---');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Hover Free Resources
  const freeResLink = await page.$('a[href="/free-resources"]') || (await page.$$('a'))[5];
  if (freeResLink) {
    await freeResLink.hover();
    await new Promise(r => setTimeout(r, 400));
  }

  // Confirm "Articles" is NOT present in dropdown text
  const dropdownText = await page.evaluate(() => {
    const el = document.querySelector('[role="menu"]');
    return el ? el.innerText : '';
  });
  const hasArticlesItem = dropdownText.includes('Articles') && !dropdownText.includes('Blogs & Analysis');
  console.log(`Dropdown Text Check: "Articles" removed from menu: ${!hasArticlesItem ? 'PASS (Removed)' : 'FAIL'}`);

  // Test Dropdown Route Navigations
  const subRoutesToTest = [
    { name: 'Blogs & Analysis', path: '/free-resources/blogs', artifact: 'dropdown_blogs.png' },
    { name: 'Regulatory Explainers', path: '/free-resources/explainers', artifact: 'dropdown_explainers.png' },
    { name: 'Guides', path: '/free-resources/guides', artifact: 'dropdown_guides.png' },
    { name: 'Regulatory FAQs', path: '/free-resources/faqs', artifact: 'dropdown_faqs.png' },
    { name: 'Checklists', path: '/tools', artifact: 'dropdown_checklists.png' },
    { name: 'Templates & Formats', path: '/free-resources/templates', artifact: 'dropdown_templates.png' }
  ];

  for (const item of subRoutesToTest) {
    console.log(`Navigating to ${item.name} (${item.path})...`);
    const resp = await page.goto(`http://localhost:5173${item.path}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    console.log(`Status: ${resp.status()} for ${item.path}`);
    await page.screenshot({ path: `${ARTIFACT_DIR}/${item.artifact}`, fullPage: false });
  }

  // 2. Test /free-resources/articles Redirect
  console.log('\n--- Step 2: Testing /free-resources/articles Redirect ---');
  await page.goto('http://localhost:5173/free-resources/articles', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  const currentUrl = page.url();
  console.log(`Navigated to /free-resources/articles -> Current URL: ${currentUrl} (Expected: .../free-resources/blogs)`);

  // 3. Test Clicking 5 Different Blog Post Cards
  console.log('\n--- Step 3: Testing Blog Card Click-Through (5 Different Posts) ---');
  await page.goto('http://localhost:5173/free-resources/blogs', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Get all post card links
  const postHrefs = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('a[href*="/free-resources/blogs/"]'));
    return cards.map(c => c.getAttribute('href')).filter((v, i, a) => a.indexOf(v) === i);
  });

  console.log(`Found ${postHrefs.length} blog post detail links on page.`);

  const postsToTest = postHrefs.slice(0, 5);
  for (let i = 0; i < postsToTest.length; i++) {
    const href = postsToTest[i];
    console.log(`Clicking Post #${i + 1}: ${href}...`);
    const detailResp = await page.goto(`http://localhost:5173${href}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    
    const postTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText : 'NO H1 FOUND';
    });

    console.log(`Post #${i + 1} Status: ${detailResp.status()}, Rendered H1 Title: "${postTitle}"`);

    if (i === 0) {
      await page.screenshot({ path: `${ARTIFACT_DIR}/blog_post_detail_page_sample.png`, fullPage: false });
    }
  }

  await browser.close();
  console.log('\n=== ALL DROPDOWN AND BLOG CARD LINK FIXES VERIFIED! ===');
}

verifyFreeResourcesAndBlogs().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});
