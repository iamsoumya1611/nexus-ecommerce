const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
// const path = require('path');
const cors = require('cors');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize app
const app = express();

// Add request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Body parser
app.use(express.json());

// Enable CORS with specific origin and methods
app.use(cors({
    origin: ['https://nexus-ecommerce-chi.vercel.app', 'http://localhost:3000', 'http://localhost:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// For cPanel, we need to use the port provided in the environment
const PORT = process.env.PORT || 5000;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err.message);
    process.exit(1);
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