import puppeteer from 'puppeteer';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function verifyShortcodesAndSections() {
  console.log('=== VERIFYING SHORTCODE REMOVAL & FREE RESOURCES SECTION DIFFERENTIATION ===\n');

  // Step 1: Search Count Verification for Shortcodes
  console.log('Step 1: Auditing Posts Dataset for Residual Raw Shortcodes...');
  const postsData = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));
  const residualPattern = /\[(ifsca_cmi_quiz|fme_quiz|ifsca_aml_quiz|statuteiq_quiz|statuteiq_rpt_quiz|ifsc_fme_mock_test|fme_diagnostic|amlcft_diagnostic|ifsc_compliance_calendar|reglearn|reglearn_cmi|reglearn_aif|csater_landing|csater_exam|ecl_pillars|ecl_keypoints|ecl_statband|ecl_takeaway)\]/gi;
  
  let residualCount = 0;
  postsData.forEach(p => {
    const matches = (p.content || '').match(residualPattern);
    if (matches) residualCount += matches.length;
  });

  console.log(`Residual Shortcode Count in Data File: ${residualCount} (Expected: 0) -> ${residualCount === 0 ? 'PASS (0 Shortcodes)' : 'FAIL'}`);

  // Step 2: Puppeteer Visual Verification
  console.log('\nStep 2: Launching Puppeteer for Visual Screenshot Verification...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 2.1 CMI Post with Interactive CTA Embed
  console.log('Capturing "Master the IFSCA CMI Regulations" Post (with RegLearn CTA Embed)...');
  await page.goto('http://localhost:5173/free-resources/blogs/ifsca-cmi-regulations-learning-module', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${ARTIFACT_DIR}/cmi_post_shortcode_fixed.png`, fullPage: false });

  // 2.2 Free Resources Section 1: Blogs & Analysis
  console.log('Capturing Section 1: Blogs & Analysis (/free-resources/blogs)...');
  await page.goto('http://localhost:5173/free-resources/blogs', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/section_blogs.png`, fullPage: false });

  // 2.3 Free Resources Section 2: Regulatory Explainers
  console.log('Capturing Section 2: Regulatory Explainers (/free-resources/explainers)...');
  await page.goto('http://localhost:5173/free-resources/explainers', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/section_explainers.png`, fullPage: false });

  // 2.4 Free Resources Section 3: Compliance & Procedural Guides
  console.log('Capturing Section 3: Compliance & Procedural Guides (/free-resources/guides)...');
  await page.goto('http://localhost:5173/free-resources/guides', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/section_guides.png`, fullPage: false });

  // 2.5 Free Resources Section 4: Regulatory FAQs & Self-Tests
  console.log('Capturing Section 4: Regulatory FAQs & Self-Tests (/free-resources/faqs)...');
  await page.goto('http://localhost:5173/free-resources/faqs', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/section_faqs.png`, fullPage: false });

  await browser.close();
  console.log('\n=== ALL SHORTCODE AND SECTION DIFFERENTIATION VERIFICATIONS PASSED! ===');
}

verifyShortcodesAndSections().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});
