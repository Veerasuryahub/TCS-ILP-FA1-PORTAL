import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
});

const questionSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    index: true,
  },
  topic: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ['MCQ', 'SPQ'],
    required: true,
    index: true,
  },
  question: {
    type: String,
    required: true, // Title of SPQ or question itself for MCQ
  },
  // MCQ specific fields
  options: {
    type: [String], // Array of 4 options
    default: undefined,
  },
  answer: {
    type: String, // Correct option text or index
    default: '',
  },
  explanation: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  // SPQ specific fields
  description: {
    type: String, // Detailed markdown instruction
    default: '',
  },
  inputFormat: {
    type: String,
    default: '',
  },
  outputFormat: {
    type: String,
    default: '',
  },
  sampleInput: {
    type: String,
    default: '',
  },
  sampleOutput: {
    type: String,
    default: '',
  },
  constraints: {
    type: String,
    default: '',
  },
  testCases: {
    type: [testCaseSchema],
    default: undefined,
  },
  starterCode: {
    type: String,
    default: '',
  },
  solution: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
