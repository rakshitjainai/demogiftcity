import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const QUESTION_BANK_PATH = path.join(__dirname, '..', 'data', 'examready', 'IFSC_CMI_Question_Bank.json');

// Cache in memory
let _questions = null;

function loadQuestions() {
  if (_questions) return _questions;
  if (!fs.existsSync(QUESTION_BANK_PATH)) return [];
  const raw = fs.readFileSync(QUESTION_BANK_PATH, 'utf-8');
  _questions = JSON.parse(raw);
  return _questions;
}

// ─── SECURITY: Strip answer fields before sending to client ───────────────
function sanitizeQuestion(q) {
  // NEVER send correct_answer or explanation to the client on the serve path
  const { correct_answer, explanation, ...safe } = q;
  return safe;
}

// ─── GET /api/exam-ready/questions ────────────────────────────────────────
// Returns all 100 questions with answer fields stripped.
// No auth required — test can be started without login.
router.get('/questions', (req, res) => {
  const questions = loadQuestions();
  if (!questions || questions.length === 0) {
    return res.status(404).json({ message: 'Question bank not found' });
  }

  const sanitized = questions.filter(q => q.status === 'live' || !q.status).map(sanitizeQuestion);

  // Build topic summary for UI
  const topicMap = {};
  sanitized.forEach(q => {
    const key = q.topic_number;
    if (!topicMap[key]) {
      topicMap[key] = { topic_number: q.topic_number, topic_name: q.topic_name, count: 0 };
    }
    topicMap[key].count += 1;
  });

  return res.json({
    total: sanitized.length,
    topics: Object.values(topicMap).sort((a, b) => a.topic_number - b.topic_number),
    questions: sanitized,
  });
});

// ─── GET /api/exam-ready/meta ─────────────────────────────────────────────
// Lightweight metadata for the landing page
router.get('/meta', (req, res) => {
  const questions = loadQuestions();
  const live = questions.filter(q => q.status === 'live' || !q.status);

  const topicMap = {};
  live.forEach(q => {
    const key = q.topic_number;
    if (!topicMap[key]) {
      topicMap[key] = { topic_number: q.topic_number, topic_name: q.topic_name, count: 0 };
    }
    topicMap[key].count += 1;
  });

  return res.json({
    total: live.length,
    topics: Object.values(topicMap).sort((a, b) => a.topic_number - b.topic_number),
    duration_minutes: 90,
    negative_marking: -0.25,
    pass_threshold_pct: 50,
    exam_name: 'IFSCA CMI Regulations — Mock Test',
  });
});

// ─── POST /api/exam-ready/submit-test ────────────────────────────────────
// Auth optional (unauthenticated users get results but no history saved).
// Body: { answers: [ { question_code: "CMI-S001", selected: "A" }, ... ] }
// Returns full scored results with explanations (ONLY after submission).
router.post('/submit-test', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers array is required' });
    }

    const questions = loadQuestions();
    const liveQuestions = questions.filter(q => q.status === 'live' || !q.status);

    // Build answer lookup
    const answerMap = {};
    answers.forEach(a => {
      if (a.question_code) answerMap[a.question_code] = String(a.selected || '').toUpperCase().trim();
    });

    let rawScore = 0;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    const domainMap = {};
    const perQuestion = [];

    liveQuestions.forEach(q => {
      const selected = answerMap[q.question_code] || null;
      const correctAnswer = String(q.correct_answer || '').toUpperCase().trim();
      let isCorrect = false;
      let pointsAwarded = 0;

      if (!selected) {
        unanswered += 1;
        pointsAwarded = 0;
      } else if (selected === correctAnswer) {
        isCorrect = true;
        correct += 1;
        pointsAwarded = 1;
        rawScore += 1;
      } else {
        wrong += 1;
        pointsAwarded = -0.25;
        rawScore -= 0.25;
      }

      // Domain breakdown
      const dn = q.topic_number;
      if (!domainMap[dn]) {
        domainMap[dn] = {
          topic_number: dn,
          topic_name: q.topic_name,
          total: 0,
          correct: 0,
          wrong: 0,
          unanswered: 0,
        };
      }
      domainMap[dn].total += 1;
      if (isCorrect) domainMap[dn].correct += 1;
      else if (!selected) domainMap[dn].unanswered += 1;
      else domainMap[dn].wrong += 1;

      // Per-question result — explanation ONLY appears here, in submit response
      perQuestion.push({
        question_code: q.question_code,
        topic_number: q.topic_number,
        topic_name: q.topic_name,
        difficulty: q.difficulty,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        selected: selected || null,
        correct_answer: correctAnswer,  // Revealed only in submit response
        explanation: q.explanation,     // Revealed only in submit response
        isCorrect,
        pointsAwarded,
      });
    });

    const totalQuestions = liveQuestions.length;
    const maxScore = totalQuestions;
    const percentage = totalQuestions > 0
      ? Math.round(((rawScore / maxScore) * 100) * 100) / 100
      : 0;
    const passed = percentage >= 50;

    const result = {
      rawScore: Math.round(rawScore * 100) / 100,
      maxScore,
      percentage,
      passed,
      correct,
      wrong,
      unanswered,
      domainBreakdown: Object.values(domainMap).sort((a, b) => a.topic_number - b.topic_number),
      perQuestion,
      submittedAt: new Date(),
    };

    // Save attempt if user is authenticated
    // Check auth header manually (no middleware so unauthenticated can also use this route)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const { default: jwt } = await import('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'regmate_jwt_secret_key_2026_secure');
        const user = await User.findById(decoded.id);
        if (user) {
          if (!user.examReadyAttempts) user.examReadyAttempts = [];
          user.examReadyAttempts.push({
            attemptDate: new Date(),
            rawScore: result.rawScore,
            percentage: result.percentage,
            passStatus: result.passed,
          });
          await user.save();
          result.attemptSaved = true;
        }
      } catch (_) {
        // Silently skip — don't fail the result response if auth check fails
        result.attemptSaved = false;
      }
    }

    return res.json(result);
  } catch (err) {
    console.error('Submit test error:', err);
    return res.status(500).json({ message: 'Error processing test submission', error: err.message });
  }
});

export default router;
