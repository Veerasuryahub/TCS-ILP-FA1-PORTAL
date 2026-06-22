import Result from '../models/Result.js';
import User from '../models/User.js';

// @desc    Get leaderboard rankings (Overall & Weekly)
// @route   GET /api/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    // 1. Overall Aggregation
    const overallAgg = await Result.aggregate([
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          correctCount: { $sum: '$correct' },
          wrongCount: { $sum: '$wrong' },
          testsTaken: { $sum: 1 },
          averageScore: { $avg: '$score' },
        }
      },
      { $sort: { totalScore: -1, correctCount: -1 } },
      { $limit: 20 }
    ]);

    // Populate user data for overall
    const overallLeaderboard = await Promise.all(
      overallAgg.map(async (entry, index) => {
        const user = await User.findById(entry._id).select('name college streak badges');
        return {
          rank: index + 1,
          userId: entry._id,
          name: user ? user.name : 'Alumnus',
          college: user ? user.college : 'N/A',
          streak: user ? user.streak : 0,
          badges: user ? user.badges : [],
          totalScore: entry.totalScore,
          averageScore: Math.round(entry.averageScore),
          testsTaken: entry.testsTaken,
          correctCount: entry.correctCount,
        };
      })
    );

    // 2. Weekly Aggregation
    const weeklyAgg = await Result.aggregate([
      { $match: { createdAt: { $gte: startOfWeek } } },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          correctCount: { $sum: '$correct' },
          wrongCount: { $sum: '$wrong' },
          testsTaken: { $sum: 1 },
          averageScore: { $avg: '$score' },
        }
      },
      { $sort: { totalScore: -1, correctCount: -1 } },
      { $limit: 20 }
    ]);

    // Populate user data for weekly
    const weeklyLeaderboard = await Promise.all(
      weeklyAgg.map(async (entry, index) => {
        const user = await User.findById(entry._id).select('name college streak badges');
        return {
          rank: index + 1,
          userId: entry._id,
          name: user ? user.name : 'Alumnus',
          college: user ? user.college : 'N/A',
          streak: user ? user.streak : 0,
          badges: user ? user.badges : [],
          totalScore: entry.totalScore,
          averageScore: Math.round(entry.averageScore),
          testsTaken: entry.testsTaken,
          correctCount: entry.correctCount,
        };
      })
    );

    return res.json({
      success: true,
      data: {
        overall: overallLeaderboard,
        weekly: weeklyLeaderboard
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error compiling leaderboard rankings' });
  }
};
