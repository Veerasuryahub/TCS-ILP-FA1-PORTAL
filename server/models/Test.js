import mongoose from 'mongoose';

const testAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  answer: {
    type: mongoose.Schema.Types.Mixed, // String for MCQ answer, or String/Code for SPQ
  },
  isFlagged: {
    type: Boolean,
    default: false, // TCS iON Mark for Review flag
  },
});

const testSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  testType: {
    type: String,
    enum: ['MCQ', 'SPQ', 'Full Mock'],
    required: true,
  },
  subject: {
    type: String, // Subject name or 'Full Mock'
    required: true,
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  answers: {
    type: [testAnswerSchema],
    default: [],
  },
  score: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'submitted'],
    default: 'active',
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  totalDuration: {
    type: Number, // in seconds (e.g. 1800 for MCQ, 3600 for SPQ)
    default: 1800,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
    default: null,
  },
});

const Test = mongoose.model('Test', testSchema);
export default Test;
