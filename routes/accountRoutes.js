import { Router } from 'express';
import { notifyLogin } from '../controllers/accountController.js';
import { requireRealUser } from '../middleware/supabaseAuthMiddleware.js';

const router = Router();

// Sign-in notification — real (non-guest) Supabase accounts only.
router.post('/account/login-notify', requireRealUser, notifyLogin);

export default router;
