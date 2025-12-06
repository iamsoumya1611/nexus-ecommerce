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

// Cache statistics
const cacheStats = {
  hits: 0,
  misses: 0
};

// @desc    Get AI-powered product recommendations based on a specific product
// @route   GET /api/recommendations/product/:productId
// @access  Public
const getRecommendationsByProduct = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.warn('Invalid product ID for recommendations:', { productId });
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Check cache first
    const cacheKey = `product_${productId}`;
    const cachedResult = recommendationCache.get(cacheKey);
    
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      cacheStats.hits++;
      console.log('Returning cached product recommendations:', { 
        productId, 
        cacheHit: true,
        cacheAge: Date.now() - cachedResult.timestamp
      });
      return res.json(cachedResult.data);
    }
    
    cacheStats.misses++;

    // Get the reference product
    const product = await Product.findById(productId);
    if (!product) {
      console.warn('Product not found for recommendations:', { productId });
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get content-based recommendations
    const recommendations = await getContentBasedRecommendations(product);
    
    const result = {
      product: {
        _id: product._id,
        name: product.name,
        category: product.category,
        brand: product.brand
      },
      recommendations
    };

    // Cache the result
    recommendationCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    console.log('Product recommendations generated:', { 
      productId, 
      recommendationCount: recommendations.length,
      cacheHit: false
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error generating product recommendations:', {
      error: error.message,
      productId: req.params.productId
    });
    
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
});

// @desc    Get personalized recommendations for a user
// @route   GET /api/recommendations/user/:userId
// @access  Private
const getRecommendationsForUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.warn('Invalid user ID for recommendations:', { userId });
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check cache first
    const cacheKey = `user_${userId}`;
    const cachedResult = recommendationCache.get(cacheKey);
    
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      cacheStats.hits++;
      console.log('Returning cached user recommendations:', { 
        userId, 
        cacheHit: true,
        cacheAge: Date.now() - cachedResult.timestamp
      });
      return res.json(cachedResult.data);
    }
    
    cacheStats.misses++;

    // Get user's purchase history
    const userOrders = await Order.find({ user: userId, isPaid: true })
      .populate('orderItems.product');

    if (userOrders.length === 0) {
      // If no purchase history, return popular products
      console.log('No purchase history found, returning popular products:', { userId });
      const popularProducts = await getPopularProducts(10);
      
      const result = {
        user: userId,
        type: 'popular',
        recommendations: popularProducts
      };

      // Cache the result
      recommendationCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return res.json(result);
    }

    // Get content-based recommendations based on user's purchased products
    const userRecommendations = await getUserContentBasedRecommendations(userOrders);
    
    const result = {
      user: userId,
      type: 'personalized',
      recommendations: userRecommendations
    };

    // Cache the result
    recommendationCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    console.log('User recommendations generated:', { 
      userId, 
      recommendationCount: userRecommendations.length,
      cacheHit: false
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error generating user recommendations:', {
      error: error.message,
      userId: req.params.userId
    });
    
    res.status(500).json({ message: 'Failed to generate user recommendations' });
  }
});

// @desc    Get collaborative filtering recommendations
// @route   GET /api/recommendations/collaborative
// @access  Public
const getCollaborativeRecommendationsCtrl = asyncHandler(async (req, res) => {
  try {
    const { productId, limit = 10 } = req.query;
    
    // Validate product ID if provided
    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      console.warn('Invalid product ID for collaborative recommendations:', { productId });
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    let recommendations;
    
    if (productId) {
      // Get recommendations based on a specific product
      recommendations = await getCollaborativeRecommendations(productId, parseInt(limit));
      console.log('Collaborative recommendations generated for product:', { 
        productId, 
        recommendationCount: recommendations.length
      });
    } else {
      // Get popular products
      recommendations = await getPopularProducts(parseInt(limit));
      console.log('Popular products fetched:', { count: recommendations.length });
    }

    res.json({
      recommendations
    });
  } catch (error) {
    console.error('Error generating collaborative recommendations:', {
      error: error.message,
      productId: req.query.productId
    });
    
    res.status(500).json({ message: 'Failed to generate collaborative recommendations' });
  }
});

// @desc    Get cache statistics
// @route   GET /api/recommendations/cache-stats
// @access  Private/Admin
const getCacheStats = asyncHandler(async (req, res) => {
  console.log('Cache statistics requested:', { 
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    cacheSize: recommendationCache.size
  });
  
  res.json({
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    cacheSize: recommendationCache.size,
    hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses || 1)
  });
});

// @desc    Clear recommendation cache
// @route   DELETE /api/recommendations/cache
// @access  Private/Admin
const clearCache = asyncHandler(async (req, res) => {
  const sizeBefore = recommendationCache.size;
  recommendationCache.clear();
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  
  console.log('Recommendation cache cleared:', { sizeBefore });
  
  res.json({ message: `Cache cleared. ${sizeBefore} entries removed.` });
});

module.exports = {
  getRecommendationsByProduct,
  getRecommendationsForUser,
  getCollaborativeRecommendationsCtrl,
  getCacheStats,
  clearCache
};