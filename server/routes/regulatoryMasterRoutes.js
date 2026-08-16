import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper to determine if user has unlocked access to this course
async function resolveUserAccess(req, courseSlug) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'regmate_jwt_secret_key_2026_secure');
      const user = await User.findById(decoded.id);
      if (user) {
        if (user.role === 'admin') return { hasAccess: true, isMember: true, user };
        const isMember = Boolean(
          user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date()
        );
        if (isMember) return { hasAccess: true, isMember: true, user };
        const hasBought = (user.coursePurchases || []).some(p => p.courseSlug === courseSlug);
        if (hasBought) return { hasAccess: true, isMember: false, user };
        return { hasAccess: false, isMember: false, user };
      }
    } catch (e) {
      // Ignore token decode error and treat as unauthenticated
    }
  }
  return { hasAccess: false, isMember: false, user: null };
}

// ─── Content file mapping ──────────────────────────────────────────────────
const COURSE_FILES = {
  'ifsca-cmi': 'reglearn-cmi-content.json',
  'ifsca-fme': 'reglearn-fme-content.json',
  'sebi-aif':  'reglearn-aif-content.json',
};

const DATA_DIR = path.join(__dirname, '..', 'data', 'regulatory-master');

// Cache loaded JSON in memory (loaded once, never mutated)
const _cache = {};

function loadCourse(courseSlug) {
  if (_cache[courseSlug]) return _cache[courseSlug];
  const filename = COURSE_FILES[courseSlug];
  if (!filename) return null;
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  _cache[courseSlug] = JSON.parse(raw);
  return _cache[courseSlug];
}

// ─── Answer stripping ──────────────────────────────────────────────────────
// SECURITY: These fields MUST NEVER reach the browser on serve endpoints.
const ANSWER_FIELDS = [
  'correct_key', 'correct_text', 'explanation', 'pairs',
  'answer', 'correct_answer', 'blanks'
];

function sanitizeItem(item) {
  if (!item || typeof item !== 'object') return item;
  const sanitized = { ...item };
  for (const field of ANSWER_FIELDS) {
    delete sanitized[field];
  }
  // Also strip from nested payload if present
  if (sanitized.payload && typeof sanitized.payload === 'object') {
    const p = { ...sanitized.payload };
    for (const field of ANSWER_FIELDS) {
      delete p[field];
    }
    sanitized.payload = p;
  }
  return sanitized;
}

// ─── GET /api/regulatory-master/:courseSlug/meta ───────────────────────────
// Returns course metadata, chapter list, item counts, and live user access status
router.get('/:courseSlug/meta', async (req, res) => {
  const course = loadCourse(req.params.courseSlug);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  const { hasAccess, isMember, user } = await resolveUserAccess(req, req.params.courseSlug);

  // Build chapter map from concepts (group by chapter)
  const chapterMap = {};
  (course.concepts || []).forEach(concept => {
    const chNo = concept.chapter;
    if (!chapterMap[chNo]) {
      chapterMap[chNo] = {
        num: chNo,
        name: concept.chapter_name || `Chapter ${chNo}`,
        band: concept.band || '',
        lessonCount: 0,
        questionCount: 0,
        totalItems: 0,
        isLocked: chNo > 1 ? !hasAccess : false
      };
    }
  });

  // Count lessons vs questions per chapter from the questions array
  (course.questions || []).forEach(q => {
    const chNo = q.module_no;
    if (!chapterMap[chNo]) {
      chapterMap[chNo] = {
        num: chNo,
        name: q.module_name || `Chapter ${chNo}`,
        band: '',
        lessonCount: 0,
        questionCount: 0,
        totalItems: 0,
        isLocked: chNo > 1 ? !hasAccess : false
      };
    }
    if (q.type === 'lesson' || q.itemType === 'lesson') {
      chapterMap[chNo].lessonCount += 1;
    } else {
      chapterMap[chNo].questionCount += 1;
    }
    chapterMap[chNo].totalItems += 1;
  });

  // Also count lessons from the lessons array
  (course.lessons || []).forEach(les => {
    const chNo = les.chapterNo || les.module_no || 1;
    if (!chapterMap[chNo]) {
      chapterMap[chNo] = {
        num: chNo,
        name: `Chapter ${chNo}`,
        band: '',
        lessonCount: 0,
        questionCount: 0,
        totalItems: 0,
        isLocked: chNo > 1 ? !hasAccess : false
      };
    }
    chapterMap[chNo].lessonCount += 1;
    chapterMap[chNo].totalItems += 1;
  });

  const chapters = Object.values(chapterMap).sort((a, b) => a.num - b.num);

  return res.json({
    courseSlug: req.params.courseSlug,
    plugin: course.plugin || '',
    source: course.source || '',
    counts: course.counts || {},
    chapters,
    userAccess: {
      hasAccess,
      isMember,
      isAuthenticated: Boolean(user)
    }
  });
});

// ─── GET /api/regulatory-master/:courseSlug/items ─────────────────────────
// Returns ALL items (lessons + questions) stripped of answer fields.
// Optional query: ?type=lesson|mcq|all  ?chapter=1
router.get('/:courseSlug/items', async (req, res) => {
  const course = loadCourse(req.params.courseSlug);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  const { hasAccess, isMember } = await resolveUserAccess(req, req.params.courseSlug);
  const typeFilter = req.query.type || 'all';
  const chapterFilter = req.query.chapter ? parseInt(req.query.chapter, 10) : null;

  // Combine lessons and questions into unified items array
  const allItems = [];

  // Process lessons array
  (course.lessons || []).forEach(les => {
    const chNo = les.chapterNo || les.module_no || 1;
    if (chapterFilter && chNo !== chapterFilter) return;
    // Pass through all lesson fields, normalising the chapter field
    const item = sanitizeItem({
      ...les,
      itemType: 'lesson',
      chapterNo: chNo,
      module_no: chNo,
      module_name: les.chapter_name || les.module_name || '',
      isLocked: chNo > 1 ? !hasAccess : false
    });
    allItems.push(item);
  });

  // Process questions array
  (course.questions || []).forEach(q => {
    const chNo = q.module_no;
    if (chapterFilter && chNo !== chapterFilter) return;

    const isLesson = q.type === 'lesson' || q.itemType === 'lesson';
    if (typeFilter === 'lesson' && !isLesson) return;
    if (typeFilter === 'mcq' && isLesson) return;

    allItems.push({
      ...sanitizeItem(q),
      isLocked: chNo > 1 ? !hasAccess : false
    });
  });

  // Sort by chapter then UID
  allItems.sort((a, b) => {
    const chA = a.module_no || a.chapterNo || 0;
    const chB = b.module_no || b.chapterNo || 0;
    if (chA !== chB) return chA - chB;
    return (a.uid || '').localeCompare(b.uid || '');
  });

  return res.json({
    courseSlug: req.params.courseSlug,
    items: allItems,
    total: allItems.length,
    hasAccess,
    isMember
  });
});

// ─── GET /api/regulatory-master/:courseSlug/items/:uid ────────────────────
// Returns a single sanitized item by UID
router.get('/:courseSlug/items/:uid', async (req, res) => {
  const course = loadCourse(req.params.courseSlug);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const { hasAccess } = await resolveUserAccess(req, req.params.courseSlug);
  const uid = req.params.uid;

  // Search lessons
  const lesson = (course.lessons || []).find(l => l.uid === uid);
  if (lesson) {
    const chNo = lesson.chapterNo || lesson.module_no || 1;
    return res.json({
      ...sanitizeItem({ ...lesson, itemType: 'lesson' }),
      isLocked: chNo > 1 ? !hasAccess : false
    });
  }

  // Search questions
  const question = (course.questions || []).find(q => q.uid === uid);
  if (question) {
    const chNo = question.module_no || 1;
    return res.json({
      ...sanitizeItem(question),
      isLocked: chNo > 1 ? !hasAccess : false
    });
  }

  return res.status(404).json({ message: 'Item not found' });
});

// ─── POST /api/regulatory-master/:courseSlug/submit-answer ─────────────────
// Receives user's answer, checks server-side, returns result.
// Enforces access restriction on chapters > 1.
router.post('/:courseSlug/submit-answer', async (req, res) => {
  try {
    const { uid, answer } = req.body;
    if (!uid || answer === undefined || answer === null) {
      return res.status(400).json({ message: 'uid and answer are required' });
    }

    const course = loadCourse(req.params.courseSlug);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Find the item in questions array
    const item = (course.questions || []).find(q => q.uid === uid);
    if (!item) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const chNo = item.module_no || 1;
    const { hasAccess } = await resolveUserAccess(req, req.params.courseSlug);
    if (chNo > 1 && !hasAccess) {
      return res.status(403).json({
        message: 'This chapter requires purchasing the course or upgrading to RegMate All-Access Membership.',
        locked: true
      });
    }

    const correctKey = item.correct_key || item.blanks || item.pairs;
    const correctText = item.correct_text || item.blanks || item.pairs || '';
    const explanation = item.explanation || '';

    if (!correctKey) {
      return res.status(422).json({ message: 'No answer key found for this item' });
    }

    // Normalize both to uppercase for comparison (or trim for text fill)
    const normUser = String(answer).toUpperCase().trim();
    const normKey = String(correctKey).toUpperCase().trim();
    const isCorrect = normUser === normKey;

    let courseProgress = null;

    // Record first-attempt in user's courseProgress if authenticated
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const { default: jwt } = await import('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'regmate_jwt_secret_key_2026_secure');
        const user = await User.findById(decoded.id);
        if (user) {
          const courseSlug = req.params.courseSlug;
          if (!user.courseProgress) user.courseProgress = [];

          let cpEntry = user.courseProgress.find(c => c.courseSlug === courseSlug);
          if (!cpEntry) {
            cpEntry = {
              courseSlug,
              completedItems: [uid],
              quizAnswers: [{ uid, selectedOption: String(answer), isCorrect, timestamp: new Date() }],
              updatedAt: new Date()
            };
            user.courseProgress.push(cpEntry);
          } else {
            // Only record first attempt — never overwrite
            const alreadyAnswered = cpEntry.quizAnswers.find(a => a.uid === uid);
            if (!alreadyAnswered) {
              cpEntry.quizAnswers.push({ uid, selectedOption: String(answer), isCorrect, timestamp: new Date() });
            }
            if (!cpEntry.completedItems.includes(uid)) {
              cpEntry.completedItems.push(uid);
            }
            cpEntry.updatedAt = new Date();
          }

          await user.save();
          courseProgress = user.courseProgress;
        }
      } catch (_) {
        // Auth check error, proceed without saving
      }
    }

    // Return result — explanation is ONLY sent here, after submission
    return res.json({
      uid,
      isCorrect,
      correctKey,
      correctText,
      explanation,
      courseProgress,
    });
  } catch (err) {
    console.error('Submit answer error:', err);
    return res.status(500).json({ message: 'Error processing answer', error: err.message });
  }
});

// ─── POST /api/regulatory-master/:courseSlug/mark-lesson ──────────────────
// Auth optional. Marks a lesson UID as read/completed in courseProgress.
router.post('/:courseSlug/mark-lesson', async (req, res) => {
  try {
    const { uid, markAs } = req.body; // markAs: 'complete' | 'incomplete'
    if (!uid) return res.status(400).json({ message: 'uid is required' });

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const { default: jwt } = await import('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'regmate_jwt_secret_key_2026_secure');
        const user = await User.findById(decoded.id);
        if (user) {
          const courseSlug = req.params.courseSlug;
          if (!user.courseProgress) user.courseProgress = [];

          let cpEntry = user.courseProgress.find(c => c.courseSlug === courseSlug);
          if (!cpEntry) {
            cpEntry = { courseSlug, completedItems: [], quizAnswers: [], updatedAt: new Date() };
            user.courseProgress.push(cpEntry);
          }

          const markComplete = markAs !== 'incomplete';
          if (markComplete && !cpEntry.completedItems.includes(uid)) {
            cpEntry.completedItems.push(uid);
          } else if (!markComplete) {
            const idx = cpEntry.completedItems.indexOf(uid);
            if (idx >= 0) cpEntry.completedItems.splice(idx, 1);
          }
          cpEntry.updatedAt = new Date();

          await user.save();
          return res.json({ message: 'Lesson progress updated', courseProgress: user.courseProgress, user: user.toAuthJSON() });
        }
      } catch (_) {}
    }

    return res.json({ message: 'Lesson marked (guest)' });
  } catch (err) {
    console.error('Mark lesson error:', err);
    return res.status(500).json({ message: 'Error updating lesson progress', error: err.message });
  }
});

export default router;
