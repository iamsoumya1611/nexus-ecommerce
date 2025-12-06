const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  badRequestResponse
} = require('../utils/apiResponse');

// Add the ObjectId validator
const { isValidObjectId } = require('../utils/objectIdValidator');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  try {
    const { productId, qty } = req.body;
    
    // Validate required fields
    if (!productId || !qty) {
      console.warn('Missing required fields for adding to cart:', {
        userId: req.user._id,
        productId,
        qty
      });
      
      return res.status(400).json(badRequestResponse('Product ID and quantity are required'));
    }
    
    // Validate ObjectId format using utility
    if (!isValidObjectId(productId)) {
      console.warn('Invalid product ID format:', {
        userId: req.user._id,
        productId
      });
      
      return res.status(400).json(badRequestResponse('Invalid product ID format'));
    }
    
    // Validate quantity
    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity <= 0) {
      console.warn('Invalid quantity provided:', {
        userId: req.user._id,
        productId,
        qty
      });
      
      return res.status(400).json(badRequestResponse('Quantity must be a positive number'));
    }
    
    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      console.warn('Product not found when adding to cart:', {
        userId: req.user._id,
        productId
      });
      
      return res.status(404).json(notFoundResponse('Product'));
    }
    
    if (product.countInStock < quantity) {
      console.warn('Insufficient stock for product:', {
        userId: req.user._id,
        productId,
        requestedQty: quantity,
        availableQty: product.countInStock
      });
      
      return res.status(400).json(badRequestResponse(`Only ${product.countInStock} items available in stock`));
    }
    
    // Find or create cart for user
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: []
      });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].qty = quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        qty: quantity,
        price: product.price
      });
    }
    
    const updatedCart = await cart.save();
    
    console.log('Item added to cart successfully:', {
      userId: req.user._id,
      productId,
      quantity
    });
    
    res.json(successResponse(updatedCart, 'Item added to cart successfully'));
  } catch (error) {
    console.error('Error adding item to cart:', {
      error: error.message,
      stack: error.stack,
      userId: req.user._id,
      body: req.body
    });
    
    return res.status(500).json(errorResponse(error, 'Failed to add item to cart'));
  }
});

// @desc    Get cart items
// @route   GET /api/cart
// @access  Private
const getCartItems = asyncHandler(async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name image price')
      .lean();

    if (cart) {
      // Calculate cart totals
      let itemsPrice = 0;
      let totalCount = 0;
      
      // Update item prices from current product prices
      if (cart.items && cart.items.length > 0) {
        for (const item of cart.items) {
          if (item.product) {
            // Update price to current product price
            item.price = item.product.price;
            itemsPrice += item.price * item.qty;
            totalCount += item.qty;
          }
        }
      }
      
      const taxPrice = 0; // Assuming 0% tax for now
      const shippingPrice = itemsPrice > 500 ? 0 : 50; // Free shipping over ₹500
      const totalPrice = itemsPrice + taxPrice + shippingPrice;
      
      logger.info('Cart items fetched successfully', {
        userId: req.user._id,
        itemCount: cart.items ? cart.items.length : 0
      });
      
      res.json(successResponse({
        cart: {
          ...cart,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          totalCount
        }
      }, 'Cart items fetched successfully'));
    } else {
      // Create empty cart if doesn't exist
      const newCart = new Cart({
        user: req.user._id,
        items: []
      });
      
      const savedCart = await newCart.save();
      
      logger.info('Empty cart created for user', {
        userId: req.user._id
      });
      
      res.json(successResponse({
        cart: {
          ...savedCart.toObject(),
          itemsPrice: 0,
          taxPrice: 0,
          shippingPrice: 50,
          totalPrice: 50,
          totalCount: 0
        }
      }, 'Empty cart created'));
    }
  } catch (error) {
    logger.error('Error fetching cart items', {
      error: error.message,
      stack: error.stack,
      userId: req.user._id
    });
    
    return res.status(500).json(errorResponse(error, 'Failed to fetch cart items'));
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  try {
    // Validate ObjectId format using utility
    if (!isValidObjectId(req.params.id)) {
      logger.warn('Invalid product ID format for removal', {
        userId: req.user._id,
        productId: req.params.id
      });
      
      return res.status(400).json(badRequestResponse('Invalid product ID format'));
    }
    
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      const initialItemCount = cart.items.length;
      
      cart.items = cart.items.filter(
        item => item.product.toString() !== req.params.id
      );
      
      // Check if item was actually removed
      if (cart.items.length === initialItemCount) {
        logger.warn('Product not found in cart for removal', {
          userId: req.user._id,
          productId: req.params.id
        });
        
        return res.status(404).json(notFoundResponse('Product in cart'));
      }

      const updatedCart = await cart.save();
      
      logger.info('Item removed from cart successfully', {
        userId: req.user._id,
        productId: req.params.id
      });
      
      res.json(successResponse(updatedCart, 'Item removed from cart'));
    } else {
      logger.warn('Cart not found when removing item', {
        userId: req.user._id,
        productId: req.params.id
      });
      
      return res.status(404).json(notFoundResponse('Cart'));
    }
  } catch (error) {
    logger.error('Error removing item from cart', {
      error: error.message,
      stack: error.stack,
      userId: req.user._id,
      productId: req.params.id
    });
    
    return res.status(500).json(errorResponse(error, 'Failed to remove item from cart'));
  }
});

module.exports = {
  addToCart,
  getCartItems,
  removeFromCart
};