import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/user/progress
// @desc    Get user quiz & learning progress
// @access  Private
router.get('/progress', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json({
      quizProgress: user.quizProgress || [],
      learningProgress: user.learningProgress || [],
      courseProgress: user.courseProgress || [],
      readingProgress: user.readingProgress || null,
      xp: user.xp || 0,
      streak: user.streak || 0,
      badges: user.badges || [],
      mistakesLog: user.mistakesLog || []
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
});

// @route   POST /api/user/quiz-result
// @desc    Save or update quiz progress for a topic
// @access  Private
router.post('/quiz-result', protect, async (req, res) => {
  try {
    const { topicId, score, totalQuestions, passed } = req.body;

    if (!topicId || score === undefined || !totalQuestions) {
      return res.status(400).json({ message: 'Missing required quiz result data' });
    }

    const percentage = Math.round((score / totalQuestions) * 100);
    const user = await User.findById(req.user._id);

    const existingIdx = user.quizProgress.findIndex(p => p.topicId === topicId);

    const quizEntry = {
      topicId,
      score,
      totalQuestions,
      percentage,
      passed: passed !== undefined ? passed : percentage >= 70,
      updatedAt: new Date()
    };

    if (existingIdx >= 0) {
      user.quizProgress[existingIdx] = quizEntry;
    } else {
      user.quizProgress.push(quizEntry);
    }

    await user.save();

    return res.json({
      message: 'Quiz progress saved successfully',
      quizProgress: user.quizProgress,
      user: user.toAuthJSON()
    });
  } catch (error) {
    console.error('Save quiz error:', error);
    return res.status(500).json({ message: 'Error saving quiz result', error: error.message });
  }
});

// @route   POST /api/user/learning-progress
// @desc    Save learning module progress
// @access  Private
router.post('/learning-progress', protect, async (req, res) => {
  try {
    const { moduleId, completedLessons, progress } = req.body;

    if (!moduleId) {
      return res.status(400).json({ message: 'Module ID is required' });
    }

    const user = await User.findById(req.user._id);
    const existingIdx = user.learningProgress.findIndex(p => p.moduleId === moduleId);

    const entry = {
      moduleId,
      completedLessons: completedLessons || [],
      progress: progress || 0,
      updatedAt: new Date()
    };

    if (existingIdx >= 0) {
      user.learningProgress[existingIdx] = entry;
    } else {
      user.learningProgress.push(entry);
    }

    await user.save();

    return res.json({
      message: 'Learning progress saved successfully',
      learningProgress: user.learningProgress,
      user: user.toAuthJSON()
    });
  } catch (error) {
    console.error('Save learning progress error:', error);
    return res.status(500).json({ message: 'Error saving learning progress', error: error.message });
  }
});

// @route   GET /api/user/filing-status
// @desc    Get user annual filing tracker status
// @access  Private
router.get('/filing-status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json({
      filingStatus: user.filingStatus || []
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching filing status', error: error.message });
  }
});

// @route   POST /api/user/filing-status
// @desc    Save or update user filing status
// @access  Private
router.post('/filing-status', protect, async (req, res) => {
  try {
    const { filingId, status, dateFiled } = req.body;

    if (!filingId) {
      return res.status(400).json({ message: 'filingId is required' });
    }

    const user = await User.findById(req.user._id);
    const existingIdx = (user.filingStatus || []).findIndex(f => f.filingId === filingId);

    const entry = {
      filingId,
      status: status || 'Not Started',
      dateFiled: dateFiled || '',
      updatedAt: new Date()
    };

    if (!user.filingStatus) {
      user.filingStatus = [];
    }

    if (existingIdx >= 0) {
      user.filingStatus[existingIdx] = entry;
    } else {
      user.filingStatus.push(entry);
    }

    await user.save();

    return res.json({
      message: 'Filing status updated successfully',
      filingStatus: user.filingStatus,
      user: user.toAuthJSON()
    });
  } catch (error) {
    console.error('Save filing status error:', error);
    return res.status(500).json({ message: 'Error saving filing status', error: error.message });
  }
});
// @desc    Toggle or mark a course lesson/question UID as completed
// @access  Private
router.post('/course-progress/toggle-item', protect, async (req, res) => {
  try {
    const { courseSlug, itemUid } = req.body;
    if (!courseSlug || !itemUid) {
      return res.status(400).json({ message: 'courseSlug and itemUid are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user.courseProgress) user.courseProgress = [];

    let entry = user.courseProgress.find(c => c.courseSlug === courseSlug);
    if (!entry) {
      entry = { courseSlug, completedItems: [itemUid], quizAnswers: [], updatedAt: new Date() };
      user.courseProgress.push(entry);
    } else {
      const idx = entry.completedItems.indexOf(itemUid);
      if (idx >= 0) {
        entry.completedItems.splice(idx, 1);
      } else {
        entry.completedItems.push(itemUid);
      }
      entry.updatedAt = new Date();
    }

    await user.save();
    return res.json({
      message: 'Course progress updated successfully',
      courseProgress: user.courseProgress,
      user: user.toAuthJSON()
    });
  } catch (error) {
    console.error('Toggle course item error:', error);
    return res.status(500).json({ message: 'Error saving course progress', error: error.message });
  }
});

// @route   POST /api/user/course-progress/answer-mcq
// @desc    Record MCQ answer choice & mark completed
// @access  Private
router.post('/course-progress/answer-mcq', protect, async (req, res) => {
  try {
    const { courseSlug, itemUid, selectedOption, isCorrect } = req.body;
    if (!courseSlug || !itemUid) {
      return res.status(400).json({ message: 'courseSlug and itemUid are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user.courseProgress) user.courseProgress = [];

    let entry = user.courseProgress.find(c => c.courseSlug === courseSlug);
    if (!entry) {
      entry = { courseSlug, completedItems: [itemUid], quizAnswers: [{ uid: itemUid, selectedOption, isCorrect, timestamp: new Date() }], updatedAt: new Date() };
      user.courseProgress.push(entry);
    } else {
      if (!entry.completedItems.includes(itemUid)) {
        entry.completedItems.push(itemUid);
      }
      const existingAnswerIdx = entry.quizAnswers.findIndex(a => a.uid === itemUid);
      const answerObj = { uid: itemUid, selectedOption, isCorrect, timestamp: new Date() };
      if (existingAnswerIdx >= 0) {
        entry.quizAnswers[existingAnswerIdx] = answerObj;
      } else {
        entry.quizAnswers.push(answerObj);
      }
      entry.updatedAt = new Date();
    }

    await user.save();
    return res.json({
      message: 'MCQ answer saved successfully',
      courseProgress: user.courseProgress,
      user: user.toAuthJSON()
    });
  } catch (error) {
    console.error('Answer MCQ error:', error);
    return res.status(500).json({ message: 'Error saving MCQ answer', error: error.message });
  }
});

// @route   POST /api/user/reading-progress
// @desc    Save last viewed act/chapter/section for Continue Reading
// @access  Private
router.post('/reading-progress', protect, async (req, res) => {
  try {
    const { actSlug, chapter, sectionNum, sectionTitle } = req.body;
    if (!actSlug) {
      return res.status(400).json({ message: 'actSlug is required' });
    }

    const user = await User.findById(req.user._id);
    user.readingProgress = {
      actSlug,
      chapter: chapter || 'chapter-1',
      sectionNum: sectionNum || '1',
      sectionTitle: sectionTitle || '',
      updatedAt: new Date()
    };

    await user.save();
    return res.json({
      message: 'Reading progress updated successfully',
      readingProgress: user.readingProgress,
      user: user.toAuthJSON()
    });
  } catch (error) {
    console.error('Save reading progress error:', error);
    return res.status(500).json({ message: 'Error saving reading progress', error: error.message });
  }
});

export default router;
