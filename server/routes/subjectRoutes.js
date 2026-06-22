import express from 'express';
import { getSubjects, getSubjectById } from '../controllers/subjectController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getSubjects);
router.get('/:id', protect, getSubjectById);

export default router;
