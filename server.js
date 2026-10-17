import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import productRoutes from './src/routes/productRoutes.js';

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
    message: 'Backend Teaching API (v1 - Native MongoDB Driver) is running!',
  });
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});
