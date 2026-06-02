import { Router } from 'express';
import {
  listTasks,
  listAssignees,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Assignees list must be before /:id so it isn't treated as an id.
router.get('/tasks/assignees', protect, requireRole('admin'), listAssignees);

router.get('/tasks',            protect, requireRole('staff'), listTasks);
router.post('/tasks',           protect, requireRole('admin'), createTask);
router.get('/tasks/:id',        protect, requireRole('staff'), getTask);
router.patch('/tasks/:id',      protect, requireRole('staff'), updateTask);
router.delete('/tasks/:id',     protect, requireRole('admin'), deleteTask);
router.post('/tasks/:id/comments', protect, requireRole('staff'), addTaskComment);

export default router;
