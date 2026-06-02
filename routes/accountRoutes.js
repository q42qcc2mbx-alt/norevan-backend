import { Router } from 'express';
import { notifyLogin } from '../controllers/accountController.js';
import { requireRealUser } from '../middleware/supabaseAuthMiddleware.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Sign-in notification — real (non-guest) Supabase accounts only.
router.post(
  '/account/login-notify',
  rateLimit({ windowMs: 60_000, max: 20, key: 'login-notify' }),
  requireRealUser,
  notifyLogin,
);

export default router;
