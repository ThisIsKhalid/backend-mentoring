import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getOrdersCollection = () => getDB().collection('orders');
const getProductsCollection = () => getDB().collection('products');

/**
 * @desc    Create a new order (Relational reference to User and Products)
 * @route   POST /api/orders
 * @access  Protected
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item');
  }

  const productsCollection = getProductsCollection();
  const orderItems = [];
  let calculatedTotal = 0;

  // Validate each product exists and fetch real-time price
  for (const item of items) {
    if (!item.productId || !ObjectId.isValid(item.productId)) {
      throw new ApiError(400, `Invalid productId: ${item.productId}`);
    }

    const quantity = parseInt(item.quantity, 10);
    if (!quantity || quantity <= 0) {
      throw new ApiError(400, 'Item quantity must be a positive integer');
    }

    const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
    if (!product) {
      throw new ApiError(404, `Product not found with ID: ${item.productId}`);
    }

    const itemTotal = product.price * quantity;
    calculatedTotal += itemTotal;

    orderItems.push({
      productId: new ObjectId(item.productId),
      name: product.name,
      price: product.price,
      quantity,
    });
  }

  const newOrder = {
    userId: new ObjectId(req.user._id), // Reference to users._id
    items: orderItems,
    totalAmount: calculatedTotal,
    status: 'pending',
    createdAt: new Date(),
  };

  const result = await getOrdersCollection().insertOne(newOrder);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      _id: result.insertedId,
      ...newOrder,
    },
  });
});

/**
 * @desc    Get currently logged in user's orders with populated product details ($lookup)
 * @route   GET /api/orders/my-orders
 * @access  Protected
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const collection = getOrdersCollection();

  // ==========================================
  // [v4 NEW]: Aggregation Pipeline ($match + $lookup + $sort)
  // ==========================================
  const orders = await collection
    .aggregate([
      // 1. Filter orders for this specific logged-in user
      {
        $match: { userId: new ObjectId(req.user._id) },
      },
      // 2. Perform a NoSQL JOIN with the products collection
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'currentProductDetails',
        },
      },
      // 3. Sort by newest orders first
      {
        $sort: { createdAt: -1 },
      },
    ])
    .toArray();

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * @desc    Get all orders across all users with Customer & Product population (Admin only)
 * @route   GET /api/orders
 * @access  Admin Only
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const collection = getOrdersCollection();

  // ==========================================
  // [v4 NEW]: Multi-Stage $lookup Pipeline
  // ==========================================
  const orders = await collection
    .aggregate([
      // Stage 1: JOIN with users collection to populate customer info
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      // Flatten the customer array from $lookup
      {
        $unwind: '$customer',
      },
      // Stage 2: Exclude sensitive customer fields (like password)
      {
        $project: {
          'customer.password': 0,
        },
      },
      // Stage 3: Sort by newest
      {
        $sort: { createdAt: -1 },
      },
    ])
    .toArray();

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * @desc    Get sales analytics & revenue metrics using $group and $avg
 * @route   GET /api/orders/stats
 * @access  Admin Only
 */
export const getOrderStats = asyncHandler(async (req, res) => {
  const collection = getOrdersCollection();

  // ==========================================
  // [v4 NEW]: Aggregation Metrics ($group, $sum, $avg)
  // ==========================================
  const stats = await collection
    .aggregate([
      {
        $group: {
          _id: '$status',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          minOrderValue: { $min: '$totalAmount' },
          maxOrderValue: { $max: '$totalAmount' },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ])
    .toArray();

  res.status(200).json({
    success: true,
    data: stats,
  });
});
