import { Router } from 'express';
import {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  subscribeBackInStock,
  getAlsoBought,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Public — anyone can browse the catalogue
router.get('/',         listProducts);
router.get('/:slug',    getProductBySlug);
router.get('/:slug/also-bought', getAlsoBought);
router.post('/:slug/notify-me', rateLimit({ windowMs: 60_000, max: 10, key: 'notify-me' }), subscribeBackInStock);

// Back office — staff and up may manage the catalogue
router.post('/',        protect, requireRole('staff'), createProduct);
router.put('/:slug',    protect, requireRole('staff'), updateProduct);
router.patch('/:slug',  protect, requireRole('staff'), updateProduct);
router.delete('/:slug', protect, requireRole('staff'), deleteProduct);

export default router;
