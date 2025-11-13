const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');

dotenv.config();

// Log environment variables for debugging (mask sensitive ones)
logger.info('Environment variables check:');
logger.info('NODE_ENV:', process.env.NODE_ENV);
logger.info('PORT:', process.env.PORT);
logger.info('MONGO_URI present:', !!process.env.MONGO_URI);
logger.info('JWT_SECRET present:', !!process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://nexus-ecommerce-chi.vercel.app'
    ];
    
    // In production, also allow the FRONTEND_URL from environment variables
    if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For production, we might want to be more permissive with subdomains
      if (process.env.NODE_ENV === 'production') {
        // Allow any vercel.app subdomain
        if (origin && origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware before any other middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly for all routes
app.options('*', cors(corsOptions));

// This is an alternative approach if the above doesn't work
// app.options('*', (req, res) => {
//   res.header('Access-Control-Allow-Origin', req.header('origin'));
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.sendStatus(200);
// });

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
const connectDB = require('./config/db');
// Connect to database
logger.info('Initializing database connection...');
connectDB();

// API Routes - These should be before static file serving
// User routes
app.use('/users', require('./routes/userRoutes'));

// Product routes
app.use('/products', require('./routes/productRoutes'));

// Cart routes
app.use('/cart', require('./routes/cartRoutes'));

// Order routes
app.use('/orders', require('./routes/orderRoutes'));

// Admin routes
app.use('/admin', require('./routes/adminRoutes'));

// Upload routes
app.use('/upload', require('./routes/uploadRoutes'));

// Payment routes
app.use('/payment', require('./routes/paymentRoutes'));

// Recommendation routes
app.use('/recommendations', require('./routes/recommendationRoutes'));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongoose: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT
    }
  };
  
  logger.info('Health check accessed:', healthData);
  res.status(200).json(healthData);
});

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  
  logger.info('Checking for build directory at:', buildPath);
  
  // Check if build directory exists
  if (fs.existsSync(buildPath)) {
    logger.info('Build directory found, serving static files');
    app.use(express.static(buildPath));
    
    // Handle React routing, return all requests to React app
    // This should be AFTER all API routes
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

// Root route - This should be after static file serving
app.get('/', (req, res) => {
  res.send('E-Commerce API is running...');
});

// Handle 404 errors - This should be after all routes
app.use('*', (req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  res.status(404);
  res.json({
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body
  });
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  // Added this comment to trigger a new deployment
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  logger.error('Stack trace:', err.stack);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error('Stack trace:', err.stack);
  server.close(() => {
    process.exit(1);
  });
});
