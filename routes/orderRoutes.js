import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  listMyOrders,
  listAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  requireSupabaseAuth,
  requireRealUser,
} from '../middleware/supabaseAuthMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Purchasing requires a real (non-guest) account. Anonymous guests may browse but not buy.
router.post('/checkout', requireRealUser, createOrder);

// Authenticated user (Supabase) — own orders. Must be before /orders/:id so "me" isn't treated as an id.
router.get('/orders/me', requireSupabaseAuth, listMyOrders);

// Public read by id (treat the orderId as a magic token for the confirmation page).
router.get('/orders/:id', getOrderById);

// Back office — staff and up may view & fulfil orders.
router.get('/admin/orders',          protect, requireRole('staff'), listAllOrders);
router.patch('/admin/orders/:id',    protect, requireRole('staff'), updateOrderStatus);

export default router;
