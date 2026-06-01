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
  optionalSupabaseAuth,
  requireSupabaseAuth,
} from '../middleware/supabaseAuthMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

// Public — guest checkout allowed; if a valid Supabase token is present, links the order to the account.
router.post('/checkout', optionalSupabaseAuth, createOrder);

// Authenticated user (Supabase) — own orders. Must be before /orders/:id so "me" isn't treated as an id.
router.get('/orders/me', requireSupabaseAuth, listMyOrders);

// Public read by id (treat the orderId as a magic token for the confirmation page).
router.get('/orders/:id', getOrderById);

// Admin only.
router.get('/admin/orders',          protect, requireAdmin, listAllOrders);
router.patch('/admin/orders/:id',    protect, requireAdmin, updateOrderStatus);

export default router;
