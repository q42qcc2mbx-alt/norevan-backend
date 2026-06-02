import { Router } from 'express';
import {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Public — anyone can browse the catalogue
router.get('/',         listProducts);
router.get('/:slug',    getProductBySlug);

// Back office — staff and up may manage the catalogue
router.post('/',        protect, requireRole('staff'), createProduct);
router.put('/:slug',    protect, requireRole('staff'), updateProduct);
router.patch('/:slug',  protect, requireRole('staff'), updateProduct);
router.delete('/:slug', protect, requireRole('staff'), deleteProduct);

export default router;
