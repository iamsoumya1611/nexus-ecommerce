// http://localhost:3000 
// http://localhost:5000
// https://nexus-ecommerce-chi.vercel.app

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Enable CORS with specific origin and methods
app.use(cors({
  origin: ['https://nexus-ecommerce-chi.vercel.app', 'http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Handle preflight requests explicitly for all routes
app.options('*', cors());

// Middleware
app.use(express.json());

// Database connection
const connectDB = require('./config/db');

connectDB();

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

// Root route - This should be after static file serving
app.get('/', (req, res) => {
  res.send('E-Commerce API is running...');
});

// Handle 404 errors - This should be after all routes
app.use('*', (req, res) => {
  res.status(404);
  res.json({
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('MongoDB URI:', process.env.MONGO_URI ? 'Connected' : 'Not found');
  console.log('CORS origins:', ['https://nexus-ecommerce-chi.vercel.app', 'http://localhost:3000', 'http://localhost:5000']);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});