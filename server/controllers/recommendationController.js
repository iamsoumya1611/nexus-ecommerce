const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const geminiModel = require('../config/gemini');
const logger = require('../utils/logger');

// @desc    Get AI-powered product recommendations based on user's purchase history
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  try {
    logger.info(`Fetching recommendations for user ID: ${req.user._id}`);
    
    // Get user's purchase history
    const userOrders = await Order.find({ user: req.user._id }).populate({
      path: 'orderItems.product',
      select: 'name category description price rating'
    });
    
    // Extract purchased product categories and details
    const purchasedCategories = [];
    const purchasedProducts = [];
    const purchasedProductIds = [];
    
    userOrders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.product) {
          purchasedProducts.push({
            name: item.product.name,
            category: item.product.category,
            description: item.product.description,
            price: item.product.price,
            rating: item.product.rating
          });
          
          // Collect product IDs for exclusion from recommendations
          purchasedProductIds.push(item.product._id);
          
          if (!purchasedCategories.includes(item.product.category)) {
            purchasedCategories.push(item.product.category);
          }
        }
      });
    });
    
    let recommendations = [];
    
    if (purchasedProducts.length > 0) {
      // Use AI to generate personalized recommendations
      try {
        const prompt = `
          Based on the user's purchase history, recommend 8-10 products they might like.
          User has purchased products in these categories: ${purchasedCategories.join(', ')}
          
          User's purchased products:
          ${purchasedProducts.map(product => `- ${product.name} (${product.category}): ${product.description}`).join('\n')}
          
          Please recommend similar products from our catalog that match the user's interests.
          Respond ONLY with a JSON array of product IDs that exist in our database.
          Do not include any explanations or markdown formatting.
        `;
        
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the AI response to extract product IDs
        let aiRecommendedIds = [];
        try {
          aiRecommendedIds = JSON.parse(text);
        } catch (parseError) {
          logger.error('Error parsing AI response:', parseError);
          // Fallback to category-based recommendations
          const categoryRecommendations = await Product.find({ 
            category: { $in: purchasedCategories },
            _id: { $nin: purchasedProductIds }
          })
          .sort({ rating: -1 })
          .limit(10);
          
          recommendations = categoryRecommendations;
        }
        
        if (Array.isArray(aiRecommendedIds) && aiRecommendedIds.length > 0) {
          // Fetch the recommended products by IDs
          recommendations = await Product.find({
            _id: { $in: aiRecommendedIds },
            _id: { $nin: purchasedProductIds }
          }).limit(10);
        } else if (recommendations.length === 0) {
          // Fallback to category-based recommendations
          recommendations = await Product.find({ 
            category: { $in: purchasedCategories },
            _id: { $nin: purchasedProductIds }
          })
          .sort({ rating: -1 })
          .limit(10);
        }
      } catch (aiError) {
        logger.error('AI recommendation error:', aiError);
        // Fallback to category-based recommendations
        recommendations = await Product.find({ 
          category: { $in: purchasedCategories },
          _id: { $nin: purchasedProductIds }
        })
        .sort({ rating: -1 })
        .limit(10);
      }
    } else {
      // For new users with no purchase history, recommend popular products
      recommendations = await Product.find({})
        .sort({ rating: -1, numReviews: -1 })
        .limit(10);
    }
    
    logger.info(`Successfully fetched ${recommendations.length} recommendations for user ID: ${req.user._id}`);
    res.json(recommendations);
  } catch (error) {
    logger.error('Error fetching recommendations:', {
      message: error.message,
      stack: error.stack,
      userId: req.user._id
    });
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while fetching recommendations',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while fetching recommendations' });
  }
});

// @desc    Get popular products for non-logged-in users
// @route   GET /api/recommendations/category/popular
// @access  Public
const getPopularProducts = asyncHandler(async (req, res) => {
  try {
    logger.info('Fetching popular products for public access');
    
    // Get popular products based on ratings and number of reviews
    const popularProducts = await Product.find({})
      .sort({ rating: -1, numReviews: -1 })
      .limit(10);
    
    logger.info(`Successfully fetched ${popularProducts.length} popular products`);
    res.json(popularProducts);
  } catch (error) {
    logger.error('Error fetching popular products:', {
      message: error.message,
      stack: error.stack
    });
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while fetching popular products',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while fetching popular products' });
  }
});

// @desc    Get AI-powered recommendations by category
// @route   GET /api/recommendations/category/:category
// @access  Public
const getRecommendationsByCategory = asyncHandler(async (req, res) => {
  try {
    const category = req.params.category;
    logger.info(`Fetching recommendations for category: ${category}`);
    
    // Get products in the specified category
    const categoryProducts = await Product.find({ category })
      .sort({ rating: -1 })
      .limit(20);
    
    if (categoryProducts.length === 0) {
      logger.info(`No products found for category: ${category}`);
      return res.json([]);
    }
    
    // Use AI to select the most relevant products
    try {
      const prompt = `
        From the following list of products in the ${category} category, 
        select the 8-10 most appealing and diverse products to recommend.
        
        Products:
        ${categoryProducts.map((p, index) => `${index + 1}. ${p.name}: ${p.description} (Rating: ${p.rating})`).join('\n')}
        
        Please respond ONLY with a JSON array of the indices (1-based) of the selected products.
        Do not include any explanations or markdown formatting.
      `;
      
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the AI response to extract indices
      let selectedIndices = [];
      try {
        selectedIndices = JSON.parse(text);
      } catch (parseError) {
        logger.error('Error parsing AI category selection:', parseError);
        // Fallback to top-rated products
        logger.info(`Using fallback for category ${category}: top-rated products`);
        return res.json(categoryProducts.slice(0, 10));
      }
      
      // Map indices to products
      const selectedProducts = selectedIndices
        .filter(index => index >= 1 && index <= categoryProducts.length)
        .map(index => categoryProducts[index - 1])
        .slice(0, 10);
      
      logger.info(`Successfully fetched ${selectedProducts.length} AI-selected products for category: ${category}`);
      res.json(selectedProducts);
    } catch (aiError) {
      logger.error('AI category recommendation error:', aiError);
      // Fallback to top-rated products
      logger.info(`Using fallback for category ${category}: top-rated products`);
      res.json(categoryProducts.slice(0, 10));
    }
  } catch (error) {
    logger.error('Error fetching category recommendations:', {
      message: error.message,
      stack: error.stack,
      category: req.params.category
    });
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while fetching category recommendations',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while fetching category recommendations' });
  }
});

module.exports = {
  getRecommendations,
  getPopularProducts,
  getRecommendationsByCategory
};