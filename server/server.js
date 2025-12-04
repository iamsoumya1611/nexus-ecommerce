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

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Log environment variables for debugging (without sensitive data)
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI defined:', !!process.env.MONGO_URI);
console.log('JWT_SECRET defined:', !!process.env.JWT_SECRET);

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
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
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

// Sanitize all inputs
const { sanitizeInput } = require('./middleware/validationMiddleware');
app.use(sanitizeInput);

// Routes
app.use('/users', require('./routes/userRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/orders', require('./routes/orderRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/upload', require('./routes/uploadRoutes'));
app.use('/payment', require('./routes/paymentRoutes'));
app.use('/recommendations', require('./routes/recommendationRoutes'));
app.use('/wishlist', require('./routes/wishlistRoutes'));
app.use('/reviews', require('./routes/reviewRoutes'));
app.use('/address', require('./routes/addressRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
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
let connections = [];

const gracefulShutdown = async (signal) => {
  console.log(`${signal} signal received: closing HTTP server`);
  
  // Close server
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
    
    // Close all connections
    connections.forEach(conn => conn.end());
    connections = [];
  }
  
  // Close database connection
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
  
  // Exit process
  process.exit(0);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection at: ${promise}, reason: ${err.message}`);
  // Application specific logging, throwing an error, or other logic here
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  // Application specific logging, throwing an error, or other logic here
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle SIGTERM and SIGINT signals
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  gracefulShutdown('SIGINT');
});

// Track active connections for graceful shutdown
app.on('connection', (connection) => {
  connections.push(connection);
  connection.on('close', () => {
    connections = connections.filter(conn => conn !== connection);
  });
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
    
    server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
    
    // Handle server errors
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;