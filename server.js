import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import productRoutes from './src/routes/productRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { ApiError } from './src/utils/apiError.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
// [v3 NEW]: Authentication endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health check / root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend Teaching API (v3 - Authentication & Authorization) is running!',
  });
});

// 404 handler throws ApiError to be handled centrally
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Route not found`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});
