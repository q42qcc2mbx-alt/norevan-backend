import { Router } from 'express';
import {
  validateDiscount,
  listDiscounts,
  createDiscount,
  toggleDiscount,
} from '../controllers/discountController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Public preview of a code (no reservation).
router.post(
  '/discount/validate',
  rateLimit({ windowMs: 60_000, max: 30, key: 'discount' }),
  validateDiscount,
);

// Admin management.
router.get('/admin/discounts', protect, requireRole('admin'), listDiscounts);
router.post('/admin/discounts', protect, requireRole('admin'), createDiscount);
router.patch('/admin/discounts/:code', protect, requireRole('admin'), toggleDiscount);

export default router;
