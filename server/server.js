const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
  res.send('E-Commerce API is running...');
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});