import { Router } from 'express';
import { getDashboard } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/dashboard', protect, getDashboard);

export default router;
