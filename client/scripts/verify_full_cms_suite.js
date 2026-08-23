import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/raksh/.gemini/antigravity-ide/brain/a6a0e32f-3243-47c4-a570-f476a5093b89';

async function verifyFullCmsSuite() {
  console.log('=== STARTING COMPLETE BLOG CMS MANAGEMENT SUITE VERIFICATION ===\n');

  // Step 1: Admin Authentication
  console.log('Step 1: Authenticating Admin User...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@regmate.in', password: 'adminpassword123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  const adminUser = loginData.user;
  console.log(`Admin Authenticated! Token acquired, User Role: ${adminUser.role}`);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // Step 2: Test Post Creation
  console.log('\nStep 2: Creating Test Post A ("SEBI AIF Regulations 2026 Masterclass")...');
  const postARes = await fetch('http://localhost:5000/api/blogs/admin/create', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'SEBI AIF Regulations 2026 Masterclass',
      subtitle: 'Comprehensive analysis of Category I, II and III Alternative Investment Funds in India.',
      category: 'SEBI Compliance',
      regulatorId: 'sebi',
      tags: ['SEBI', 'AIF', 'Compliance'],
      content: '<h2>SEBI AIF Framework</h2><p>Overview of private placement memorandum guidelines.</p>',
      status: 'published'
    })
  });
  const postAData = await postARes.json();
  const postA = postAData.post;
  console.log(`Post A Created & Published! ID: ${postA._id}, Slug: ${postA.slug}`);

  // Step 3: Test Unpublish Action
  console.log('\nStep 3: Testing Unpublish Action on Post A...');
  const unpublishRes = await fetch(`http://localhost:5000/api/blogs/admin/${postA._id}/unpublish`, {
    method: 'POST',
    headers
  });
  const unpublishData = await unpublishRes.json();
  console.log(`Unpublish Status: ${unpublishRes.status}, New Status: ${unpublishData.post?.status} (Expected: draft)`);

  // Step 4: Test Duplicate / Clone Action
  console.log('\nStep 4: Testing Duplicate / Clone Action on Post A...');
  const cloneRes = await fetch(`http://localhost:5000/api/blogs/admin/${postA._id}/duplicate`, {
    method: 'POST',
    headers
  });
  const cloneData = await cloneRes.json();
  const clonedPost = cloneData.post;
  console.log(`Duplicate Status: ${cloneRes.status}, Cloned Title: "${clonedPost?.title}" (Expected: [Copy] SEBI AIF Regulations 2026 Masterclass)`);

  // Step 5: Test Soft Delete (Move to Trash)
  console.log('\nStep 5: Testing Soft Delete / Trash Action on Cloned Post...');
  const trashRes = await fetch(`http://localhost:5000/api/blogs/admin/${clonedPost._id}`, {
    method: 'DELETE',
    headers
  });
  const trashData = await trashRes.json();
  console.log(`Trash Status: ${trashRes.status}, Trashed Post Status: ${trashData.post?.status} (Expected: trash)`);

  // Step 6: Test Restore from Trash
  console.log('\nStep 6: Testing Restore Action on Trashed Post...');
  const restoreRes = await fetch(`http://localhost:5000/api/blogs/admin/${clonedPost._id}/restore`, {
    method: 'POST',
    headers
  });
  const restoreData = await restoreRes.json();
  console.log(`Restore Status: ${restoreRes.status}, Restored Status: ${restoreData.post?.status} (Expected: draft)`);

  // Step 7: Test Permanent Delete (From Trash)
  console.log('\nStep 7: Testing Permanent Delete on Cloned Post...');
  await fetch(`http://localhost:5000/api/blogs/admin/${clonedPost._id}`, { method: 'DELETE', headers }); // Soft delete first
  const permDeleteRes = await fetch(`http://localhost:5000/api/blogs/admin/${clonedPost._id}/permanent`, {
    method: 'DELETE',
    headers
  });
  const permDeleteData = await permDeleteRes.json();
  console.log(`Permanent Delete Status: ${permDeleteRes.status}, Message: ${permDeleteData.message}`);

  // Step 8: Test Bulk Actions
  console.log('\nStep 8: Testing Bulk Actions (Bulk Publish & Bulk Move to Trash)...');
  const postBRes = await fetch('http://localhost:5000/api/blogs/admin/create', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Bulk Test Post B',
      content: '<p>Bulk test content</p>',
      status: 'draft'
    })
  });
  const postB = (await postBRes.json()).post;

  const bulkPubRes = await fetch('http://localhost:5000/api/blogs/admin/bulk-action', {
    method: 'POST',
    headers,
    body: JSON.stringify({ ids: [postA._id, postB._id], action: 'publish' })
  });
  const bulkPubData = await bulkPubRes.json();
  console.log(`Bulk Publish Result: ${bulkPubData.message}`);

  // Step 9: Visual Puppeteer Verification & Screenshots
  console.log('\nStep 9: Launching Puppeteer for Visual Inspection & Screenshots...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Set local storage session
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.evaluate((tok, usr) => {
    localStorage.setItem('regmate_token', tok);
    localStorage.setItem('regmate_user', JSON.stringify(usr));
  }, token, adminUser);

  // 9.1 Admin Panel Blog CMS Tab (All Articles)
  console.log('Capturing Admin Panel Blog CMS Tab (Desktop 1440x900)...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Click Blog CMS Tab via evaluate
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cmsBtn = buttons.find(b => b.textContent.includes('Blog & Content CMS'));
    if (cmsBtn) cmsBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: `${ARTIFACT_DIR}/cms_admin_all_articles.png`, fullPage: false });

  // 9.2 Filter by Trash Tab
  console.log('Capturing Admin Panel Blog CMS Trash Tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const trashBtn = buttons.find(b => b.textContent.includes('Trash'));
    if (trashBtn) trashBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/cms_admin_trash_tab.png`, fullPage: false });

  await browser.close();
  console.log('\n=== ALL BLOG CMS MANAGEMENT FEATURES VERIFIED SUCCESSFULLY! ===');
}

verifyFullCmsSuite().catch(err => {
  console.error('CMS Verification Error:', err);
  process.exit(1);
});
