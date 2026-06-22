import express from 'express';
import { startTest, runTestSPQ, submitTest, getTestResult } from '../controllers/testController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/start', protect, startTest);
router.post('/run-spq', protect, runTestSPQ);
router.post('/submit', protect, submitTest);
router.get('/result/:id', protect, getTestResult);

export default router;
