const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

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
    }
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
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
      res.status(400);
      throw new Error('Product already in wishlist');
    }
    
    // Add product to wishlist
    wishlist.items.push({
      product: productId
    });
    
    const updatedWishlist = await wishlist.save();
    
    // Populate product details
    await updatedWishlist.populate('items.product');
    
    res.status(201).json(updatedWishlist);
  } catch (error) {
    if (res.statusCode === 404 || res.statusCode === 400) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to add item to wishlist', error: error.message });
  }
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      res.status(404);
      throw new Error('Wishlist not found');
    }
    
    // Check if product is in wishlist
    const existingItemIndex = wishlist.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex === -1) {
      res.status(404);
      throw new Error('Product not found in wishlist');
    }
    
    // Remove product from wishlist
    wishlist.items.splice(existingItemIndex, 1);
    
    const updatedWishlist = await wishlist.save();
    
    // Populate product details
    await updatedWishlist.populate('items.product');
    
    res.json(updatedWishlist);
  } catch (error) {
    if (res.statusCode === 404) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to remove item from wishlist', error: error.message });
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      res.status(404);
      throw new Error('Wishlist not found');
    }
    
    wishlist.items = [];
    const updatedWishlist = await wishlist.save();
    
    res.json(updatedWishlist);
  } catch (error) {
    if (res.statusCode === 404) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to clear wishlist', error: error.message });
  }
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
};