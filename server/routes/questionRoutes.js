import express from 'express';
import multer from 'multer';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, importQuestions } from '../controllers/questionController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// Multer memory storage configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/', protect, getQuestions);
router.post('/', protect, adminOnly, createQuestion);
router.put('/:id', protect, adminOnly, updateQuestion);
router.delete('/:id', protect, adminOnly, deleteQuestion);
router.post('/import', protect, adminOnly, upload.single('file'), importQuestions);

export default router;
