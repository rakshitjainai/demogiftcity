import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'regmate_jwt_secret_key_2026_secure', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Account with this email already exists. Please log in instead.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isAdmin = email.toLowerCase().includes('admin') || (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: isAdmin ? 'admin' : 'member',
      membershipStatus: isAdmin ? 'active' : 'free',
      subscriptionPlan: isAdmin ? 'Admin Tier' : 'Free Tier'
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: user.toAuthJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with email & password
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    const normalizedEmail = email.toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '';

    // Check if logging in as server env Admin
    if (adminEmail && normalizedEmail === adminEmail && password === adminPassword) {
      let adminUser = await User.findOne({ email: normalizedEmail });
      if (!adminUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        adminUser = await User.create({
          name: 'System Admin',
          email: normalizedEmail,
          password: hashedPassword,
          phone: '',
          role: 'admin',
          membershipStatus: 'active',
          subscriptionPlan: 'Admin Tier'
        });
      } else if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        adminUser.membershipStatus = 'active';
        await adminUser.save();
      }

      const token = generateToken(adminUser._id);
      return res.json({
        token,
        user: adminUser.toAuthJSON()
      });
    }

    let user = await User.findOne({ email: normalizedEmail });

    // If user is not found in DB, ask to sign up first
    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email. Please sign up first!'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password. Please check your credentials.' });
    }

    // Ensure role is admin if email contains admin
    if ((normalizedEmail.includes('admin') || (adminEmail && normalizedEmail === adminEmail)) && user.role !== 'admin') {
      user.role = 'admin';
      user.membershipStatus = 'active';
      await user.save();
    }

    const token = generateToken(user._id);

    return res.json({
      token,
      user: user.toAuthJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    return res.json({
      user: req.user.toAuthJSON()
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching user details' });
  }
});

// @route   POST /api/auth/update-usage
// @desc    Track quiz answer count or chapter read count for Knowledge Hub restrictions
// @access  Private
router.post('/update-usage', protect, async (req, res) => {
  try {
    const { type, chapterSlug } = req.body;
    const user = req.user;

    if (type === 'quiz') {
      user.quizQuestionsAnswered = (user.quizQuestionsAnswered || 0) + 1;
    } else if (type === 'chapter' && chapterSlug) {
      if (!user.chaptersRead) user.chaptersRead = [];
      if (!user.chaptersRead.includes(chapterSlug)) {
        user.chaptersRead.push(chapterSlug);
      }
    }

    await user.save();

    return res.json({
      success: true,
      user: user.toAuthJSON()
    });
  } catch (error) {
    console.error('Update usage error:', error);
    return res.status(500).json({ message: 'Server error updating usage' });
  }
});

export default router;

