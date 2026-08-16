import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true
    },
    razorpaySignature: {
      type: String
    },
    amount: {
      type: Number,
      required: true // Stored in paise (e.g. 49900 or 199900)
    },
    currency: {
      type: String,
      default: 'INR'
    },
    productType: {
      type: String,
      enum: ['course', 'membership'],
      required: true
    },
    productId: {
      type: String, // 'ifsca-cmi', 'sebi-aif', 'ifsca-fme', or 'full_access'
      required: true
    },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true
    },
    receipt: {
      type: String
    },
    notes: {
      type: Map,
      of: String
    },
    errorDetails: {
      type: mongoose.Schema.Types.Mixed
    },
    verifiedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
