import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

const getCollection = () => getDB().collection('products');

/**
 * @desc    Get all products
 * @route   GET /api/products
 */
export const getProducts = async (req, res) => {
  try {
    const products = await getCollection().find({}).toArray();
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MongoDB ObjectId format',
      });
    }

    const product = await getCollection().findOne({ _id: new ObjectId(id) });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, category, inStock } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, price, category)',
      });
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update a product by ID
 * @route   PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MongoDB ObjectId format',
      });
    }

    const updateFields = {
      ...req.body,
      updatedAt: new Date(),
    };

    // If price is passed, ensure it is stored as a number
    if (updateFields.price !== undefined) {
      updateFields.price = Number(updateFields.price);
    }

    const result = await getCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const updatedProduct = await getCollection().findOne({ _id: new ObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MongoDB ObjectId format',
      });
    }

    const result = await getCollection().deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
