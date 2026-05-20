import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  listMyOrders,
  listAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

// Public — guest checkout allowed; if a Bearer token is present, links the order to the user.
router.post('/checkout', optionalAuth, createOrder);

// Authenticated user — own orders. Must be before /orders/:id to avoid "me" being treated as an id.
router.get('/orders/me', protect, listMyOrders);

// Public read by id (treat the orderId as a magic token for the confirmation page).
router.get('/orders/:id', getOrderById);

// Admin only.
router.get('/admin/orders',          protect, requireAdmin, listAllOrders);
router.patch('/admin/orders/:id',    protect, requireAdmin, updateOrderStatus);

export default router;
