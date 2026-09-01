import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';

const router = express.Router();

// Helper to instantiate Razorpay client
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.warn('⚠️ Razorpay credentials not found in environment. Payment orders will fail unless configured.');
  }

  return new Razorpay({
    key_id: key_id || 'rzp_test_placeholder',
    key_secret: key_secret || 'rzp_secret_placeholder',
  });
}

// Pricing rules (Server-side source of truth — never trust client amounts)
const PRODUCT_PRICING = {
  course: 49900,      // ₹499 in paise
  exam_pass: 49900,   // ₹499 in paise (FME Mock Test / CMI Mock Test)
  job_pass: 49900,    // ₹499 in paise (FME Interview Ready Pass)
  membership: 199900  // ₹1,999 in paise (1 year access)
};

const VALID_COURSES = ['ifsca-cmi', 'sebi-aif', 'ifsca-fme', 'companies-act', 'sebi-lodr', 'mca-ca2013', 'job_ready', 'interview_pro'];
const VALID_EXAM_PASSES = ['REGREADY_FME_001', 'fme-full-length-mock-test', 'cmi-full-length-mock-test', 'ifsca-cmi'];

// ─── GET /api/payments/key-id ─────────────────────────────────────────────
router.get('/key-id', (req, res) => {
  return res.json({
    keyId: process.env.RAZORPAY_KEY_ID || ''
  });
});

// ─── GET /api/payments/my-access ──────────────────────────────────────────
router.get('/my-access', protect, async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();

    const isMember = Boolean(
      user.membership &&
      user.membership.expiresAt &&
      new Date(user.membership.expiresAt) > now
    );

    const purchasedCourses = (user.coursePurchases || []).map(p => p.courseSlug);
    const accessibleCourses = isMember ? [...VALID_COURSES] : purchasedCourses;
    const entitlements = (user.entitlements || []).map(e => e.code);

    if (isMember) {
      entitlements.push('REGMATE_ANNUAL', 'REGREADY_FME_001');
    }

    return res.json({
      success: true,
      userId: user._id,
      isMember,
      membership: {
        active: isMember,
        expiresAt: user.membership?.expiresAt || null,
        purchasedAt: user.membership?.purchasedAt || null,
        daysRemaining: isMember ? Math.ceil((new Date(user.membership.expiresAt) - now) / (1000 * 60 * 60 * 24)) : 0
      },
      entitlements: Array.from(new Set(entitlements)),
      purchasedCourses,
      accessibleCourses
    });
  } catch (error) {
    console.error('Error fetching user access:', error);
    return res.status(500).json({ message: 'Failed to retrieve access entitlements' });
  }
});

// ─── POST /api/payments/create-order ──────────────────────────────────────
router.post('/create-order', protect, async (req, res) => {
  try {
    const user = req.user;
    const { productType, productId } = req.body;

    if (!productType || !['course', 'exam_pass', 'job_pass', 'membership'].includes(productType)) {
      return res.status(400).json({ message: "Invalid productType. Must be 'course', 'exam_pass', 'job_pass', or 'membership'." });
    }

    let cleanProductId = productId;
    if (productType === 'membership') {
      cleanProductId = 'full_access';
    } else if (productType === 'exam_pass') {
      if (productId === 'fme' || productId === 'fme-full-length-mock-test' || productId === 'REGREADY_FME_001') {
        cleanProductId = 'REGREADY_FME_001';
      }
    }

    const now = new Date();

    // Check if user already has an active All-Access Membership
    const hasActiveMembership = Boolean(
      user.membership &&
      user.membership.expiresAt &&
      new Date(user.membership.expiresAt) > now
    );

    if (hasActiveMembership) {
      return res.status(400).json({
        message: 'You already have an active RegMate All-Access Membership granting full access to all courses and tools.'
      });
    }

    // Check if user already has this specific entitlement
    if (user.hasEntitlement && user.hasEntitlement(cleanProductId)) {
      return res.status(400).json({
        message: 'You already have active access to this product.'
      });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret || key_id.includes('placeholder') || key_id.includes('your_key_id')) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay API credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not configured in server/.env or Render. Please add your rzp_test_ Key ID and Key Secret to proceed.'
      });
    }

    const amount = PRODUCT_PRICING[productType] || 49900;
    const currency = 'INR';
    const receipt = `rcpt_${user._id.toString().slice(-6)}_${Date.now()}`;

    const orderOptions = {
      amount,
      currency,
      receipt,
      notes: {
        userId: user._id.toString(),
        userEmail: user.email,
        productType,
        productId: cleanProductId
      }
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(orderOptions);

    // Save payment attempt in database for audit trail
    await Payment.create({
      userId: user._id,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      productType,
      productId: cleanProductId,
      status: 'created',
      receipt,
      notes: orderOptions.notes
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      productType,
      productId: cleanProductId,
      keyId: key_id,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      message: error.message || 'Failed to create payment order. Please check Razorpay configuration.'
    });
  }
});

// ─── POST /api/payments/verify ────────────────────────────────────────────
router.post('/verify', protect, async (req, res) => {
  try {
    const user = req.user;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productType,
      productId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required payment verification details.' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ message: 'RAZORPAY_KEY_SECRET is not configured on the server.' });
    }

    // HMAC SHA256 signature verification
    const bodyString = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(bodyString)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn(`❌ Signature mismatch for order ${razorpay_order_id}`);
      
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: 'failed',
          errorDetails: { message: 'Signature verification mismatch' }
        }
      );

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature.'
      });
    }

    // Update payment record in database
    const paymentRecord = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
        verifiedAt: new Date()
      },
      { new: true, upsert: true }
    );

    // Grant entitlements on User model
    const now = new Date();
    const cleanProductType = productType || paymentRecord?.productType || 'membership';
    let cleanProductId = productId || paymentRecord?.productId || 'full_access';
    if (cleanProductId === 'fme' || cleanProductId === 'fme-full-length-mock-test') {
      cleanProductId = 'REGREADY_FME_001';
    }

    if (!user.entitlements) user.entitlements = [];

    if (cleanProductType === 'membership' || cleanProductId === 'full_access') {
      const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days
      user.membership = {
        active: true,
        expiresAt,
        paymentId: razorpay_payment_id,
        purchasedAt: now
      };
      user.membershipStatus = 'active';
      user.subscriptionPlan = 'RegMate All-Access (₹1,999/yr)';

      // Add standard entitlement codes
      if (!user.entitlements.some(e => e.code === 'REGMATE_ANNUAL')) {
        user.entitlements.push({ code: 'REGMATE_ANNUAL', paymentId: razorpay_payment_id, grantedAt: now, expiresAt });
      }
      if (!user.entitlements.some(e => e.code === 'REGREADY_FME_001')) {
        user.entitlements.push({ code: 'REGREADY_FME_001', paymentId: razorpay_payment_id, grantedAt: now, expiresAt });
      }
    } else if (cleanProductType === 'exam_pass' || cleanProductId === 'REGREADY_FME_001') {
      if (!user.entitlements.some(e => e.code === cleanProductId)) {
        user.entitlements.push({
          code: cleanProductId,
          paymentId: razorpay_payment_id,
          grantedAt: now
        });
      }
    } else if (cleanProductType === 'course' || cleanProductType === 'job_pass') {
      if (!user.coursePurchases) user.coursePurchases = [];
      const existingIndex = user.coursePurchases.findIndex(p => p.courseSlug === cleanProductId);
      if (existingIndex === -1) {
        user.coursePurchases.push({
          courseSlug: cleanProductId,
          paymentId: razorpay_payment_id,
          amount: 499,
          purchasedAt: now
        });
      }
      if (!user.entitlements.some(e => e.code === cleanProductId)) {
        user.entitlements.push({
          code: cleanProductId,
          paymentId: razorpay_payment_id,
          grantedAt: now
        });
      }
    }

    await user.save();

    console.log(`✅ Payment verified & access granted for User ${user._id} (${cleanProductType}: ${cleanProductId})`);

    return res.json({
      success: true,
      message: 'Payment verified successfully and access unlocked!',
      user: user.toAuthJSON()
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ message: 'Internal server error verifying payment.' });
  }
});

// ─── POST /api/payments/webhook ───────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const payloadString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.warn('❌ Invalid Razorpay Webhook signature');
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = payload.event;

    console.log(`🔔 Razorpay Webhook received event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentObj = payload.payload?.payment?.entity || {};
      const orderId = paymentObj.order_id;
      const paymentId = paymentObj.id;
      const notes = paymentObj.notes || {};
      const userId = notes.userId;
      const productType = notes.productType;
      let productId = notes.productId;

      if (productId === 'fme' || productId === 'fme-full-length-mock-test') {
        productId = 'REGREADY_FME_001';
      }

      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          const now = new Date();
          if (!user.entitlements) user.entitlements = [];

          if (productType === 'membership' || productId === 'full_access') {
            const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
            user.membership = {
              active: true,
              expiresAt,
              paymentId,
              purchasedAt: now
            };
            user.membershipStatus = 'active';
            user.subscriptionPlan = 'RegMate All-Access (₹1,999/yr)';
            if (!user.entitlements.some(e => e.code === 'REGMATE_ANNUAL')) {
              user.entitlements.push({ code: 'REGMATE_ANNUAL', paymentId, grantedAt: now, expiresAt });
            }
            if (!user.entitlements.some(e => e.code === 'REGREADY_FME_001')) {
              user.entitlements.push({ code: 'REGREADY_FME_001', paymentId, grantedAt: now, expiresAt });
            }
          } else if (productType === 'exam_pass' || productId === 'REGREADY_FME_001') {
            if (!user.entitlements.some(e => e.code === productId)) {
              user.entitlements.push({ code: productId, paymentId, grantedAt: now });
            }
          } else if ((productType === 'course' || productType === 'job_pass') && productId) {
            if (!user.coursePurchases) user.coursePurchases = [];
            const alreadyPresent = user.coursePurchases.some(p => p.courseSlug === productId);
            if (!alreadyPresent) {
              user.coursePurchases.push({
                courseSlug: productId,
                paymentId,
                amount: 499,
                purchasedAt: now
              });
            }
            if (!user.entitlements.some(e => e.code === productId)) {
              user.entitlements.push({ code: productId, paymentId, grantedAt: now });
            }
          }
          await user.save();
          console.log(`✅ Webhook processed: Granted ${productType} (${productId}) to User ${userId}`);
        }
      }

      if (orderId) {
        await Payment.findOneAndUpdate(
          { razorpayOrderId: orderId },
          {
            razorpayPaymentId: paymentId,
            status: 'captured',
            verifiedAt: new Date()
          }
        );
      }
    }

    return res.json({ status: 'ok' });

  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({ message: 'Webhook processing error' });
  }
});

export default router;
