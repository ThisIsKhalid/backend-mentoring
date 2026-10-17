import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getUsersCollection = () => getDB().collection('users');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide all required fields: name, email, password');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const collection = getUsersCollection();

  // Check if user already exists
  const existingUser = await collection.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email already exists');
  }

  // Hash password using bcryptjs
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: role === 'admin' ? 'admin' : 'user', // Basic role assignment
    createdAt: new Date(),
  };

  const result = await collection.insertOne(newUser);
  const token = generateToken(result.insertedId);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        _id: result.insertedId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    },
  });
});

/**
 * @desc    Log in user & get JWT token
 * @route   POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const collection = getUsersCollection();

  // Find user by email
  const user = await collection.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Verify password using bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});
