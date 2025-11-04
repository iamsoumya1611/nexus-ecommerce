const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already has a cart
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create new cart if doesn't exist
    cart = new Cart({
      user: req.user._id,
      items: []
    });
  }

  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(item => 
    item.product.toString() === productId
  );

  if (existingItemIndex >= 0) {
    // Update quantity if product already in cart
    cart.items[existingItemIndex].qty += qty;
  } else {
    // Add new item to cart
    cart.items.push({
      product: productId,
      name: product.name,
      image: product.image,
      price: product.price,
      qty
    });
  }

  const updatedCart = await cart.save();
  res.json(updatedCart);
});

// @desc    Get cart items
// @route   GET /api/cart
// @access  Private
const getCartItems = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name image price'
  );

  if (cart) {
    res.json(cart);
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.id
    );

    const updatedCart = await cart.save();
    res.json(updatedCart);
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});

module.exports = {
  addToCart,
  getCartItems,
  removeFromCart
};