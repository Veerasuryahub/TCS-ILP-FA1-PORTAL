import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';

// @desc    Get all subjects with student progress calculation
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({});
    
    // Fetch all student results to calculate progress
    const userId = req.user._id;
    const userResults = await Result.find({ userId });

    const subjectsWithProgress = await Promise.all(
      subjects.map(async (subject) => {
        // Find total questions in database for this subject
        const totalQuestions = await Question.countDocuments({ subject: subject.name });

        // Calculate correct answers by this user for this subject
        // Get all results for this subject
        const subjectResults = userResults.filter((r) => r.subject === subject.name);
        
        // Find unique question IDs correctly answered
        const correctQuestionIds = new Set();
        subjectResults.forEach((result) => {
          result.answers.forEach((ans) => {
            if (ans.isCorrect) {
              correctQuestionIds.add(ans.questionId.toString());
            }
          });
        });

        const progressPercent = totalQuestions > 0 
          ? Math.min(Math.round((correctQuestionIds.size / totalQuestions) * 100), 100) 
          : 0;

        return {
          _id: subject._id,
          name: subject.name,
          description: subject.description,
          icon: subject.icon,
          totalQuestions,
          completedCount: correctQuestionIds.size,
          progress: progressPercent,
        };
      })
    );

    return res.json({ success: true, data: subjectsWithProgress });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching subjects' });
  }
};

// @desc    Get single subject detail
// @route   GET /api/subjects/:id
// @access  Private
export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Get topics list dynamically from questions of this subject
    const topics = await Question.distinct('topic', { subject: subject.name });
    
    // Count questions per difficulty
    const easyCount = await Question.countDocuments({ subject: subject.name, difficulty: 'Easy' });
    const mediumCount = await Question.countDocuments({ subject: subject.name, difficulty: 'Medium' });
    const hardCount = await Question.countDocuments({ subject: subject.name, difficulty: 'Hard' });
    const totalCount = easyCount + mediumCount + hardCount;

    return res.json({
      success: true,
      data: {
        _id: subject._id,
        name: subject.name,
        description: subject.description,
        icon: subject.icon,
        topics,
        difficultyBreakdown: {
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount,
          total: totalCount,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
