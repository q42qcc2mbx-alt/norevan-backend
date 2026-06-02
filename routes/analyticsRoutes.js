import { Router } from 'express';
import { trackPageView, getAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Public, best-effort page-view tracking. No auth. Generous limit (many page
// views per session) but enough to stop a flood from one IP.
router.post('/track', rateLimit({ windowMs: 60_000, max: 120, key: 'track' }), trackPageView);

// Aggregated metrics — admins & owners only.
router.get('/admin/analytics', protect, requireRole('admin'), getAnalytics);

export default router;
