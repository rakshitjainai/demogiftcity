import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Define Candidate Schema for Job Product
const jobCandidateSchema = new mongoose.Schema({
  candidate_code: String,
  name: String,
  mobile: String,
  email: String,
  role: String,
  experience: String,
  interview_timing: String,
  access_token_hash: String,
  current_page: { type: String, default: 'home' },
  current_section: { type: String, default: '' },
  current_index: { type: Number, default: 0 },
  last_active: { type: Date, default: Date.now }
}, { timestamps: true });

// Define Activity Schema for Job Product
const jobActivitySchema = new mongoose.Schema({
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCandidate' },
  event_name: String,
  section_name: String,
  item_index: Number,
  item_title: String,
  score: Number,
  metadata_json: String
}, { timestamps: true });

const JobCandidate = mongoose.models.JobCandidate || mongoose.model('JobCandidate', jobCandidateSchema);
const JobActivity = mongoose.models.JobActivity || mongoose.model('JobActivity', jobActivitySchema);

// Helper for generating tokens
const generateToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token || '').digest('hex');

// Format candidate response for job interface
const formatCandidateResponse = (c, rawToken, jwtToken, userJson) => ({
  ok: true,
  candidate_id: c._id.toString(),
  candidate_code: c.candidate_code,
  access_token: rawToken,
  token: jwtToken,
  user: userJson,
  name: c.name,
  mobile: c.mobile,
  email: c.email,
  role: c.role || '',
  experience: c.experience || '',
  interview_timing: c.interview_timing || '',
  current_page: c.current_page || 'home',
  current_section: c.current_section || '',
  current_index: c.current_index || 0
});

// Middleware to parse x-www-form-urlencoded and json payloads
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Handle ping.php / ping
const handlePing = async (req, res) => {
  return res.json({
    ok: true,
    service: 'RegMate API',
    database: true,
    method: req.method
  });
};

// Handle register.php / register
const handleRegister = async (req, res) => {
  try {
    const { name, mobile, email, role, experience, interview_timing } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanMobile = (mobile || '').trim();

    if (!cleanName || !cleanMobile || !cleanEmail) {
      return res.status(422).json({ ok: false, message: 'Please enter a valid name, mobile and email.' });
    }

    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);

    let candidate = await JobCandidate.findOne({ email: cleanEmail });

    if (candidate) {
      candidate.name = cleanName;
      candidate.mobile = cleanMobile;
      if (role) candidate.role = role;
      if (experience) candidate.experience = experience;
      if (interview_timing) candidate.interview_timing = interview_timing;
      candidate.access_token_hash = tokenHash;
      candidate.last_active = new Date();
      await candidate.save();
    } else {
      const code = 'REG-' + crypto.randomBytes(3).toString('hex').toUpperCase();
      candidate = await JobCandidate.create({
        candidate_code: code,
        name: cleanName,
        mobile: cleanMobile,
        email: cleanEmail,
        role: role || '',
        experience: experience || '',
        interview_timing: interview_timing || '',
        access_token_hash: tokenHash
      });
    }

    // Ensure User record exists in MongoDB
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        phone: cleanMobile,
        role: 'member',
        membershipStatus: 'free',
        subscriptionPlan: 'Free Tier'
      });
    }
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'regmate_jwt_secret_key_2026_secure', { expiresIn: '30d' });

    await JobActivity.create({
      candidate_id: candidate._id,
      event_name: 'registration',
      section_name: 'home'
    });

    return res.json({
      ok: true,
      candidate_id: candidate._id.toString(),
      candidate_code: candidate.candidate_code,
      access_token: rawToken,
      token: jwtToken,
      user: user.toAuthJSON()
    });
  } catch (error) {
    console.error('Job registration error:', error);
    return res.status(500).json({ ok: false, message: 'Registration could not be completed.' });
  }
};

// Handle login.php / login
const handleLogin = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanMobile = (mobile || '').trim();

    const candidate = await JobCandidate.findOne({ email: cleanEmail, mobile: cleanMobile });
    if (!candidate) {
      return res.status(404).json({ ok: false, message: 'We could not find a matching RegMate profile. Check your email and mobile.' });
    }

    const rawToken = generateToken();
    candidate.access_token_hash = hashToken(rawToken);
    candidate.last_active = new Date();
    await candidate.save();

    // Ensure User record exists in MongoDB
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = await User.create({
        name: candidate.name,
        email: cleanEmail,
        phone: cleanMobile,
        role: 'member',
        membershipStatus: 'free',
        subscriptionPlan: 'Free Tier'
      });
    }
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'regmate_jwt_secret_key_2026_secure', { expiresIn: '30d' });

    await JobActivity.create({
      candidate_id: candidate._id,
      event_name: 'resume_login',
      section_name: 'resume'
    });

    return res.json(formatCandidateResponse(candidate, rawToken, jwtToken, user.toAuthJSON()));
  } catch (error) {
    console.error('Job login error:', error);
    return res.status(500).json({ ok: false, message: 'Login could not be completed.' });
  }
};

// Auth helper for candidate requests
const authJobCandidate = async (req, res) => {
  const candidate_id = req.body.candidate_id;
  const access_token = req.body.access_token;
  if (!candidate_id || !access_token) return null;

  try {
    const candidate = await JobCandidate.findById(candidate_id);
    if (!candidate) return null;
    if (candidate.access_token_hash !== hashToken(access_token)) return null;

    candidate.last_active = new Date();
    await candidate.save();
    return candidate;
  } catch (e) {
    return null;
  }
};

// Handle profile.php / profile
const handleProfile = async (req, res) => {
  const candidate = await authJobCandidate(req, res);
  if (!candidate) return res.status(401).json({ ok: false, message: 'Unauthorised' });

  const { role, experience, interview_timing } = req.body;
  if (role) candidate.role = role;
  if (experience) candidate.experience = experience;
  if (interview_timing) candidate.interview_timing = interview_timing;
  await candidate.save();

  return res.json({ ok: true });
};

// Handle progress.php / progress
const handleProgress = async (req, res) => {
  const candidate = await authJobCandidate(req, res);
  if (!candidate) return res.status(401).json({ ok: false, message: 'Unauthorised' });

  const { page, section, index } = req.body;
  if (page) candidate.current_page = page;
  if (section !== undefined) candidate.current_section = section;
  if (index !== undefined) candidate.current_index = Number(index);
  await candidate.save();

  return res.json({ ok: true });
};

// Handle event.php / event
const handleEvent = async (req, res) => {
  const candidate = await authJobCandidate(req, res);
  if (!candidate) return res.status(401).json({ ok: false, message: 'Unauthorised' });

  const { event_name, section_name, item_index, item_title, score, metadata } = req.body;
  if (!event_name) return res.status(422).json({ ok: false, message: 'Missing event' });

  await JobActivity.create({
    candidate_id: candidate._id,
    event_name,
    section_name: section_name || '',
    item_index: item_index ? Number(item_index) : null,
    item_title: item_title || '',
    score: score !== undefined ? Number(score) : null,
    metadata_json: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null
  });

  return res.json({ ok: true });
};

// Handle resume.php / resume
const handleResume = async (req, res) => {
  const candidate = await authJobCandidate(req, res);
  if (!candidate) return res.status(401).json({ ok: false, message: 'Unauthorised' });

  return res.json({
    ok: true,
    candidate: {
      id: candidate._id.toString(),
      code: candidate.candidate_code,
      name: candidate.name,
      mobile: candidate.mobile,
      email: candidate.email,
      role: candidate.role,
      experience: candidate.experience,
      interview_timing: candidate.interview_timing,
      current_page: candidate.current_page,
      current_section: candidate.current_section,
      current_index: candidate.current_index
    }
  });
};

// Register endpoints for both PHP filename routes and raw action routes
router.all('/ping.php', handlePing);
router.all('/ping', handlePing);

router.all('/register.php', handleRegister);
router.all('/register', handleRegister);

router.all('/login.php', handleLogin);
router.all('/login', handleLogin);

router.all('/profile.php', handleProfile);
router.all('/profile', handleProfile);

router.all('/progress.php', handleProgress);
router.all('/progress', handleProgress);

router.all('/event.php', handleEvent);
router.all('/event', handleEvent);

router.all('/resume.php', handleResume);
router.all('/resume', handleResume);

export default router;
