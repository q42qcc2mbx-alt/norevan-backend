import { Router } from 'express';
import { listReviews, createReview } from '../controllers/reviewsController.js';
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

export default router;
