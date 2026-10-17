import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import productRoutes from './src/routes/productRoutes.js';
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
app.use('/api/products', productRoutes);

// Health check / root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend Teaching API (v2 - Advanced Querying & Error Handling) is running!',
  });
});

// [v2 NEW]: 404 handler throws ApiError to be handled centrally
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Route not found`));
});

// [v2 NEW]: Centralized Error Handling Middleware (must be registered after all routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});
