import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Throttle credential endpoints against brute force.
const authLimiter = rateLimit({ windowMs: 60_000, max: 10, key: 'auth' });

router.post('/register', authLimiter, validateRegister, register);
router.post('/login',    authLimiter, validateLogin,    login);

export default router;
