import mongoose from 'mongoose';

const quizProgressSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const learningProgressSchema = new mongoose.Schema({
  moduleId: { type: String, required: true },
  completedLessons: [{ type: Number }],
  progress: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const filingStatusSchema = new mongoose.Schema({
  filingId: { type: String, required: true },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Filed'], default: 'Not Started' },
  dateFiled: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const courseProgressSchema = new mongoose.Schema({
  courseSlug: { type: String, required: true },
  completedItems: [{ type: String }],
  quizAnswers: [{
    uid: { type: String, required: true },
    selectedOption: { type: String },
    isCorrect: { type: Boolean },
    timestamp: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const readingProgressSchema = new mongoose.Schema({
  actSlug: { type: String },
  chapter: { type: String },
  sectionNum: { type: String },
  sectionTitle: { type: String },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const examReadyAttemptSchema = new mongoose.Schema({
  attemptDate: { type: Date, default: Date.now },
  rawScore: { type: Number },
  percentage: { type: Number },
  passStatus: { type: Boolean }
}, { _id: false });

const coursePurchaseSchema = new mongoose.Schema({
  courseSlug: { type: String, required: true },
  paymentId: { type: String },
  amount: { type: Number, default: 499 },
  purchasedAt: { type: Date, default: Date.now }
}, { _id: false });

const membershipSchema = new mongoose.Schema({
  active: { type: Boolean, default: false },
  expiresAt: { type: Date, default: null },
  paymentId: { type: String, default: null },
  purchasedAt: { type: Date, default: null }
}, { _id: false });

const entitlementSchema = new mongoose.Schema({
  code: { type: String, required: true }, // e.g. 'REGREADY_FME_001', 'REGMATE_ANNUAL'
  grantedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  paymentId: { type: String, default: null }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String }, // Optional for Google Auth users
    phone: { type: String, default: '', trim: true },
    googleId: { type: String },
    picture: { type: String, default: '' },
    role: { type: String, default: 'member' },
    membershipStatus: { type: String, enum: ['free', 'active', 'expired'], default: 'free' },
    subscriptionPlan: { type: String, default: 'Free Tier' },
    membership: { type: membershipSchema, default: () => ({ active: false, expiresAt: null }) },
    entitlements: [entitlementSchema],
    coursePurchases: [coursePurchaseSchema],
    quizQuestionsAnswered: { type: Number, default: 0 },
    chaptersRead: [{ type: String }],
    quizProgress: [quizProgressSchema],
    learningProgress: [learningProgressSchema],
    courseProgress: [courseProgressSchema],
    readingProgress: readingProgressSchema,
    filingStatus: [filingStatusSchema],
    examReadyAttempts: [examReadyAttemptSchema]
  },
  { timestamps: true }
);

// Method to check if user has a specific entitlement or membership
userSchema.methods.hasEntitlement = function (entitlementCode) {
  if (this.role === 'admin') return true;

  const now = new Date();
  const isMember = Boolean(
    this.membership?.expiresAt && new Date(this.membership.expiresAt) > now
  );

  // Annual membership grants access to all modules and mock tests
  if (isMember) return true;

  // Direct entitlement check
  if (this.entitlements && this.entitlements.some(e => {
    if (e.code !== entitlementCode) return false;
    if (e.expiresAt && new Date(e.expiresAt) <= now) return false;
    return true;
  })) {
    return true;
  }

  // Course purchases legacy fallback
  if (this.coursePurchases && this.coursePurchases.some(p => p.courseSlug === entitlementCode)) {
    return true;
  }

  return false;
};

// Method to safely return user object without password
userSchema.methods.toAuthJSON = function () {
  const isMembershipActive = Boolean(
    this.membership?.expiresAt && new Date(this.membership.expiresAt) > new Date()
  );
  const derivedStatus = isMembershipActive
    ? 'active'
    : (this.membership?.expiresAt ? 'expired' : (this.membershipStatus || 'free'));

  const activeEntitlements = new Set((this.entitlements || []).map(e => e.code));
  if (isMembershipActive) {
    activeEntitlements.add('REGMATE_ANNUAL');
    activeEntitlements.add('REGREADY_FME_001');
  }
  (this.coursePurchases || []).forEach(p => activeEntitlements.add(p.courseSlug));

  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone || '',
    picture: this.picture,
    role: this.role || 'member',
    membershipStatus: derivedStatus,
    subscriptionPlan: isMembershipActive ? (this.subscriptionPlan || 'RegMate All-Access (₹1,999/yr)') : 'Free Tier',
    membership: {
      active: isMembershipActive,
      expiresAt: this.membership?.expiresAt || null,
      paymentId: this.membership?.paymentId || null,
      purchasedAt: this.membership?.purchasedAt || null
    },
    entitlements: Array.from(activeEntitlements),
    coursePurchases: this.coursePurchases || [],
    quizQuestionsAnswered: this.quizQuestionsAnswered || 0,
    chaptersRead: this.chaptersRead || [],
    quizProgress: this.quizProgress || [],
    learningProgress: this.learningProgress || [],
    courseProgress: this.courseProgress || [],
    readingProgress: this.readingProgress || null,
    filingStatus: this.filingStatus || [],
    examReadyAttempts: this.examReadyAttempts || [],
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);
export default User;
