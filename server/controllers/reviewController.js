const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort('-createdAt');
    
    res.json(reviews);
  } catch (error) {
    if (res.statusCode === 404) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to fetch product reviews', error: error.message });
  }
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    // Check if user has purchased this product
    const order = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      isDelivered: true
    });
    
    const verifiedPurchase = !!order;
    
    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });
    
    if (existingReview) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }
    
    // Create review
    const review = new Review({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      title,
      comment,
      verifiedPurchase
    });
    
    const createdReview = await review.save();
    
    // Populate user details
    await createdReview.populate('user', 'name');
    
    res.status(201).json(createdReview);
  } catch (error) {
    if (res.statusCode === 404 || res.statusCode === 400) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }
    
    // Check if user is authorized to update this review
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this review');
    }
    
    // Update review
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    
    const updatedReview = await review.save();
    
    // Populate user details
    await updatedReview.populate('user', 'name');
    
    res.json(updatedReview);
  } catch (error) {
    if (res.statusCode === 404 || res.statusCode === 403) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to update review', error: error.message });
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }
    
    // Check if user is authorized to delete this review
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }
    
    await review.remove();
    
    res.json({ message: 'Review removed' });
  } catch (error) {
    if (res.statusCode === 404 || res.statusCode === 403) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const markReviewAsHelpful = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }
    
    // Increment helpful count
    review.helpful += 1;
    const updatedReview = await review.save();
    
    res.json(updatedReview);
  } catch (error) {
    if (res.statusCode === 404) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to mark review as helpful', error: error.message });
  }
});

// @desc    Mark review as not helpful
// @route   PUT /api/reviews/:id/not-helpful
// @access  Private
const markReviewAsNotHelpful = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }
    
    // Increment not helpful count
    review.notHelpful += 1;
    const updatedReview = await review.save();
    
    res.json(updatedReview);
  } catch (error) {
    if (res.statusCode === 404) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to mark review as not helpful', error: error.message });
  }
});

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewAsHelpful,
  markReviewAsNotHelpful
};