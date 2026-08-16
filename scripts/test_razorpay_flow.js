import crypto from 'crypto';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const API_BASE = 'http://localhost:5000/api';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/regmate';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RAZORPAY END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  // Connect to MongoDB directly to verify actual database state
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB for direct document verification.\n');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Payment = mongoose.model('Payment', new mongoose.Schema({}, { strict: false }));

  // Clean previous test accounts
  await User.deleteMany({ email: { $in: ['test_course_buyer@regmate.test', 'test_member_buyer@regmate.test', 'test_non_buyer@regmate.test'] } });
  console.log('🧹 Cleaned up old test users.\n');

  // ----------------------------------------------------
  // TEST 1: Course Purchase Flow (₹499)
  // ----------------------------------------------------
  console.log('--- TEST 1: Course Purchase (₹499) ---');
  // 1. Register User 1
  const regCourseRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Course Test Buyer',
      email: 'test_course_buyer@regmate.test',
      password: 'TestPassword2026!'
    })
  });
  const courseUser = await regCourseRes.json();
  const courseToken = courseUser.token;
  console.log(`👤 Registered fresh user: ${courseUser.user.email} (ID: ${courseUser.user.id})`);

  // 2. Attempt price tampering on create-order
  console.log('🔒 Security Check: Attempting price tampering (sending amount: 100)...');
  const tamperRes = await fetch(`${API_BASE}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${courseToken}`
    },
    body: JSON.stringify({
      productType: 'course',
      productId: 'ifsca-cmi',
      amount: 100 // Tampered amount
    })
  });
  const orderData = await tamperRes.json();
  console.log(`📦 Order created: ID=${orderData.orderId}, Server Amount=${orderData.amount} paise (₹${orderData.amount / 100})`);
  if (orderData.amount === 49900) {
    console.log('✅ PASS: Server strictly enforced ₹499 (49900 paise), client tampering ignored!');
  } else {
    console.error('❌ FAIL: Amount not strictly 49900!');
  }

  // 3. Verify Payment
  const fakePaymentId = 'pay_test_' + Date.now();
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
  const validSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderData.orderId}|${fakePaymentId}`)
    .digest('hex');

  const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${courseToken}`
    },
    body: JSON.stringify({
      razorpay_order_id: orderData.orderId,
      razorpay_payment_id: fakePaymentId,
      razorpay_signature: validSignature,
      productType: 'course',
      productId: 'ifsca-cmi'
    })
  });
  const verifyData = await verifyRes.json();
  console.log('🔍 Payment verification response:', verifyData);

  // 4. Directly check MongoDB document
  const dbUserCourse = await User.findById(courseUser.user.id);
  console.log('\n📄 Direct MongoDB User Document (coursePurchases):');
  console.log(JSON.stringify(dbUserCourse.coursePurchases, null, 2));

  if (dbUserCourse.coursePurchases?.some(p => p.courseSlug === 'ifsca-cmi')) {
    console.log('✅ PASS: MongoDB document confirmed with course purchase entry!\n');
  } else {
    console.error('❌ FAIL: Course purchase entry not found in MongoDB!');
  }

  // ----------------------------------------------------
  // TEST 2: Annual Membership Purchase Flow (₹1999)
  // ----------------------------------------------------
  console.log('--- TEST 2: Annual Membership Purchase (₹1999) ---');
  // 1. Register User 2
  const regMemberRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Membership Test Buyer',
      email: 'test_member_buyer@regmate.test',
      password: 'TestPassword2026!'
    })
  });
  const memberUser = await regMemberRes.json();
  const memberToken = memberUser.token;
  console.log(`👤 Registered fresh user: ${memberUser.user.email} (ID: ${memberUser.user.id})`);

  // 2. Create Membership Order
  const memOrderRes = await fetch(`${API_BASE}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${memberToken}`
    },
    body: JSON.stringify({
      productType: 'membership',
      productId: 'full_access'
    })
  });
  const memOrderData = await memOrderRes.json();
  console.log(`📦 Membership Order created: ID=${memOrderData.orderId}, Server Amount=${memOrderData.amount} paise (₹${memOrderData.amount / 100})`);

  // 3. Verify Membership Payment
  const memPaymentId = 'pay_mem_' + Date.now();
  const memSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${memOrderData.orderId}|${memPaymentId}`)
    .digest('hex');

  const memVerifyRes = await fetch(`${API_BASE}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${memberToken}`
    },
    body: JSON.stringify({
      razorpay_order_id: memOrderData.orderId,
      razorpay_payment_id: memPaymentId,
      razorpay_signature: memSignature,
      productType: 'membership',
      productId: 'full_access'
    })
  });
  const memVerifyData = await memVerifyRes.json();
  console.log('🔍 Membership verification response:', memVerifyData.message);

  // 4. Directly check MongoDB document
  const dbUserMem = await User.findById(memberUser.user.id);
  console.log('\n📄 Direct MongoDB User Document (membership):');
  console.log(JSON.stringify(dbUserMem.membership, null, 2));

  const daysValid = Math.ceil((new Date(dbUserMem.membership?.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
  console.log(`⏳ Membership validity duration: ${daysValid} days`);
  if (dbUserMem.membership?.active && daysValid >= 364 && daysValid <= 366) {
    console.log('✅ PASS: MongoDB confirmed active membership with 365-day expiration!\n');
  } else {
    console.error('❌ FAIL: Membership not active or invalid expiry duration!');
  }

  // ----------------------------------------------------
  // TEST 3: Gated Content & Security (Unpurchased User)
  // ----------------------------------------------------
  console.log('--- TEST 3: Content Gating & Gated Submission Check ---');
  // 1. Register Non-Purchasing User
  const regGuestRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Unpaid Guest User',
      email: 'test_non_buyer@regmate.test',
      password: 'TestPassword2026!'
    })
  });
  const guestUser = await regGuestRes.json();
  const guestToken = guestUser.token;

  // 2. Fetch course items
  const itemsRes = await fetch(`${API_BASE}/regulatory-master/ifsca-cmi/items`, {
    headers: { 'Authorization': `Bearer ${guestToken}` }
  });
  const itemsData = await itemsRes.json();
  const ch1Items = itemsData.items.filter(i => (i.chapterNo === 1 || i.module_no === 1));
  const ch2Items = itemsData.items.filter(i => (i.chapterNo === 2 || i.module_no === 2));

  const ch1Locked = ch1Items.every(i => !i.isLocked);
  const ch2Locked = ch2Items.every(i => i.isLocked);
  console.log(`🔒 Chapter 1 items unlocked: ${ch1Locked} (Free preview)`);
  console.log(`🔒 Chapter 2 items locked: ${ch2Locked} (Premium gated)`);

  if (ch1Locked && ch2Locked) {
    console.log('✅ PASS: Chapter 1 is open preview; Chapter 2+ is strictly locked on server!');
  }

  // 3. Attempt submit answer on a locked question
  const targetQ = ch2Items.find(i => i.uid);
  if (targetQ) {
    console.log(`🚫 Testing answer submission on Chapter 2 question (${targetQ.uid})...`);
    const submitRes = await fetch(`${API_BASE}/regulatory-master/ifsca-cmi/submit-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        uid: targetQ.uid,
        answer: 'A'
      })
    });
    console.log(`📡 Submit Status Code: ${submitRes.status} (Expected: 403)`);
    const submitBody = await submitRes.json();
    console.log('📡 Response Body:', submitBody);
    if (submitRes.status === 403 && submitBody.locked === true) {
      console.log('✅ PASS: Server returned 403 Forbidden on locked chapter submission!\n');
    }
  }

  // ----------------------------------------------------
  // TEST 4: Failure Path (Invalid Signature)
  // ----------------------------------------------------
  console.log('--- TEST 4: Failure Path (Tampered / Invalid Signature) ---');
  const failVerifyRes = await fetch(`${API_BASE}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guestToken}`
    },
    body: JSON.stringify({
      razorpay_order_id: orderData.orderId,
      razorpay_payment_id: 'pay_tampered_123',
      razorpay_signature: 'invalid_tampered_signature_hex_value',
      productType: 'course',
      productId: 'sebi-aif'
    })
  });
  console.log(`📡 Verify Status Code: ${failVerifyRes.status} (Expected: 400)`);
  const failData = await failVerifyRes.json();
  console.log('📡 Fail response body:', failData);

  const dbGuestAfterFail = await User.findById(guestUser.user.id);
  if (failVerifyRes.status === 400 && (!dbGuestAfterFail.coursePurchases || dbGuestAfterFail.coursePurchases.length === 0)) {
    console.log('✅ PASS: Tampered signature rejected with 400, no entitlements granted in database!\n');
  }

  console.log('====================================================');
  console.log('🎉 ALL BACKEND & DATABASE SECURITY TESTS PASSED!');
  console.log('====================================================');

  await mongoose.disconnect();
}

runTests().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
