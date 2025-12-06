const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  badRequestResponse
} = require('../utils/apiResponse');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items.product');
    
    if (!wishlist) {
      // Create a new wishlist if it doesn't exist
      wishlist = new Wishlist({
        user: req.user._id,
        items: []
      });
      await wishlist.save();
      
      console.log('New wishlist created for user:', { userId: req.user._id });
    }
    
    console.log('Wishlist fetched successfully:', {
      userId: req.user._id,
      itemCount: wishlist.items.length
    });
    
    res.json(successResponse(wishlist, 'Wishlist fetched successfully'));
  } catch (error) {
    console.error('Error fetching wishlist:', {
      error: error.message,
      userId: req.user._id
    });
    
    res.status(500).json(errorResponse(error, 'Failed to fetch wishlist'));
  }
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Validate required fields
    if (!productId) {
      console.warn('Missing product ID for wishlist addition:', { userId: req.user._id });
      return res.status(400).json(badRequestResponse('Product ID is required'));
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.warn('Product not found when adding to wishlist:', {
        userId: req.user._id,
        productId
      });
      
      return res.status(404).json(notFoundResponse('Product'));
    }
    
    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        items: []
      });
    }
    
    // Check if product is already in wishlist
    const existingItemIndex = wishlist.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      console.warn('Product already in wishlist:', {
        userId: req.user._id,
        productId
      });
      
      return res.status(400).json(badRequestResponse('Product already in wishlist'));
    }
    
    // Add product to wishlist
    wishlist.items.push({
      product: productId
    });
    
    const updatedWishlist = await wishlist.save();
    
    // Populate product details
    await updatedWishlist.populate('items.product');
    
    console.log('Product added to wishlist successfully:', {
      userId: req.user._id,
      productId
    });
    
    res.status(201).json(successResponse(updatedWishlist, 'Product added to wishlist successfully', 201));
  } catch (error) {
    console.error('Error adding product to wishlist:', {
      error: error.message,
      userId: req.user._id,
      body: req.body
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json(badRequestResponse('Invalid product ID'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to add item to wishlist'));
  }
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate product ID
    if (!productId) {
      console.warn('Missing product ID for wishlist removal:', { userId: req.user._id });
      return res.status(400).json(badRequestResponse('Product ID is required'));
    }
    
    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      console.warn('Wishlist not found for user:', { userId: req.user._id });
      return res.status(404).json(notFoundResponse('Wishlist'));
    }
    
    // Check if product is in wishlist
    const existingItemIndex = wishlist.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex === -1) {
      console.warn('Product not found in wishlist:', {
        userId: req.user._id,
        productId
      });
      
      return res.status(404).json(notFoundResponse('Product in wishlist'));
    }
    
    // Remove product from wishlist
    wishlist.items.splice(existingItemIndex, 1);
    
    const updatedWishlist = await wishlist.save();
    
    // Populate product details
    await updatedWishlist.populate('items.product');
    
    console.log('Product removed from wishlist successfully:', {
      userId: req.user._id,
      productId
    });
    
    res.json(successResponse(updatedWishlist, 'Product removed from wishlist successfully'));
  } catch (error) {
    console.error('Error removing product from wishlist:', {
      error: error.message,
      userId: req.user._id,
      productId: req.params.productId
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json(badRequestResponse('Invalid product ID'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to remove item from wishlist'));
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      console.warn('Wishlist not found for user:', { userId: req.user._id });
      return res.status(404).json(notFoundResponse('Wishlist'));
    }
    
    wishlist.items = [];
    const updatedWishlist = await wishlist.save();
    
    console.log('Wishlist cleared successfully:', { userId: req.user._id });
    
    res.json(successResponse(updatedWishlist, 'Wishlist cleared successfully'));
  } catch (error) {
    console.error('Error clearing wishlist:', {
      error: error.message,
      userId: req.user._id
    });
    
    res.status(500).json(errorResponse(error, 'Failed to clear wishlist'));
  }
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
};