import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

// Route: /api/products
router.route('/')
  .get(getProducts)
  .post(createProduct);

// Route: /api/products/:id
router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
