import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';
import User from '../models/User.js';
import { runJavaCode, runUnixCode } from '../utils/runner.js';

// Helper to shuffle arrays
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// @desc    Start a new test session (MCQ or SPQ or Full Mock)
// @route   POST /api/test/start
// @access  Private
export const startTest = async (req, res) => {
  const { testType, subject } = req.body; // testType: 'MCQ' | 'SPQ' | 'Full Mock'

  try {
    let selectedQuestions = [];
    let duration = 1800; // 30 mins default for MCQ

    if (testType === 'Full Mock') {
      // Full mock requires Section 1 (SPQ, 60m, 3 Qs) and Section 2 (MCQ, 30m, 30 Qs)
      // Since they are separate sections in TCS iON, we will let them do them as separate test types: 'MCQ' or 'SPQ'.
      // If 'Full Mock' is chosen, we will launch an MCQ test of 30 questions representing all subjects.
      const subjects = ['HTML', 'CSS', 'JavaScript', 'Java', 'Unix', 'SQL', 'PL SQL'];
      const questionsPerSubject = 4; // ~28 questions total plus 2 extra
      
      const allMcqs = [];
      for (const sub of subjects) {
        const mcqs = await Question.find({ subject: sub, questionType: 'MCQ' });
        const shuffled = shuffleArray(mcqs).slice(0, questionsPerSubject);
        allMcqs.push(...shuffled);
      }
      
      // Pad to 30 questions
      if (allMcqs.length < 30) {
        const fallbackMcqs = await Question.find({ questionType: 'MCQ', _id: { $nin: allMcqs.map(q => q._id) } });
        const shuffledFallback = shuffleArray(fallbackMcqs).slice(0, 30 - allMcqs.length);
        allMcqs.push(...shuffledFallback);
      }

      selectedQuestions = shuffleArray(allMcqs).slice(0, 30);
      duration = 1800; // 30 minutes
    } else if (testType === 'MCQ') {
      // Single subject MCQ practice (e.g. 10 or 15 questions)
      const mcqs = await Question.find({ subject, questionType: 'MCQ' });
      selectedQuestions = shuffleArray(mcqs).slice(0, 15); // Default to 15 questions for topic practice
      duration = 900; // 15 minutes
    } else if (testType === 'SPQ') {
      // Hands-on SPQ: 3 questions (Q1: Java OOP, Q2: Java Problem Solving, Q3: Unix)
      duration = 3600; // 60 minutes
      
      // Q1: Java OOP
      const q1Pool = await Question.find({ 
        subject: 'Java', 
        questionType: 'SPQ', 
        topic: { $in: ['OOP', 'Classes', 'Objects', 'Constructor', 'Inheritance', 'Polymorphism', 'Abstraction', 'Encapsulation', 'Interface', 'Method Overloading', 'Method Overriding'] } 
      });
      const q1 = shuffleArray(q1Pool)[0];

      // Q2: Java Problem Solving
      const q2Pool = await Question.find({ 
        subject: 'Java', 
        questionType: 'SPQ', 
        topic: { $nin: ['OOP', 'Classes', 'Objects', 'Constructor', 'Inheritance', 'Polymorphism', 'Abstraction', 'Encapsulation', 'Interface', 'Method Overloading', 'Method Overriding'] } 
      });
      const q2 = shuffleArray(q2Pool)[0];

      // Q3: Unix
      const q3Pool = await Question.find({ subject: 'Unix', questionType: 'SPQ' });
      const q3 = shuffleArray(q3Pool)[0];

      // Combine
      if (q1) selectedQuestions.push(q1);
      if (q2) selectedQuestions.push(q2);
      if (q3) selectedQuestions.push(q3);

      // Fallback in case topics are not classified strictly
      if (selectedQuestions.length < 3) {
        const anySpqs = await Question.find({ questionType: 'SPQ', _id: { $nin: selectedQuestions.map(q => q._id) } });
        const shuffledSpqs = shuffleArray(anySpqs).slice(0, 3 - selectedQuestions.length);
        selectedQuestions.push(...shuffledSpqs);
      }
    }

    if (selectedQuestions.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions available for this practice session.' });
    }

    // Save test session
    const test = await Test.create({
      userId: req.user._id,
      testType,
      subject: testType === 'Full Mock' ? 'Full Mock' : subject,
      questions: selectedQuestions.map(q => q._id),
      answers: selectedQuestions.map(q => ({ questionId: q._id, answer: '', isFlagged: false })),
      totalDuration: duration,
      status: 'active',
    });

    // Populate questions without correct answers/explanations for security
    const sanitizedQuestions = selectedQuestions.map(q => {
      const qObj = q.toObject();
      delete qObj.answer;
      delete qObj.explanation;
      delete qObj.solution;
      if (qObj.testCases) {
        // Only return non-hidden test cases to client
        qObj.testCases = qObj.testCases.filter(tc => !tc.isHidden);
      }
      return qObj;
    });

    return res.status(201).json({
      success: true,
      data: {
        testId: test._id,
        testType: test.testType,
        subject: test.subject,
        duration: test.totalDuration,
        questions: sanitizedQuestions,
        answers: test.answers,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error starting assessment' });
  }
};

// @desc    Run SPQ code against SAMPLE test cases (Interactive coding)
// @route   POST /api/test/run-spq
// @access  Private
export const runTestSPQ = async (req, res) => {
  const { questionId, code } = req.body;

  try {
    const question = await Question.findById(questionId);
    if (!question || question.questionType !== 'SPQ') {
      return res.status(404).json({ success: false, message: 'SPQ question not found' });
    }

    // Sample test cases only
    const sampleCases = question.testCases.filter(tc => !tc.isHidden);
    
    let runResult;
    if (question.subject === 'Java') {
      runResult = await runJavaCode(code, sampleCases);
    } else if (question.subject === 'Unix') {
      runResult = await runUnixCode(code, sampleCases);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported language runner' });
    }

    return res.json({ success: true, data: runResult });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error executing code', error: error.message });
  }
};

// @desc    Submit a completed test, score it, and compile results
// @route   POST /api/test/submit
// @access  Private
export const submitTest = async (req, res) => {
  const { testId, answers, timeSpent } = req.body; // answers: [{ questionId, answer, isFlagged }]

  try {
    const test = await Test.findById(testId).populate('questions');
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test session not found' });
    }

    if (test.status === 'submitted') {
      return res.status(400).json({ success: false, message: 'Test has already been submitted' });
    }

    test.answers = answers;
    test.status = 'submitted';
    test.timeSpent = timeSpent;
    test.submittedAt = new Date();

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const scoredAnswers = [];

    // Evaluate answers
    for (const q of test.questions) {
      const studentAnsObj = answers.find(a => a.questionId.toString() === q._id.toString());
      const studentAnswerText = studentAnsObj ? studentAnsObj.answer : '';

      if (q.questionType === 'MCQ') {
        const isCorrect = studentAnswerText === q.answer;
        if (isCorrect) {
          correctCount++;
          score += 10; // 10 points per MCQ
        } else {
          wrongCount++;
        }
        scoredAnswers.push({
          questionId: q._id,
          userAnswer: studentAnswerText,
          correctAnswer: q.answer,
          isCorrect,
          explanation: q.explanation,
        });
      } else {
        // Hands-on SPQ: Compile & run code against ALL test cases (including hidden cases)
        const codeToExecute = studentAnswerText || q.starterCode || '';
        
        let runResult;
        if (q.subject === 'Java') {
          runResult = await runJavaCode(codeToExecute, q.testCases);
        } else if (q.subject === 'Unix') {
          runResult = await runUnixCode(codeToExecute, q.testCases);
        }

        const totalCases = q.testCases.length;
        let passedCases = 0;
        
        if (runResult && runResult.success) {
          passedCases = runResult.results.filter(r => r.passed).length;
        }

        // Calculate score percentage for this question
        const isCorrect = passedCases === totalCases;
        const questionScore = totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0;
        score += questionScore; // max 100 points per SPQ
        
        if (isCorrect) {
          correctCount++;
        } else {
          wrongCount++;
        }

        scoredAnswers.push({
          questionId: q._id,
          userAnswer: codeToExecute,
          correctAnswer: q.solution,
          isCorrect,
          explanation: `Passed ${passedCases}/${totalCases} test cases.\n\n` + q.explanation,
        });
      }
    }

    await test.save();

    // Create Result entry
    const result = await Result.create({
      userId: req.user._id,
      subject: test.subject,
      testType: test.testType,
      score,
      totalQuestions: test.questions.length,
      correct: correctCount,
      wrong: wrongCount,
      timeTaken: timeSpent,
      answers: scoredAnswers,
    });

    // Update user stats, streak badges
    const user = await User.findById(req.user._id);
    if (user) {
      if (!user.badges.includes('First Step')) {
        user.badges.push('First Step');
      }

      // Check for perfect score
      const maxPossibleScore = test.testType === 'SPQ' ? (test.questions.length * 100) : (test.questions.length * 10);
      if (score === maxPossibleScore && !user.badges.includes('Perfect Score')) {
        user.badges.push('Perfect Score');
      }

      // Speedster badge (submitting in under 30% of total duration with score > 70%)
      const scorePercentage = (score / maxPossibleScore) * 100;
      if (timeSpent < (test.totalDuration * 0.3) && scorePercentage >= 70 && !user.badges.includes('Speedster')) {
        user.badges.push('Speedster');
      }

      await user.save();
    }

    return res.status(201).json({
      success: true,
      resultId: result._id,
      score,
      correct: correctCount,
      wrong: wrongCount,
      timeTaken: timeSpent,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error submitting test', error: error.message });
  }
};

// @desc    Get detailed result by resultId
// @route   GET /api/test/result/:id
// @access  Private
export const getTestResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate({
        path: 'answers.questionId',
        select: 'question description options difficulty subject topic questionType inputFormat outputFormat sampleInput sampleOutput constraints'
      });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result report not found' });
    }

    // Security Check: Only the student who took the test or an admin can access this result
    if (result.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this result report' });
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error retrieving result details' });
  }
};
