import { Router } from 'express';
import {
  listReviews,
  createReview,
  listAllReviews,
  deleteReview,
} from '../controllers/reviewsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';
import { requireRealUser } from '../middleware/supabaseAuthMiddleware.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Public read.
router.get('/products/:slug/reviews', listReviews);

// Submit / update own review — real (non-guest) accounts only.
router.post(
  '/reviews',
  rateLimit({ windowMs: 60_000, max: 15, key: 'reviews' }),
  requireRealUser,
  createReview,
);

// Moderation — admins & owners.
router.get('/admin/reviews', protect, requireRole('admin'), listAllReviews);
router.delete('/admin/reviews/:id', protect, requireRole('admin'), deleteReview);

export default router;
