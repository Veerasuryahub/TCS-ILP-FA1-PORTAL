import mongoose from 'mongoose';

const resultAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  userAnswer: {
    type: mongoose.Schema.Types.Mixed,
  },
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  explanation: {
    type: String,
  },
});

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  subject: {
    type: String, // e.g. 'Java', 'Unix', 'Full Mock'
    required: true,
    index: true,
  },
  testType: {
    type: String,
    enum: ['MCQ', 'SPQ', 'Full Mock'],
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correct: {
    type: Number,
    required: true,
  },
  wrong: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number, // in seconds
    required: true,
  },
  answers: {
    type: [resultAnswerSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Result = mongoose.model('Result', resultSchema);
export default Result;
