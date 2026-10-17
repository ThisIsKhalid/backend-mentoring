import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getCollection = () => getDB().collection('products');

/**
 * @desc    Get all products with Pagination, Filtering, Search & Sorting
 * @route   GET /api/products
 * @query   page, limit, search, category, inStock, minPrice, maxPrice, sort
 */
export const getProducts = asyncHandler(async (req, res) => {
  const collection = getCollection();

  // ==========================================
  // [v2 NEW]: 1. Dynamic Filtering & Search
  // ==========================================
  const filter = {};
  const { search, category, inStock, minPrice, maxPrice, sort } = req.query;

  // Search by name (case-insensitive regex)
  if (search) {
    filter.name = { $regex: search.trim(), $options: 'i' };
  }

  // Filter by category
  if (category) {
    filter.category = { $regex: `^${category.trim()}$`, $options: 'i' };
  }

  // Filter by stock status
  if (inStock !== undefined) {
    filter.inStock = inStock === 'true';
  }

  // Filter by price range ($gte, $lte)
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  // ==========================================
  // [v2 NEW]: 2. Sorting
  // ==========================================
  // Format expected: "price:asc", "price:desc", "createdAt:desc", etc.
  const sortOption = {};
  if (sort) {
    const [field, direction] = sort.split(':');
    sortOption[field] = direction?.toLowerCase() === 'asc' ? 1 : -1;
  } else {
    sortOption.createdAt = -1; // Default to newest first
  }

  // ==========================================
  // [v2 NEW]: 3. Pagination (.skip() & .limit())
  // ==========================================
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Execute queries in parallel for efficiency
  const [products, totalCount] = await Promise.all([
    collection.find(filter).sort(sortOption).skip(skip).limit(limit).toArray(),
    collection.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      totalItems: totalCount,
      currentPage: page,
      totalPages,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid MongoDB ObjectId format');
  }

  const product = await getCollection().findOne({ _id: new ObjectId(id) });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({ success: true, data: product });
});

/**
 * @desc    Create a new product
 * @route   POST /api/products
 */
export const createProduct = asyncHandler(async (req, res) => {
  const { name, price, category, inStock } = req.body;

  if (!name || price === undefined || !category) {
    throw new ApiError(400, 'Please provide all required fields: name, price, category');
  }

  const newProduct = {
    name: String(name).trim(),
    price: Number(price),
    category: String(category).trim(),
    inStock: inStock !== undefined ? Boolean(inStock) : true,
    createdAt: new Date(),
  };

  const result = await getCollection().insertOne(newProduct);

  res.status(201).json({
    success: true,
    data: {
      _id: result.insertedId,
      ...newProduct,
    },
  });
});

/**
 * @desc    Update a product by ID
 * @route   PUT /api/products/:id
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid MongoDB ObjectId format');
  }

  const updateFields = {
    ...req.body,
    updatedAt: new Date(),
  };

  if (updateFields.price !== undefined) {
    updateFields.price = Number(updateFields.price);
  }

  const result = await getCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );

  if (result.matchedCount === 0) {
    throw new ApiError(404, 'Product not found');
  }

  const updatedProduct = await getCollection().findOne({ _id: new ObjectId(id) });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct,
  });
});

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/products/:id
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid MongoDB ObjectId format');
  }

  const result = await getCollection().deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});
