import { Router } from 'express';
import { trackPageView, getAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Public, best-effort page-view tracking. No auth.
router.post('/track', trackPageView);

// Aggregated metrics — admins & owners only.
router.get('/admin/analytics', protect, requireRole('admin'), getAnalytics);

export default router;
