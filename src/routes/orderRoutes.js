import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderStats,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Customer endpoints
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

// Administrator only endpoints
router.get('/', authorize('admin'), getAllOrders);
router.get('/stats', authorize('admin'), getOrderStats);

export default router;
