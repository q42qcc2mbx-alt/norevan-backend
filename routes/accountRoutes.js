import { Router } from 'express';
import { notifyLogin, welcome } from '../controllers/accountController.js';
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

// Welcome email — sent once per customer (first sign-up / login).
router.post(
  '/account/welcome',
  rateLimit({ windowMs: 60_000, max: 20, key: 'welcome' }),
  requireRealUser,
  welcome,
);

export default router;
