const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const { getContentBasedRecommendations, getUserContentBasedRecommendations } = require('../recommender/contentBasedRecommender');
const { getCollaborativeRecommendations, getPopularProducts } = require('../recommender/collaborativeRecommender');
const geminiModel = require('../config/gemini');
const mongoose = require('mongoose');

// Simple in-memory cache for recommendations
const recommendationCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// @desc    Get AI-powered product recommendations based on a specific product
// @route   GET /api/recommendations/:productId
// @access  Public
const getProductRecommendations = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    // Check cache first
    const cacheKey = `product_${productId}`;
    const cachedResult = recommendationCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      return res.json(cachedResult.data);
    }
    
    // Get content-based recommendations
    const contentRecommendations = await getContentBasedRecommendations(productId, 5);
    
    // Get collaborative recommendations if user is logged in
    let collaborativeRecommendations = [];
    if (req.user) {
      collaborativeRecommendations = await getCollaborativeRecommendations(req.user._id, 5);
    }
    
    // Combine recommendations
    let recommendations = [...contentRecommendations];
    
    // Add collaborative recommendations, avoiding duplicates
    collaborativeRecommendations.forEach(collabProduct => {
      if (!recommendations.some(rec => rec._id.toString() === collabProduct._id.toString())) {
        recommendations.push(collabProduct);
      }
    });
    
    // Limit to 10 recommendations
    recommendations = recommendations.slice(0, 10);
    
    // Cache the result
    recommendationCache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now()
    });
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product recommendations', error: error.message });
  }
});

// @desc    Get personalized recommendations for a user
// @route   GET /api/recommendations/user/:userId
// @access  Private
const getUserRecommendations = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if user is authorized to get recommendations for this user
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access these recommendations' });
    }
    
    // Check cache first
    const cacheKey = `user_${userId}`;
    const cachedResult = recommendationCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      return res.json(cachedResult.data);
    }
    
    // Get collaborative recommendations
    const collaborativeRecommendations = await getCollaborativeRecommendations(userId, 8);
    
    // Get user's recent activity for content-based recommendations
    const userOrders = await Order.find({ user: userId }).populate('orderItems.product');
    
    // Extract user preferences from order history
    const userPreferences = extractUserPreferences(userOrders);
    
    // Get content-based recommendations
    const contentRecommendations = await getUserContentBasedRecommendations(userPreferences, 8);
    
    // Combine recommendations
    let recommendations = [...collaborativeRecommendations];
    
    // Add content-based recommendations, avoiding duplicates
    contentRecommendations.forEach(contentProduct => {
      if (!recommendations.some(rec => rec._id.toString() === contentProduct._id.toString())) {
        recommendations.push(contentProduct);
      }
    });
    
    // Limit to 10 recommendations
    recommendations = recommendations.slice(0, 10);
    
    // Cache the result
    recommendationCache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now()
    });
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user recommendations', error: error.message });
  }
});

// @desc    Get popular products for non-logged-in users
// @route   GET /api/recommendations/popular
// @access  Public
const getPopularRecommendations = asyncHandler(async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'popular';
    const cachedResult = recommendationCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      return res.json(cachedResult.data);
    }
    
    // Get popular products
    const popularProducts = await getPopularProducts(10);
    
    // Cache the result
    recommendationCache.set(cacheKey, {
      data: popularProducts,
      timestamp: Date.now()
    });
    
    res.json(popularProducts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch popular recommendations', error: error.message });
  }
});

// Extract user preferences from order history
const extractUserPreferences = (userOrders) => {
  const preferences = {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 0 }
  };
  
  if (!userOrders || userOrders.length === 0) {
    return preferences;
  }
  
  const categories = [];
  const brands = [];
  const prices = [];
  
  userOrders.forEach(order => {
    order.orderItems.forEach(item => {
      if (item.product) {
        categories.push(item.product.category);
        brands.push(item.product.brand);
        prices.push(item.product.price);
      }
    });
  });
  
  // Get unique categories and brands
  preferences.categories = [...new Set(categories)];
  preferences.brands = [...new Set(brands)];
  
  // Calculate price range
  if (prices.length > 0) {
    preferences.priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
  
  return preferences;
};

// Clear recommendation cache
const clearRecommendationCache = () => {
  recommendationCache.clear();
};

module.exports = {
  getProductRecommendations,
  getUserRecommendations,
  getPopularRecommendations,
  clearRecommendationCache
};