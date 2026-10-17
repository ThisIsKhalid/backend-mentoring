import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes: Anyone can browse products
router.get('/', getProducts);
router.get('/:id', getProductById);

// [v3 NEW]: Protected routes: Only logged-in users can create or update products
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);

// [v3 NEW]: Role-Based route: Only admins can delete products
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
