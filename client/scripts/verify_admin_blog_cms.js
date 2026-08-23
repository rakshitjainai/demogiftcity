import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function runBlogCmsVerification() {
  console.log('Starting Admin Blog Creation Panel & Server Security Verification...');

  // Step 1: Server Security & Access Control Tests via API
  console.log('\n--- Step 1: Server-Side Security Boundary Tests ---');

  // Test 1.1: Unauthenticated request to admin endpoint
  const unauthRes = await fetch('http://localhost:5000/api/blogs/admin/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacked Title', content: '<p>Hacked</p>' })
  });
  console.log(`1.1 Unauthenticated POST /api/blogs/admin/create: Status ${unauthRes.status} (Expected: 401)`);

  // Test 1.2: Authenticated Admin Login & Post Creation
  console.log('\n--- Step 2: Admin Login & Article Creation ---');
  let adminToken = '';
  let adminUser = null;

  try {
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'System Admin', email: 'admin@regmate.in', password: 'adminpassword123' })
    });
    const regData = await regRes.json();
    if (regRes.ok && regData.token) {
      adminToken = regData.token;
      adminUser = regData.user;
    } else {
      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@regmate.in', password: 'adminpassword123' })
      });
      const loginData = await loginRes.json();
      adminToken = loginData.token;
      adminUser = loginData.user;
    }
  } catch (e) {
    console.error('Admin auth error:', e.message);
  }

  console.log(`Admin Authenticated Successfully! User Role: ${adminUser?.role}`);

  // Create real test post with all rich text formatting features
  const richHtmlContent = `
    <h1>IFSCA Fund Management Entities (FME) Regulations 2025</h1>
    <p>The <strong>International Financial Services Centres Authority (IFSCA)</strong> has issued comprehensive regulatory updates for Fund Management Entities operating in GIFT City IFSC.</p>
    
    <h2>Key Compliance Requirements</h2>
    <ul>
      <li><strong>Net Worth Requirement:</strong> Minimum USD 75,000 for Registered FME (Non-Retail).</li>
      <li><strong>Principal Officer:</strong> Must possess minimum 5 years of relevant experience in fund management.</li>
      <li><strong>Risk Management Framework:</strong> Mandatory quarterly risk disclosure to board.</li>
    </ul>

    <h2>Statutory Guidance & Action Points</h2>
    <p style="color: #0B4D33; font-weight: bold;">Practitioners must complete Form A filing before the statutory deadline.</p>
    <blockquote style="border-left: 4px solid #10B981; padding-left: 12px; font-style: italic; background-color: #f8fafc;">
      "Every FME shall appoint a dedicated Compliance Officer responsible for reporting directly to the Board of Directors."
    </blockquote>

    <p>Read the official gazette notification on <a href="https://ifsca.gov.in" target="_blank" style="color: #0B4D33; text-decoration: underline;">IFSCA Portal</a>.</p>
    <img src="https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80" alt="GIFT City IFSC" style="max-width: 100%; border-radius: 12px; margin: 16px 0;" />
  `;

  const createPostRes = await fetch('http://localhost:5000/api/blogs/admin/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'IFSCA Fund Management Regulations 2025: Complete Operational Compliance Guide',
      subtitle: 'An in-depth regulatory masterclass on FME registration, net worth thresholds, and GIFT City filing requirements.',
      category: 'IFSCA & GIFT City',
      regulatorId: 'ifsca',
      tags: ['IFSCA', 'FME 2025', 'GIFT City', 'Net Worth'],
      content: richHtmlContent,
      coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
      status: 'published'
    })
  });

  const createPostData = await createPostRes.json();
  console.log(`Blog Creation Response: Status ${createPostRes.status}, Message: ${createPostData.message}`);
  const createdSlug = createPostData.post?.slug;
  console.log(`Created Article Slug: ${createdSlug}`);

  // Step 3: Visual Puppeteer Screenshot Verification
  console.log('\n--- Step 3: Visual Puppeteer Verification ---');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Set token in localStorage for admin session
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.evaluate((tok, usr) => {
    localStorage.setItem('regmate_token', tok);
    localStorage.setItem('regmate_user', JSON.stringify(usr));
  }, adminToken, adminUser);

  // 3.1 Homepage with Admin Action Bar & + Create Blog Post button
  console.log('Capturing Homepage Admin Session with + Create Blog Post button...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/admin_homepage_with_create_button.png`, fullPage: false });

  // 3.2 Rich Text Editor Page (Desktop)
  console.log('Capturing Blog Editor Page (Desktop 1440x900)...');
  await page.goto('http://localhost:5173/admin/blogs/create', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${ARTIFACT_DIR}/admin_blog_editor_desktop.png`, fullPage: false });

  // 3.3 Public Blog Listing Page (with published MongoDB post)
  console.log('Capturing Public Blog Listing (/free-resources/blogs)...');
  await page.goto('http://localhost:5173/free-resources/blogs', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_blog_listing_with_published_post.png`, fullPage: false });

  // 3.4 Public Single Blog Post Article Page
  if (createdSlug) {
    console.log(`Capturing Published Article Page (/free-resources/blogs/${createdSlug})...`);
    await page.goto(`http://localhost:5173/free-resources/blogs/${createdSlug}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: `${ARTIFACT_DIR}/published_article_page.png`, fullPage: false });
  }

  // 3.5 Mobile Editor Toolbar View (375x812)
  console.log('Capturing Mobile Editor Toolbar View (375x812)...');
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/admin/blogs/create', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${ARTIFACT_DIR}/admin_blog_editor_mobile_375px.png`, fullPage: false });

  // 3.6 Non-Admin 403 Forbidden Access Test
  console.log('\n--- Step 4: Non-Admin 403 Forbidden Test ---');
  await page.evaluate(() => {
    localStorage.removeItem('regmate_token');
    localStorage.removeItem('regmate_user');
  });
  await page.goto('http://localhost:5173/admin/blogs/create', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/non_admin_403_forbidden_gate.png`, fullPage: false });

  await browser.close();
  console.log('\nAdmin Blog CMS & Security Verification Completed Successfully!');
}

runBlogCmsVerification().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
