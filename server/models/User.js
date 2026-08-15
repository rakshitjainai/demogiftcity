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

// Method to safely return user object without password
userSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone || '',
    picture: this.picture,
    role: this.role || 'member',
    membershipStatus: this.membershipStatus || 'free',
    subscriptionPlan: this.subscriptionPlan || 'Free Tier',
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
