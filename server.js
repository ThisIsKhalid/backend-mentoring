import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './src/config/db.js';
import productRoutes from './src/routes/productRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { ApiError } from './src/utils/apiError.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// [v5 NEW]: Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
// [v5 NEW]: File upload routes
app.use('/api/upload', uploadRoutes);

// Health check / root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend Teaching API (v5 - File Uploads & Media Management) is running!',
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
