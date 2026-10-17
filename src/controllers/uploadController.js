import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Upload a single file
 * @route   POST /api/upload
 * @access  Protected
 */
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a file using field name "image"');
  }

  // Construct accessible relative URL path
  const filePath = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      filename: req.file.filename,
      filePath,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

/**
 * @desc    Upload and attach image to a specific product
 * @route   POST /api/upload/product/:id
 * @access  Protected
 */
export const uploadProductImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid product ID format');
  }

  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file using field name "image"');
  }

  const collection = getDB().collection('products');
  const product = await collection.findOne({ _id: new ObjectId(id) });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  // Update product document in MongoDB with the image URL
  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        imageUrl,
        updatedAt: new Date(),
      },
    }
  );

  const updatedProduct = await collection.findOne({ _id: new ObjectId(id) });

  res.status(200).json({
    success: true,
    message: 'Product image uploaded and linked successfully',
    data: updatedProduct,
  });
});
