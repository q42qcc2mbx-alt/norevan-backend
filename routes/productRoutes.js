import { Router } from 'express';
import {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

// Public — anyone can browse the catalogue
router.get('/',         listProducts);
router.get('/:slug',    getProductBySlug);

// Admin-only — must be logged in AND have is_admin = 1
router.post('/',        protect, requireAdmin, createProduct);
router.put('/:slug',    protect, requireAdmin, updateProduct);
router.patch('/:slug',  protect, requireAdmin, updateProduct);
router.delete('/:slug', protect, requireAdmin, deleteProduct);

export default router;
