import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './src/config/db.js';
import productRoutes from './src/routes/productRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import { globalLimiter, authLimiter } from './src/middleware/rateLimiter.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { ApiError } from './src/utils/apiError.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// ==========================================
// [v6 NEW]: Production Security Middlewares
// ==========================================

// 1. Helmet: Secure HTTP headers (allowing cross-origin images for frontend)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// 2. CORS: Restrict access in production or allow all in development
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*';
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 3. Request body parsers (with reasonable size limits to prevent body-flooding)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Data sanitization against NoSQL Query Injection (strips keys starting with '$' or containing '.')
app.use(mongoSanitize());

// 5. Global Rate Limiter: Apply to all /api/ endpoints
app.use('/api', globalLimiter);

// 6. Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// API Routes
// ==========================================

// Auth endpoints have an extra strict rate limiter to prevent brute-force attacks
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// Health check / root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend Teaching API (v6 - Production Security Hardening & Rate Limiting) is running!',
  });
});

// 404 handler throws ApiError to be handled centrally
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Route not found`));
});

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});
