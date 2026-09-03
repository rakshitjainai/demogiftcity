// scripts/run_release_gate_verification.js
import http from 'http';
import https from 'https';
import { spawn } from 'child_process';
import path from 'path';
import puppeteer from 'puppeteer';
import jwt from '../server/node_modules/jsonwebtoken/index.js';
import crypto from 'crypto';

function waitForUrl(url, timeout = 40000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) resolve(true);
        else if (Date.now() - start < timeout) setTimeout(check, 800);
        else resolve(false);
      });
      req.on('error', () => {
        if (Date.now() - start < timeout) setTimeout(check, 800);
        else resolve(false);
      });
    };
    check();
  });
}

function startProcess(cmd, args, cwd, env = {}) {
  return spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...env },
    shell: true,
    stdio: 'pipe'
  });
}

async function request(url, options = {}, bodyData = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          json
        });
      });
    });

    req.on('error', reject);
    if (bodyData) {
      if (typeof bodyData === 'object') {
        req.write(JSON.stringify(bodyData));
      } else {
        req.write(bodyData);
      }
    }
    req.end();
  });
}

(async () => {
  console.log('========================================================================');
  console.log('🛡️ FINAL RELEASE GATE INDEPENDENT VERIFICATION RUNNER');
  console.log('========================================================================\n');

  const backendPort = 5000;
  const previewPort = 4173;
  const backendUrl = `http://localhost:${backendPort}`;
  const previewUrl = `http://localhost:${previewPort}`;

  console.log('🚀 Starting Backend Server on port', backendPort);
  const serverProc = startProcess('npm', ['start'], path.resolve('server'), { PORT: `${backendPort}` });

  console.log('🚀 Starting Client Production Preview on port', previewPort);
  const previewProc = startProcess('npx', ['vite', 'preview', '--port', `${previewPort}`, '--host', 'localhost'], path.resolve('client'));

  const backendUp = await waitForUrl(`${backendUrl}/health`, 30000);
  if (!backendUp) {
    console.error('❌ Backend failed to start on port', backendPort);
    process.exit(1);
  }
  console.log('✅ Backend is healthy at', backendUrl);

  const previewUp = await waitForUrl(previewUrl, 30000);
  if (!previewUp) {
    console.error('❌ Preview server failed to start on port', previewPort);
    process.exit(1);
  }
  console.log('✅ Production preview is reachable at', previewUrl);

  const testReport = {
    securitySpotChecks: [],
    smokeTestJourneys: [],
    errorsCaptured: []
  };

  function recordSecurityTest(name, passed, details) {
    testReport.securitySpotChecks.push({ name, passed, details });
    console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${name}: ${JSON.stringify(details)}`);
  }

  console.log('\n------------------------------------------------------------------------');
  console.log('🔒 1. EXECUTING SECURITY SPOT CHECK (HOSTILE CLIENT TESTS)');
  console.log('------------------------------------------------------------------------\n');

  const JWT_SECRET = 'regmate_jwt_secret_key_2026_secure';

  // 1. Missing JWT
  try {
    const res = await request(`${backendUrl}/api/auth/me`);
    recordSecurityTest('missing JWT', res.status === 401, { status: res.status, msg: res.json?.message });
  } catch (err) { recordSecurityTest('missing JWT', false, { error: err.message }); }

  // 2. Malformed JWT
  try {
    const res = await request(`${backendUrl}/api/auth/me`, { headers: { 'Authorization': 'Bearer NOT_A_VALID_TOKEN_STRING' } });
    recordSecurityTest('malformed JWT', res.status === 401, { status: res.status, msg: res.json?.message });
  } catch (err) { recordSecurityTest('malformed JWT', false, { error: err.message }); }

  // 3. Forged JWT (signed with wrong secret)
  try {
    const forgedToken = jwt.sign({ id: '65f000000000000000000001' }, 'attacker_fake_secret_key');
    const res = await request(`${backendUrl}/api/auth/me`, { headers: { 'Authorization': `Bearer ${forgedToken}` } });
    recordSecurityTest('forged JWT', res.status === 401, { status: res.status, msg: res.json?.message });
  } catch (err) { recordSecurityTest('forged JWT', false, { error: err.message }); }

  // 4. Expired JWT
  try {
    const expiredToken = jwt.sign({ id: '65f000000000000000000001' }, JWT_SECRET, { expiresIn: -10 });
    const res = await request(`${backendUrl}/api/auth/me`, { headers: { 'Authorization': `Bearer ${expiredToken}` } });
    recordSecurityTest('expired JWT', res.status === 401, { status: res.status, msg: res.json?.message });
  } catch (err) { recordSecurityTest('expired JWT', false, { error: err.message }); }

  // Register two disposable test users for ownership & role testing
  const uniqueSuffix = Date.now();
  const userAEmail = `test_usera_${uniqueSuffix}@regmate.test`;
  const userBEmail = `test_admin_wannabe_${uniqueSuffix}@regmate.test`; // contains "admin" substring!

  const regARes = await request(`${backendUrl}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, {
    name: 'User Alpha',
    email: userAEmail,
    password: 'Password123!'
  });
  const tokenA = regARes.json?.token;
  const userAId = regARes.json?.user?.id;

  const regBRes = await request(`${backendUrl}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, {
    name: 'User Beta (Admin Substring Test)',
    email: userBEmail,
    password: 'Password123!'
  });
  const tokenB = regBRes.json?.token;
  const userBId = regBRes.json?.user?.id;
  const userBRole = regBRes.json?.user?.role;

  // 5. Verify email with "admin" substring did NOT get admin role (Privilege Escalation check)
  recordSecurityTest('admin/user separation on signup with "admin" in email', userBRole === 'member', {
    email: userBEmail,
    assignedRole: userBRole,
    expectedRole: 'member'
  });

  // 6. Non-admin accessing admin endpoint (/api/admin/stats)
  try {
    const res = await request(`${backendUrl}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${tokenA}` } });
    recordSecurityTest('non-admin accessing admin endpoint /api/admin/stats', res.status === 403, { status: res.status, msg: res.json?.message });
  } catch (err) { recordSecurityTest('non-admin accessing admin endpoint', false, { error: err.message }); }

  // 7. Non-admin accessing admin endpoint (/api/admin/users)
  try {
    const res = await request(`${backendUrl}/api/admin/users`, { headers: { 'Authorization': `Bearer ${tokenB}` } });
    recordSecurityTest('non-admin accessing admin endpoint /api/admin/users', res.status === 403, { status: res.status, msg: res.json?.message });
  } catch (err) { recordSecurityTest('non-admin accessing admin endpoint users', false, { error: err.message }); }

  // 8. User A creates payment order, then User B attempts to verify User A's order (IDOR)
  let orderAId = null;
  try {
    const orderRes = await request(`${backendUrl}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}`, 'Content-Type': 'application/json' }
    }, {
      productType: 'course',
      productId: 'sebi-aif'
    });
    orderAId = orderRes.json?.orderId;

    // User B attempts to verify User A's order
    const idorRes = await request(`${backendUrl}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}`, 'Content-Type': 'application/json' }
    }, {
      razorpay_order_id: orderAId,
      razorpay_payment_id: 'pay_fake_test_123',
      razorpay_signature: 'fake_signature_abc',
      productType: 'course',
      productId: 'sebi-aif'
    });
    recordSecurityTest('User B attempting User A order verification (IDOR)', idorRes.status === 403, {
      status: idorRes.status,
      msg: idorRes.json?.message
    });
  } catch (err) {
    recordSecurityTest('User A attempting User B resource access', false, { error: err.message });
  }

  // 9. Manipulated productId in create-order
  try {
    const badProdRes = await request(`${backendUrl}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}`, 'Content-Type': 'application/json' }
    }, {
      productType: 'course',
      productId: 'hacked_nonexistent_course'
    });
    recordSecurityTest('manipulated productId rejection', badProdRes.status === 400, {
      status: badProdRes.status,
      msg: badProdRes.json?.message
    });
  } catch (err) { recordSecurityTest('manipulated productId', false, { error: err.message }); }

  // 10. Amount tampering variations (amount = 0, 1, 999999, -500, null)
  const amountVariations = [
    { label: 'amount = 0', val: 0 },
    { label: 'amount = 1', val: 1 },
    { label: 'amount = 999999', val: 999999 },
    { label: 'negative amount', val: -500 },
    { label: 'null amount', val: null }
  ];

  for (const v of amountVariations) {
    try {
      const res = await request(`${backendUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenA}`, 'Content-Type': 'application/json' }
      }, {
        productType: 'course',
        productId: 'ifsca-cmi',
        amount: v.val
      });
      // Server-authoritative pricing must enforce 49900 paise (₹499) regardless of client input
      const actualAmount = res.json?.amount;
      const passed = res.status === 200 && actualAmount === 49900;
      recordSecurityTest(`price tampering test: ${v.label}`, passed, {
        submittedAmount: v.val,
        enforcedServerAmount: actualAmount,
        status: res.status
      });
    } catch (err) { recordSecurityTest(`price tampering: ${v.label}`, false, { error: err.message }); }
  }

  // 11. Invalid payment signature
  try {
    const res = await request(`${backendUrl}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}`, 'Content-Type': 'application/json' }
    }, {
      razorpay_order_id: orderAId || 'order_fake_123',
      razorpay_payment_id: 'pay_test_xyz',
      razorpay_signature: 'invalid_deadbeef_signature',
      productType: 'course',
      productId: 'sebi-aif'
    });
    recordSecurityTest('invalid payment signature rejection', res.status === 400, { status: res.status, msg: res.json?.message });
  } catch (err) { recordSecurityTest('invalid payment signature', false, { error: err.message }); }

  // 12. Missing signature
  try {
    const res = await request(`${backendUrl}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}`, 'Content-Type': 'application/json' }
    }, {
      razorpay_order_id: orderAId || 'order_fake_123',
      razorpay_payment_id: 'pay_test_xyz'
    });
    recordSecurityTest('missing signature rejection', res.status === 400, { status: res.status, msg: res.json?.message });
  } catch (err) { recordSecurityTest('missing signature', false, { error: err.message }); }

  // 13. Fake order / payment IDs
  try {
    const res = await request(`${backendUrl}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}`, 'Content-Type': 'application/json' }
    }, {
      razorpay_order_id: 'order_completely_fake_nonexistent',
      razorpay_payment_id: 'pay_completely_fake_nonexistent',
      razorpay_signature: 'signature_dummy'
    });
    recordSecurityTest('fake order/payment IDs rejection', res.status === 404, { status: res.status, msg: res.json?.message });
  } catch (err) { recordSecurityTest('fake order IDs', false, { error: err.message }); }

  // 14. Failed verification followed by entitlement check
  try {
    const accessRes = await request(`${backendUrl}/api/payments/my-access`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const hasEntitlement = (accessRes.json?.purchasedCourses || []).includes('sebi-aif');
    recordSecurityTest('failed verification followed by entitlement check', hasEntitlement === false, {
      hasEntitlement,
      accessibleCourses: accessRes.json?.accessibleCourses
    });
  } catch (err) { recordSecurityTest('entitlement check', false, { error: err.message }); }

  console.log('\n------------------------------------------------------------------------');
  console.log('🌐 2. EXECUTING PRODUCTION RUNTIME SMOKE TEST (PUPPETEER)');
  console.log('------------------------------------------------------------------------\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  page.on('requestfailed', req => {
    networkErrors.push(`${req.url()} (${req.failure()?.errorText})`);
  });

  page.on('response', res => {
    if (res.status() >= 400 && !res.url().includes('favicon')) {
      networkErrors.push(`${res.url()} [HTTP ${res.status()}]`);
    }
  });

  async function testRoute(name, pathStr, assertionFn) {
    const url = `${previewUrl}${pathStr}`;
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
      const status = resp ? resp.status() : 'no_response';
      let assertionResult = true;
      if (assertionFn) {
        assertionResult = await page.evaluate(assertionFn);
      }
      testReport.smokeTestJourneys.push({ name, path: pathStr, status, passed: status === 200 && assertionResult });
      console.log(`  [${status === 200 && assertionResult ? 'PASS' : 'FAIL'}] Journey: ${name} (${pathStr}) - HTTP ${status}`);
    } catch (err) {
      testReport.smokeTestJourneys.push({ name, path: pathStr, status: 'ERROR', error: err.message, passed: false });
      console.log(`  [FAIL] Journey: ${name} (${pathStr}) - Error: ${err.message}`);
    }
  }

  // 1. Homepage
  await testRoute('Homepage', '/', () => document.body.innerText.includes('RegMate'));

  // 2. Login Page
  await testRoute('Login Page', '/login', () => document.querySelector('input[type="email"]') !== null);

  // 3. Register Page
  await testRoute('Register Page', '/register', () => document.querySelector('input[type="email"]') !== null);

  // 4. Learn Hub
  await testRoute('Learn Hub', '/learn', () => document.body.innerText.toLowerCase().includes('learn') || document.body.innerText.includes('Course'));

  // 5. Specific Course Route
  await testRoute('Course Route (SEBI AIF)', '/learn/sebi-aif', () => document.body.innerText.includes('AIF') || document.body.innerText.includes('Chapter'));

  // 6. Practice Hub
  await testRoute('Practice Hub', '/practice', () => document.body.innerText.includes('Practice') || document.body.innerText.includes('Quiz'));

  // 7. Tools Hub
  await testRoute('Tools Hub', '/tools', () => document.body.innerText.includes('Tool') || document.body.innerText.includes('Calculator'));

  // 8. RegIntel Hub
  await testRoute('RegIntel Hub', '/regintel', () => document.body.innerText.includes('RegIntel') || document.body.innerText.includes('Circular'));

  // 9. Membership Page
  await testRoute('Membership Page', '/membership', () => document.body.innerText.includes('Membership') || document.body.innerText.includes('All-Access'));

  // 10. Article / Free Resources Modal Route
  await testRoute('Free Resources / Blogs', '/free-resources/blogs', () => document.body.innerText.length > 50);

  // 11. Interactive Login Flow in Browser
  console.log('\n  Testing in-browser authentication flow...');
  try {
    await page.goto(`${previewUrl}/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', userAEmail);
    await page.type('input[type="password"]', 'Password123!');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
      console.log('  [PASS] Interactive login submitted successfully.');
    }
  } catch (err) {
    console.log('  [WARN] Interactive login interaction note:', err.message);
  }

  await browser.close();

  // Kill servers
  try {
    serverProc.kill();
    previewProc.kill();
  } catch (_) {}

  console.log('\n------------------------------------------------------------------------');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('------------------------------------------------------------------------');
  const allSecPassed = testReport.securitySpotChecks.every(t => t.passed);
  const allSmokePassed = testReport.smokeTestJourneys.every(t => t.passed);

  console.log(`Security Spot Checks: ${testReport.securitySpotChecks.filter(t => t.passed).length} / ${testReport.securitySpotChecks.length} PASSED`);
  console.log(`Smoke Test Journeys: ${testReport.smokeTestJourneys.filter(t => t.passed).length} / ${testReport.smokeTestJourneys.length} PASSED`);
  console.log(`Browser Console Errors: ${consoleErrors.length}`);
  console.log(`Page Uncaught Exceptions: ${pageErrors.length}`);
  console.log(`Failed Network Requests: ${networkErrors.length}`);

  if (consoleErrors.length > 0) {
    console.log('Console errors captured:', consoleErrors);
  }
  if (networkErrors.length > 0) {
    console.log('Network errors captured:', networkErrors);
  }

  const finalSuccess = allSecPassed && allSmokePassed && consoleErrors.length === 0 && networkErrors.length === 0;
  console.log(`\nOVERALL VERIFICATION RESULT: ${finalSuccess ? '✅ SUCCESS (ALL PASSED)' : '❌ ISSUES DETECTED'}`);

  process.exit(finalSuccess ? 0 : 1);
})();
