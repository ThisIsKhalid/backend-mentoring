import express from 'express';
import { uploadFile, uploadProductImage } from '../controllers/uploadController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// General image upload
router.post('/', protect, upload.single('image'), uploadFile);

// Upload and attach directly to a product
router.post('/product/:id', protect, upload.single('image'), uploadProductImage);

export default router;
