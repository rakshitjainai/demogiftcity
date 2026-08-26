import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = path.join(__dirname, '..', 'data', 'examready');

const EXAM_CONFIGS = {
  'fme-full-length-mock-test': {
    slug: 'fme-full-length-mock-test',
    title: 'IFSCA (Fund Management) Regulations, 2025 — Full Length Mock Test',
    short_title: 'FME Mock Test',
    track: 'RegReady — FME / Fund Management',
    file: 'FME_Question_Bank.json',
    duration_minutes: 90,
    marks_per_question: 1,
    negative_marking: -0.25,
    pass_benchmark_pct: 70,
    required_entitlements: ['REGREADY_FME_001', 'REGMATE_ANNUAL'],
    sku: 'REGREADY_FME_001',
    price_inr: 499,
    disclaimer: 'This is an independent simulation product by RegMate. It is not affiliated with or an official substitute for any statutory regulatory examination.',
    certificate_prefix: 'RM-FME'
  },
  'cmi-full-length-mock-test': {
    slug: 'cmi-full-length-mock-test',
    title: 'IFSCA CMI Regulations — Full Mock Test',
    short_title: 'IFSCA CMI Mock Test',
    track: 'RegReady — CMI / Capital Market Intermediaries',
    file: 'IFSC_CMI_Question_Bank.json',
    duration_minutes: 90,
    marks_per_question: 1,
    negative_marking: -0.25,
    pass_benchmark_pct: 50,
    required_entitlements: ['ifsca-cmi', 'REGMATE_ANNUAL'],
    sku: 'ifsca-cmi',
    price_inr: 499,
    disclaimer: 'Independent practice examination simulation by RegMate.',
    certificate_prefix: 'RM-CMI'
  }
};

// Aliases
function resolveExamSlug(slug) {
  if (!slug) return 'cmi-full-length-mock-test';
  const clean = String(slug).toLowerCase().trim();
  if (clean === 'fme' || clean === 'fme-mock-test' || clean === 'ifsca-fme' || clean === 'fme-full-length-mock-test') {
    return 'fme-full-length-mock-test';
  }
  return 'cmi-full-length-mock-test';
}

const _cache = {};

function loadQuestionsForExam(examSlug) {
  const canonical = resolveExamSlug(examSlug);
  const config = EXAM_CONFIGS[canonical];
  if (!config) return [];

  const filePath = path.join(DATA_DIR, config.file);
  if (!fs.existsSync(filePath)) return [];

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    _cache[canonical] = parsed;
    return parsed;
  } catch (err) {
    console.error(`Error loading questions for ${canonical}:`, err);
    return _cache[canonical] || [];
  }
}

/**
 * Server-Side Access Control Resolver
 * Checks if user is authorized to access Question 3+ of the specified test.
 */
async function resolveUserExamAccess(req, examSlug) {
  const canonical = resolveExamSlug(examSlug);
  const config = EXAM_CONFIGS[canonical];

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'regmate_jwt_secret_key_2026_secure');
      const user = await User.findById(decoded.id);

      if (user) {
        if (user.role === 'admin') {
          return { hasAccess: true, isMember: true, user, isGuest: false };
        }

        const now = new Date();
        const isMember = Boolean(
          user.membership?.expiresAt && new Date(user.membership.expiresAt) > now
        );
        if (isMember) {
          return { hasAccess: true, isMember: true, user, isGuest: false };
        }

        // Check required entitlements
        const hasEntitlement = (config.required_entitlements || []).some(code =>
          user.hasEntitlement ? user.hasEntitlement(code) : false
        );

        if (hasEntitlement) {
          return { hasAccess: true, isMember: false, user, isGuest: false };
        }

        return { hasAccess: false, isMember: false, user, isGuest: false };
      }
    } catch (e) {
      // Invalid token treated as guest
    }
  }

  return { hasAccess: false, isMember: false, user: null, isGuest: true };
}

/**
 * SECURITY: Never send correct answers or explanations on the questions endpoint
 */
function sanitizeQuestion(q) {
  const { correct_answer, correct_option, explanation, ...safe } = q;
  return safe;
}

/**
 * Calculates Readiness Band according to Doc 07 §18-20
 */
function calculateReadinessBand(percentage) {
  if (percentage >= 75) return 'STRONGLY EXAM READY';
  if (percentage >= 70) return 'EXAM READY';
  if (percentage >= 60) return 'NEAR READY';
  if (percentage >= 50) return 'NEEDS TARGETED REVISION';
  return 'SIGNIFICANT PREPARATION REQUIRED';
}

// ─── GET /api/exam-ready/meta & /api/exam-ready/:slug/meta ────────────────
router.get(['/meta', '/:slug/meta'], async (req, res) => {
  const slug = req.params.slug || 'cmi-full-length-mock-test';
  const canonical = resolveExamSlug(slug);
  const config = EXAM_CONFIGS[canonical];
  const questions = loadQuestionsForExam(canonical);

  const { hasAccess, isMember, user } = await resolveUserExamAccess(req, canonical);

  const topicMap = {};
  questions.forEach(q => {
    const key = q.topic_number || q.domain || 1;
    if (!topicMap[key]) {
      topicMap[key] = {
        topic_number: q.topic_number || 1,
        topic_name: q.topic_name || q.domain || 'Domain',
        count: 0
      };
    }
    topicMap[key].count += 1;
  });

  return res.json({
    slug: canonical,
    exam_name: config.title,
    short_title: config.short_title,
    track: config.track,
    total: questions.length,
    free_preview_count: 2,
    duration_minutes: config.duration_minutes,
    marks_per_question: config.marks_per_question,
    negative_marking: config.negative_marking,
    pass_benchmark_pct: config.pass_benchmark_pct,
    sku: config.sku,
    price_inr: config.price_inr,
    disclaimer: config.disclaimer,
    topics: Object.values(topicMap).sort((a, b) => a.topic_number - b.topic_number),
    readiness_bands: [
      { band: 'STRONGLY EXAM READY', min_pct: 75, max_pct: 100 },
      { band: 'EXAM READY', min_pct: 70, max_pct: 74.99 },
      { band: 'NEAR READY', min_pct: 60, max_pct: 69.99 },
      { band: 'NEEDS TARGETED REVISION', min_pct: 50, max_pct: 59.99 },
      { band: 'SIGNIFICANT PREPARATION REQUIRED', min_pct: 0, max_pct: 49.99 }
    ],
    userAccess: {
      hasAccess,
      isMember,
      isAuthenticated: Boolean(user)
    }
  });
});

// ─── GET /api/exam-ready/questions & /api/exam-ready/:slug/questions ──────
// SERVER-SIDE PAYWALL ENFORCEMENT:
// Q1 and Q2 are FREE/PREVIEW.
// Q3 onwards are LOCKED unless user has active entitlement (REGREADY_FME_001 or REGMATE_ANNUAL).
router.get(['/questions', '/:slug/questions'], async (req, res) => {
  const slug = req.params.slug || 'cmi-full-length-mock-test';
  const canonical = resolveExamSlug(slug);
  const config = EXAM_CONFIGS[canonical];
  const questions = loadQuestionsForExam(canonical);

  if (!questions || questions.length === 0) {
    return res.status(404).json({ message: 'Question bank not found for this test' });
  }

  const { hasAccess, isMember, user } = await resolveUserExamAccess(req, canonical);

  // Map questions with server-side payload stripping for locked questions
  const safeQuestions = questions.map((q, idx) => {
    const isFreePreview = idx < 2; // Question 1 & 2 are free
    const isLocked = !hasAccess && !isFreePreview;

    if (isLocked) {
      // Locked payload: strip all question and answer data so it cannot be inspected
      return {
        question_code: q.question_code,
        topic_number: q.topic_number,
        topic_name: q.topic_name,
        difficulty: q.difficulty,
        access_level: 'PREMIUM',
        isLocked: true
      };
    }

    // Unlocked / Free payload: full question text and options, stripped of answer fields
    return {
      ...sanitizeQuestion(q),
      access_level: isFreePreview ? 'PREVIEW' : 'PREMIUM',
      isLocked: false
    };
  });

  const topicMap = {};
  questions.forEach(q => {
    const key = q.topic_number || 1;
    if (!topicMap[key]) {
      topicMap[key] = {
        topic_number: q.topic_number || 1,
        topic_name: q.topic_name || q.domain || 'Domain',
        count: 0
      };
    }
    topicMap[key].count += 1;
  });

  return res.json({
    slug: canonical,
    total: questions.length,
    free_preview_count: 2,
    hasAccess,
    isMember,
    topics: Object.values(topicMap).sort((a, b) => a.topic_number - b.topic_number),
    questions: safeQuestions
  });
});

// ─── POST /api/exam-ready/submit-test & /api/exam-ready/:slug/submit-test ─
router.post(['/submit-test', '/:slug/submit-test'], async (req, res) => {
  try {
    const slug = req.params.slug || 'cmi-full-length-mock-test';
    const canonical = resolveExamSlug(slug);
    const config = EXAM_CONFIGS[canonical];
    const questions = loadQuestionsForExam(canonical);

    const { answers, time_taken_seconds, candidate_name } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers array is required' });
    }

    const { hasAccess, isMember, user, isGuest } = await resolveUserExamAccess(req, canonical);

    // Build user answer lookup
    const answerMap = {};
    answers.forEach(a => {
      if (a.question_code) {
        answerMap[a.question_code] = String(a.selected || '').toUpperCase().trim();
      }
    });

    // Determine evaluate set (free users can only evaluate first 2 questions)
    const evaluatedQuestions = hasAccess ? questions : questions.slice(0, 2);

    let rawScore = 0;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    const domainMap = {};
    const difficultyMap = {
      Beginner: { total: 0, correct: 0, wrong: 0, unanswered: 0 },
      Intermediate: { total: 0, correct: 0, wrong: 0, unanswered: 0 },
      Advanced: { total: 0, correct: 0, wrong: 0, unanswered: 0 },
      Expert: { total: 0, correct: 0, wrong: 0, unanswered: 0 }
    };

    const perQuestion = [];

    evaluatedQuestions.forEach(q => {
      const selected = answerMap[q.question_code] || null;
      const correctAnswer = String(q.correct_answer || q.correct_option || '').toUpperCase().trim();
      let isCorrect = false;
      let pointsAwarded = 0;

      if (!selected) {
        unanswered += 1;
        pointsAwarded = 0;
      } else if (selected === correctAnswer) {
        isCorrect = true;
        correct += 1;
        pointsAwarded = config.marks_per_question;
        rawScore += config.marks_per_question;
      } else {
        wrong += 1;
        pointsAwarded = config.negative_marking;
        rawScore += config.negative_marking;
      }

      // Domain tracking
      const dn = q.topic_number || 1;
      if (!domainMap[dn]) {
        domainMap[dn] = {
          topic_number: dn,
          topic_name: q.topic_name || `Domain ${dn}`,
          total: 0,
          correct: 0,
          wrong: 0,
          unanswered: 0
        };
      }
      domainMap[dn].total += 1;
      if (isCorrect) domainMap[dn].correct += 1;
      else if (!selected) domainMap[dn].unanswered += 1;
      else domainMap[dn].wrong += 1;

      // Difficulty tracking
      const diffKey = q.difficulty || 'Intermediate';
      if (!difficultyMap[diffKey]) {
        difficultyMap[diffKey] = { total: 0, correct: 0, wrong: 0, unanswered: 0 };
      }
      difficultyMap[diffKey].total += 1;
      if (isCorrect) difficultyMap[diffKey].correct += 1;
      else if (!selected) difficultyMap[diffKey].unanswered += 1;
      else difficultyMap[diffKey].wrong += 1;

      // Per-question result with explanation ONLY revealed in submit response
      perQuestion.push({
        question_code: q.question_code,
        topic_number: q.topic_number,
        topic_name: q.topic_name,
        subtopic: q.subtopic || '',
        difficulty: q.difficulty,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        selected,
        correct_answer: correctAnswer,
        explanation: q.explanation,
        regulatory_reference: q.regulatory_reference,
        isCorrect,
        pointsAwarded
      });
    });

    const totalQuestions = evaluatedQuestions.length;
    const maxScore = totalQuestions * config.marks_per_question;
    const percentage = totalQuestions > 0
      ? Math.max(0, Math.round(((rawScore / maxScore) * 100) * 100) / 100)
      : 0;
    const passed = percentage >= config.pass_benchmark_pct;
    const readiness_band = calculateReadinessBand(percentage);

    // Derived analytics
    const domainArray = Object.values(domainMap).map(d => ({
      ...d,
      accuracy_pct: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
    })).sort((a, b) => a.topic_number - b.topic_number);

    const strongestTopics = domainArray.filter(d => d.accuracy_pct >= 70).map(d => d.topic_name);
    const priorityRevision = domainArray.filter(d => d.accuracy_pct < 70).map(d => d.topic_name);

    // Certificate generation if score >= benchmark and full test was taken
    let certificate = null;
    if (hasAccess && passed) {
      const certNum = `${config.certificate_prefix}-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;
      certificate = {
        eligible: true,
        certificate_number: certNum,
        candidate_name: candidate_name || user?.name || 'Verified Candidate',
        programme: config.track,
        score: rawScore,
        maxScore,
        percentage,
        readiness_band,
        completion_date: new Date().toISOString().split('T')[0],
        verification_url: `https://regmate.in/verify/${certNum}`
      };
    }

    const result = {
      slug: canonical,
      exam_name: config.title,
      rawScore: Math.round(rawScore * 100) / 100,
      maxScore,
      percentage,
      passed,
      pass_benchmark_pct: config.pass_benchmark_pct,
      readiness_band,
      correct,
      wrong,
      unanswered,
      total_evaluated: totalQuestions,
      full_exam_total: questions.length,
      is_preview_result: !hasAccess,
      time_taken_seconds: time_taken_seconds || 0,
      domainBreakdown: domainArray,
      difficultyBreakdown: difficultyMap,
      strongestTopics,
      priorityRevision,
      certificate,
      perQuestion,
      submittedAt: new Date()
    };

    // Save attempt if authenticated
    if (user) {
      if (!user.examReadyAttempts) user.examReadyAttempts = [];
      user.examReadyAttempts.push({
        attemptDate: new Date(),
        rawScore: result.rawScore,
        percentage: result.percentage,
        passStatus: result.passed
      });
      await user.save();
      result.attemptSaved = true;
    }

    return res.json(result);

  } catch (err) {
    console.error('Submit test error:', err);
    return res.status(500).json({ message: 'Error processing test submission', error: err.message });
  }
});

export default router;
