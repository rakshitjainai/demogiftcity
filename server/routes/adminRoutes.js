import express from 'express';
import User from '../models/User.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Apply requireAdmin middleware to all admin routes
router.use(requireAdmin);

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics & analytics for admin panel directly from MongoDB
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeMembers = await User.countDocuments({ membershipStatus: 'active' });
    const nonMembers = await User.countDocuments({ membershipStatus: { $ne: 'active' } });

    // Calculate new users registered in current calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Fetch user progress fields for aggregation
    const users = await User.find({}, 'name email role membershipStatus subscriptionPlan quizQuestionsAnswered chaptersRead quizProgress examReadyAttempts createdAt updatedAt');

    let totalQuizAnswers = 0;
    let totalReadingAccess = 0;
    let totalExamAttempts = 0;
    const chapterFreq = {};
    const quizTopicFreq = {};
    const recentActivities = [];

    users.forEach(u => {
      // Quiz totals
      totalQuizAnswers += (u.quizQuestionsAnswered || 0);
      if (u.quizProgress && u.quizProgress.length) {
        totalQuizAnswers += u.quizProgress.length;
        u.quizProgress.forEach(qp => {
          if (qp.topicId) {
            quizTopicFreq[qp.topicId] = (quizTopicFreq[qp.topicId] || 0) + 1;
          }
        });
      }

      // Reading totals
      if (u.chaptersRead && Array.isArray(u.chaptersRead)) {
        totalReadingAccess += u.chaptersRead.length;
        u.chaptersRead.forEach(ch => {
          chapterFreq[ch] = (chapterFreq[ch] || 0) + 1;
        });
      }

      // Exam ready totals
      if (u.examReadyAttempts && Array.isArray(u.examReadyAttempts)) {
        totalExamAttempts += u.examReadyAttempts.length;
      }

      // Track recent activity events
      if (u.createdAt) {
        recentActivities.push({
          type: 'signup',
          userName: u.name,
          text: `registered a new account`,
          timestamp: u.createdAt
        });
      }
      if (u.membershipStatus === 'active') {
        recentActivities.push({
          type: 'membership',
          userName: u.name,
          text: `became a Premium Member`,
          timestamp: u.updatedAt || u.createdAt
        });
      }
      if (u.quizQuestionsAnswered > 0) {
        recentActivities.push({
          type: 'quiz',
          userName: u.name,
          text: `completed ${u.quizQuestionsAnswered} quiz questions`,
          timestamp: u.updatedAt || u.createdAt
        });
      }
    });

    // Sort recent activities by newest first (top 15)
    recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivityFeed = recentActivities.slice(0, 15);

    // Generate monthly growth stats from MongoDB createdAt
    const monthlyGrowth = {};
    users.forEach(u => {
      if (u.createdAt) {
        const monthKey = new Date(u.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyGrowth[monthKey] = (monthlyGrowth[monthKey] || 0) + 1;
      }
    });

    // Top chapters read
    const topChapters = Object.entries(chapterFreq)
      .map(([chapter, count]) => ({ chapter, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top quizzes
    const topQuizzes = Object.entries(quizTopicFreq)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Plan distribution
    const planCounts = {
      'Free Tier': nonMembers,
      'Premium Member': activeMembers
    };

    return res.json({
      stats: {
        totalUsers,
        activeMembers,
        nonMembers,
        newUsersThisMonth,
        totalQuizAnswers,
        totalReadingAccess,
        totalExamAttempts,
        conversionRate: totalUsers > 0 ? Math.round((activeMembers / totalUsers) * 100) : 0
      },
      growth: Object.entries(monthlyGrowth).map(([month, count]) => ({ month, count })),
      planDistribution: planCounts,
      topChapters,
      topQuizzes,
      recentActivityFeed
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ message: 'Server error loading admin stats' });
  }
});

// @route   GET /api/admin/users
// @desc    Get full list of registered users (passwords excluded)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    const safeUsers = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone || 'N/A',
      role: u.role || 'member',
      membershipStatus: u.membershipStatus || 'free',
      subscriptionPlan: u.subscriptionPlan || 'Free Tier',
      quizQuestionsAnswered: u.quizQuestionsAnswered || 0,
      chaptersReadCount: (u.chaptersRead || []).length,
      examReadyAttemptsCount: (u.examReadyAttempts || []).length,
      createdAt: u.createdAt
    }));

    return res.json({ users: safeUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error fetching user list' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get detailed profile & usage stats for a specific user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        role: user.role || 'member',
        membershipStatus: user.membershipStatus || 'free',
        subscriptionPlan: user.subscriptionPlan || 'Free Tier',
        quizQuestionsAnswered: user.quizQuestionsAnswered || 0,
        chaptersRead: user.chaptersRead || [],
        quizProgress: user.quizProgress || [],
        learningProgress: user.learningProgress || [],
        examReadyAttempts: user.examReadyAttempts || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching user detail:', error);
    return res.status(500).json({ message: 'Server error fetching user details' });
  }
});

// @route   POST /api/admin/toggle-membership
// @desc    Toggle or grant/revoke active membership for a user
router.post('/toggle-membership', async (req, res) => {
  try {
    const { userId, status, plan } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.membershipStatus = status || (user.membershipStatus === 'active' ? 'free' : 'active');
    user.subscriptionPlan = plan || (user.membershipStatus === 'active' ? 'Premium Member' : 'Free Tier');
    await user.save();

    return res.json({
      success: true,
      message: `User membership updated to ${user.membershipStatus}`,
      user: {
        id: user._id,
        membershipStatus: user.membershipStatus,
        subscriptionPlan: user.subscriptionPlan
      }
    });
  } catch (error) {
    console.error('Error updating user membership:', error);
    return res.status(500).json({ message: 'Server error updating membership' });
  }
});

export default router;
