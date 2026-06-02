import { Router } from 'express';
import {
  listTeam,
  createMember,
  updateMemberRole,
  revokeMember,
  listAudit,
} from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Team management — owner only.
router.get('/admin/team',         protect, requireRole('owner'), listTeam);
router.get('/admin/audit',        protect, requireRole('owner'), listAudit);
router.post('/admin/team',        protect, requireRole('owner'), createMember);
router.patch('/admin/team/:id',   protect, requireRole('owner'), updateMemberRole);
router.delete('/admin/team/:id',  protect, requireRole('owner'), revokeMember);

export default router;
