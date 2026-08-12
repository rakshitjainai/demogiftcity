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

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String }, // Optional for Google Auth users
    googleId: { type: String },
    picture: { type: String, default: '' },
    role: { type: String, default: 'member' },
    quizProgress: [quizProgressSchema],
    learningProgress: [learningProgressSchema]
  },
  { timestamps: true }
);

// Method to safely return user object without password
userSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    picture: this.picture,
    role: this.role,
    quizProgress: this.quizProgress || [],
    learningProgress: this.learningProgress || [],
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);
export default User;
