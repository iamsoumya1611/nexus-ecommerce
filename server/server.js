const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const winston = require('winston');
const redis = require('redis');

// Load environment variables from .env file
const envResult = dotenv.config({ path: path.resolve(__dirname, '.env') });

// Check if dotenv loaded successfully
if (envResult.error) {
  console.error('❌ Error loading .env file:', envResult.error);
  process.exit(1);
}

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nexus-ecommerce-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

// Log environment variables for debugging (without sensitive data)
logger.info('Environment variables loaded', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI_defined: !!process.env.MONGO_URI,
  JWT_SECRET_defined: !!process.env.JWT_SECRET
});

// Log the actual MONGO_URI (first and last 10 characters for security)
if (process.env.MONGO_URI) {
  const uri = process.env.MONGO_URI;
  logger.info('MongoDB URI format', {
    start: uri.substring(0, Math.min(10, uri.length)),
    end: uri.substring(Math.max(0, uri.length - 10), uri.length),
    length: uri.length
  });
}

// Database connection
const connectDB = require('./config/db');

// Initialize app
const app = express();

// Port configuration
const PORT = process.env.PORT || 5000;

// Trust proxy for load balancers
app.set('trust proxy', 1);

// Global middleware
// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://*.googleapis.com'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://nexus-ecommerce-chi.vercel.app',
  process.env.CLIENT_URL
].filter(origin => origin); // Filter out undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    
    res.status(options.statusCode).send(options.message);
  }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression
app.use(compression());

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Catch-all route for frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/address', require('./routes/addressRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use(require('./middleware/errorMiddleware'));

// Graceful shutdown handling
let server;

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  
  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('Closed out remaining connections');
    });
  }
  
  // Close database connection
  try {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection', { error: error.message });
  }
  
  // Wait for 10 seconds before forcing shutdown
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle different shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart signal

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${err.message}`);
  // Application specific logging, throwing an error, or other logic here
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

// Connect to database and start server
const startServer = async () => {
  try {
    logger.info('Attempting to connect to database...');
    await connectDB();
    logger.info('Database connected successfully');
    
    server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
    
    // Handle server errors
    server.on('error', (err) => {
      logger.error('Server error', { error: err.message });
    });
    
    // Handle server shutdown
    server.on('close', () => {
      logger.info('Server closed');
    });
  } catch (error) {
    logger.error('Failed to connect to database', { 
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

startServer();

module.exports = app;