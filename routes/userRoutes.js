import { Router } from 'express';
import { getDashboard, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.get('/dashboard', protect, getDashboard);
router.post(
  '/account/change-password',
  rateLimit({ windowMs: 60_000, max: 10, key: 'change-pw' }),
  protect,
  changePassword,
);

export default router;
