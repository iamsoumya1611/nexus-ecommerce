const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');

// @desc    Get product recommendations based on user's purchase history
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  try {
    // Get user's purchase history
    const userOrders = await Order.find({ user: req.user._id });
    
    // Extract purchased product categories
    const purchasedCategories = [];
    const purchasedProducts = [];
    
    userOrders.forEach(order => {
      order.orderItems.forEach(item => {
        purchasedProducts.push(item.product.toString());
        // We would normally populate the product to get category, but for simplicity:
        // In a real implementation, we would populate the product reference
      });
    });
    
    // Simple recommendation algorithm:
    // 1. If user has purchased products, recommend similar products
    // 2. Otherwise, recommend top-rated products
    
    let recommendations = [];
    
    if (purchasedProducts.length > 0) {
      // For simplicity, we'll recommend top-rated products
      // In a real implementation, we would analyze categories and recommend similar products
      recommendations = await Product.find({})
        .sort({ rating: -1 })
        .limit(10);
    } else {
      // Recommend top products for new users
      recommendations = await Product.find({})
        .sort({ rating: -1 })
        .limit(10);
    }
    
    res.json(recommendations);
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch recommendations');
  }
});

// @desc    Get recommendations by category
// @route   GET /api/recommendations/category/:category
// @access  Public
const getRecommendationsByCategory = asyncHandler(async (req, res) => {
  try {
    const category = req.params.category;
    
    const recommendations = await Product.find({ category })
      .sort({ rating: -1 })
      .limit(10);
    
    res.json(recommendations);
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch recommendations');
  }
});

module.exports = {
  getRecommendations,
  getRecommendationsByCategory
};