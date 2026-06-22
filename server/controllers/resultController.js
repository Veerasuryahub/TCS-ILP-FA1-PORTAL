import Result from '../models/Result.js';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Test from '../models/Test.js';

// @desc    Get user results history or admin stats
// @route   GET /api/results
// @access  Private
export const getResults = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // If admin requests, return all results populated with user info
      const results = await Result.find({}).populate('userId', 'name email college').sort({ createdAt: -1 });
      return res.json({ success: true, count: results.length, data: results });
    } else {
      // Return student's own results
      const results = await Result.find({ userId: req.user._id }).sort({ createdAt: -1 });
      return res.json({ success: true, count: results.length, data: results });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error retrieving results' });
  }
};

// @desc    Get specific student results (Admin only)
// @route   GET /api/results/:userId
// @access  Private/Admin
export const getResultsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const results = await Result.find({ userId }).sort({ createdAt: -1 });
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Student user not found' });
    }

    return res.json({ success: true, user, count: results.length, data: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error retrieving student results' });
  }
};

// @desc    Get Admin Dashboard Stats (Total Students, Total Questions, Total Tests, Recent Activities)
// @route   GET /api/results/admin/dashboard
// @access  Private/Admin
export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalQuestions = await Question.countDocuments({});
    const totalTests = await Result.countDocuments({});

    // Recent test activities
    const recentActivities = await Result.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Dynamic stats: Average score, easy vs medium vs hard question counts
    const results = await Result.find({});
    let averageScore = 0;
    if (results.length > 0) {
      const sum = results.reduce((acc, curr) => acc + curr.score, 0);
      averageScore = Math.round(sum / results.length);
    }

    return res.json({
      success: true,
      data: {
        totalStudents,
        totalQuestions,
        totalTests,
        averageScore,
        recentActivities: recentActivities.map(act => ({
          _id: act._id,
          studentName: act.userId ? act.userId.name : 'Unknown User',
          studentEmail: act.userId ? act.userId.email : '',
          subject: act.subject,
          testType: act.testType,
          score: act.score,
          correct: act.correct,
          wrong: act.wrong,
          timeTaken: act.timeTaken,
          createdAt: act.createdAt
        }))
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error compiling dashboard analytics' });
  }
};
