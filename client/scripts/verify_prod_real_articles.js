import puppeteer from 'puppeteer';

const BASE_URL = process.argv[2] || 'http://localhost:4173';

async function verifyProductionArticles() {
  console.log('================================================================');
  console.log('🚀 PRODUCTION BUILD SANITY CHECK — REAL ARTICLES & VIEWPORTS');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let errors = 0;

  try {
    // 1. Visit Blog Index
    console.log('🔹 1. Checking Public Blog Index...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/free-resources/blogs`, { waitUntil: 'networkidle0' });

    const cardCount = await page.evaluate(() => {
      return document.querySelectorAll('article, a[href*="/free-resources/blogs/"]').length;
    });
    console.log(`   Found ${cardCount} article card links rendered on public index.`);
    if (cardCount === 0) {
      console.error('   ❌ FAIL: No article cards found on public blog index.');
      errors++;
    } else {
      console.log('   ✅ PASS: Public blog index renders article cards cleanly.');
    }

    // 2. Select 3 real existing articles from posts.json to verify
    const testSlugs = [
      {
        slug: 'how-art-shapes-the-way-we-experience-everyday-life',
        expectedWord: 'art',
        expectedTitle: 'How Art Shapes the Way We Experience Everyday Life'
      },
      {
        slug: 'everyday-inspiration-how-art-and-design-spark-creativity',
        expectedWord: 'inspiration',
        expectedTitle: 'Everyday Inspiration: How Art and Design Spark Creativity'
      },
      {
        slug: 'finding-inspiration-in-simple-spaces-and-quiet-moments',
        expectedWord: 'quiet',
        expectedTitle: 'Finding Inspiration in Simple Spaces and Quiet Moments'
      }
    ];

    for (let i = 0; i < testSlugs.length; i++) {
      const { slug, expectedWord, expectedTitle } = testSlugs[i];
      console.log(`\n🔹 2.${i + 1}. Verifying Real Article: /${slug}`);

      // Desktop Check
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/free-resources/blogs/${slug}`, { waitUntil: 'networkidle0' });

      const pageTitle = await page.title();
      const bodyText = await page.evaluate(() => document.body.innerText);
      const hasTitle = bodyText.toLowerCase().includes(expectedTitle.toLowerCase()) || pageTitle.toLowerCase().includes(expectedWord.toLowerCase());
      const hasContent = bodyText.toLowerCase().includes(expectedWord.toLowerCase());
      
      const imageStatus = await page.evaluate(() => {
        const img = document.querySelector('img[src*="unsplash"], img[src*="gift"], img[src*="http"], img.w-full');
        if (!img) return { found: false };
        return { found: true, complete: img.complete, naturalWidth: img.naturalWidth, src: img.src };
      });

      const headSeo = await page.evaluate(() => {
        return {
          title: document.title,
          desc: document.querySelector('meta[name="description"]')?.content,
          canonical: document.querySelector('link[rel="canonical"]')?.href
        };
      });

      console.log(`   Document Title: "${headSeo.title}"`);
      console.log(`   Canonical URL:  "${headSeo.canonical}"`);
      console.log(`   Cover Image:    ${imageStatus.found ? `Found (${imageStatus.naturalWidth}px)` : 'None / Fallback'}`);

      if (!hasTitle || !hasContent) {
        console.error(`   ❌ FAIL: Article content mismatch for ${slug}`);
        errors++;
      } else {
        console.log(`   ✅ PASS: Article content & title verified for ${slug}`);
      }

      // Mobile Viewport Check (390x844)
      await page.setViewport({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}/free-resources/blogs/${slug}`, { waitUntil: 'networkidle0' });

      const mobileOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (mobileOverflow) {
        console.error(`   ❌ FAIL: Mobile horizontal overflow on ${slug}`);
        errors++;
      } else {
        console.log(`   ✅ PASS: Mobile responsive layout clean on 390x844 (0px overflow)`);
      }
    }

    console.log('\n================================================================');
    if (errors === 0) {
      console.log('🎉 ALL REAL PRODUCTION ARTICLES & VIEWPORTS VERIFIED: 100% PASS');
    } else {
      console.log(`❌ VERIFICATION COMPLETED WITH ${errors} ERRORS`);
    }
    console.log('================================================================\n');

  } finally {
    await browser.close();
  }

  process.exit(errors > 0 ? 1 : 0);
}

verifyProductionArticles().catch(err => {
  console.error('Sanity check execution failed:', err);
  process.exit(1);
});
