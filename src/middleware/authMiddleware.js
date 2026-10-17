import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * [v3 NEW]: Protect Middleware
 * Verifies JWT from Authorization header: "Bearer <token>"
 * Attaches authenticated user object (without password) to req.user
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. No authentication token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production');

    // Fetch user from MongoDB native collection
    const user = await getDB().collection('users').findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { password: 0 } } // Exclude password hash
    );

    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token has expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid authentication token.');
  }
});

/**
 * [v3 NEW]: Authorize Middleware (Role-Based Access Control)
 * Restricts access to specified roles (e.g. 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, `Forbidden: Role "${req.user?.role || 'guest'}" is not authorized to access this resource.`);
    }
    next();
  };
};
