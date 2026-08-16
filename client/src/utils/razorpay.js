const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Dynamically loads the Razorpay checkout.js script if not already present on window.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initiates end-to-end Razorpay checkout flow:
 * 1. Creates order on Render backend
 * 2. Opens official Razorpay modal
 * 3. Sends received signature to Render backend verify endpoint
 * 4. Resolves with verified server response
 * 
 * @param {Object} params
 * @param {'course'|'membership'} params.productType
 * @param {string} [params.productId] - 'ifsca-cmi' | 'sebi-aif' | 'ifsca-fme' | 'full_access'
 * @param {Object} [params.user] - Authenticated user details for prefill
 * @param {Function} [params.onSuccess] - Callback when server successfully verifies payment
 * @param {Function} [params.onError] - Callback on order creation or verification error
 * @param {Function} [params.onCancel] - Callback if user closes checkout modal
 */
export async function startRazorpayCheckout({
  productType,
  productId,
  user,
  onSuccess,
  onError,
  onCancel,
  onStart
}) {
  try {
    if (onStart) onStart();

    const token = localStorage.getItem('regmate_token');
    if (!token) {
      throw new Error('Please sign in or create an account before completing your purchase.');
    }

    // Ensure Razorpay SDK is loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Unable to initialize Razorpay checkout. Please check your network connection.');
    }

    // Step 1: Create Order via Render Backend
    const orderRes = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productType,
        productId: productType === 'course' ? productId : 'full_access'
      })
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.success) {
      throw new Error(orderData.message || 'Failed to create payment order on server.');
    }

    const productName = productType === 'membership'
      ? 'RegMate All-Access Annual Membership (1 Year)'
      : `Regulatory Master: ${(productId || '').toUpperCase()} Course Pass`;

    // Step 2: Open Razorpay Checkout Widget
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'RegMate',
      description: productName,
      image: 'https://demogiftcity.vercel.app/logoheader.jpeg',
      order_id: orderData.orderId,
      handler: async function (response) {
        // Step 3: Verify Payment Signature via Render Backend
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/payments/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              productType,
              productId: productType === 'course' ? productId : 'full_access'
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            if (onSuccess) onSuccess(verifyData);
          } else {
            const err = new Error(verifyData.message || 'Payment signature verification failed.');
            if (onError) onError(err);
          }
        } catch (verifyErr) {
          console.error('Payment verification request failed:', verifyErr);
          if (onError) onError(verifyErr);
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || ''
      },
      theme: {
        color: '#0B4D33'
      },
      modal: {
        ondismiss: function () {
          console.log('Razorpay modal dismissed by user');
          if (onCancel) onCancel();
        }
      }
    };

    const razorpayInstance = new window.Razorpay(options);

    razorpayInstance.on('payment.failed', function (response) {
      console.error('Razorpay Payment Failed:', response.error);
      const errMsg = response.error?.description || 'Payment transaction failed or was declined.';
      if (onError) onError(new Error(errMsg));
    });

    razorpayInstance.open();

  } catch (err) {
    console.error('Razorpay checkout initialization error:', err);
    if (onError) onError(err);
  }
}
