import { Router } from 'express';
import { trackPageView } from '../controllers/analyticsController.js';

const router = Router();

// Public, best-effort page-view tracking. No auth.
router.post('/track', trackPageView);

export default router;
