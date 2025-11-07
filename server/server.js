const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
let corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://nexus-ecommerce.vercel.app' 
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// For production, allow multiple origins including common Vercel deployment URLs
if (process.env.NODE_ENV === 'production') {
  corsOptions.origin = [
    process.env.FRONTEND_URL || 'https://nexus-ecommerce.vercel.app',
    'https://nexus-ecommerce.vercel.app',
    'https://nexus-ecommerce.onrender.com',
    /\.vercel\.app$/,
    /\.onrender\.com$/
  ];
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
const connectDB = require('./config/db');
connectDB();

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  
  logger.info('Checking for build directory at:', buildPath);
  
  // Check if build directory exists
  if (fs.existsSync(buildPath)) {
    logger.info('Build directory found, serving static files');
    app.use(express.static(buildPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    logger.warn('Build directory not found at:', buildPath);
    app.get('/', (req, res) => {
      res.send('E-Commerce API is running... (Frontend build not found)');
    });
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('E-Commerce API is running...');
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

// User routes
app.use('/api/users', require('./routes/userRoutes'));

// Product routes
app.use('/api/products', require('./routes/productRoutes'));

// Cart routes
app.use('/api/cart', require('./routes/cartRoutes'));

// Order routes
app.use('/api/orders', require('./routes/orderRoutes'));

// Admin routes
app.use('/api/admin', require('./routes/adminRoutes'));

// Upload routes
app.use('/api/upload', require('./routes/uploadRoutes'));

// Payment routes
app.use('/api/payment', require('./routes/paymentRoutes'));

// Recommendation routes
app.use('/api/recommendations', require('./routes/recommendationRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});