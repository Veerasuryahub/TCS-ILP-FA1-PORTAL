import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'BookOpen', // default Lucide icon name
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
