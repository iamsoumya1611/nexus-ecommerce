const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const geminiModel = require('../config/gemini');

// @desc    Get AI-powered product recommendations based on user's purchase history
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  try {
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
          console.error('Error parsing AI response:', parseError);
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
        console.error('AI recommendation error:', aiError);
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
    
    res.json(recommendations);
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch recommendations');
  }
});

// @desc    Get popular products for non-logged-in users
// @route   GET /api/recommendations/category/popular
// @access  Public
const getPopularProducts = asyncHandler(async (req, res) => {
  try {
    // Get popular products based on ratings and number of reviews
    const popularProducts = await Product.find({})
      .sort({ rating: -1, numReviews: -1 })
      .limit(10);
    
    res.json(popularProducts);
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch popular products');
  }
});

// @desc    Get AI-powered recommendations by category
// @route   GET /api/recommendations/category/:category
// @access  Public
const getRecommendationsByCategory = asyncHandler(async (req, res) => {
  try {
    const category = req.params.category;
    
    // Get products in the specified category
    const categoryProducts = await Product.find({ category })
      .sort({ rating: -1 })
      .limit(20);
    
    if (categoryProducts.length === 0) {
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
        console.error('Error parsing AI category selection:', parseError);
        // Fallback to top-rated products
        return res.json(categoryProducts.slice(0, 10));
      }
      
      // Map indices to products
      const selectedProducts = selectedIndices
        .filter(index => index >= 1 && index <= categoryProducts.length)
        .map(index => categoryProducts[index - 1])
        .slice(0, 10);
      
      res.json(selectedProducts);
    } catch (aiError) {
      console.error('AI category recommendation error:', aiError);
      // Fallback to top-rated products
      res.json(categoryProducts.slice(0, 10));
    }
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch recommendations');
  }
});

module.exports = {
  getRecommendations,
  getPopularProducts,
  getRecommendationsByCategory
};