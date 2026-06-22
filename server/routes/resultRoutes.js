import express from 'express';
import { getResults, getResultsByUserId, getAdminDashboardStats } from '../controllers/resultController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getResults);
router.get('/admin/dashboard', protect, adminOnly, getAdminDashboardStats);
router.get('/:userId', protect, adminOnly, getResultsByUserId);

export default router;
