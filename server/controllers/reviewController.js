const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  badRequestResponse,
  forbiddenResponse
} = require('../utils/apiResponse');

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.warn('Product not found when fetching reviews:', { productId });
      return res.status(404).json(notFoundResponse('Product'));
    }
    
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    console.log('Product reviews fetched successfully:', {
      productId,
      reviewCount: reviews.length
    });
    
    res.json(successResponse(reviews, 'Product reviews fetched successfully'));
  } catch (error) {
    console.error('Error fetching product reviews:', {
      error: error.message,
      productId: req.params.productId
    });
    
    res.status(500).json(errorResponse(error, 'Failed to fetch product reviews'));
  }
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    
    // Validate required fields
    if (!rating || !productId) {
      console.warn('Missing required fields for review creation:', {
        userId: req.user._id,
        rating,
        productId
      });
      return res.status(400).json(badRequestResponse('Rating and product ID are required'));
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.warn('Product not found when creating review:', {
        userId: req.user._id,
        productId
      });
      return res.status(404).json(notFoundResponse('Product'));
    }
    
    // Check if user has purchased this product
    const order = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      isPaid: true
    });
    
    if (!order) {
      console.warn('User has not purchased product for review:', {
        userId: req.user._id,
        productId
      });
      return res.status(400).json(badRequestResponse('You must purchase this product to review it'));
    }
    
    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId
    });
    
    if (existingReview) {
      console.warn('User has already reviewed product:', {
        userId: req.user._id,
        productId
      });
      return res.status(400).json(badRequestResponse('You have already reviewed this product'));
    }
    
    const review = new Review({
      rating: Number(rating),
      comment,
      user: req.user._id,
      product: productId
    });
    
    const createdReview = await review.save();
    
    // Populate user name for response
    await createdReview.populate('user', 'name');
    
    console.log('Review created successfully:', {
      reviewId: createdReview._id,
      userId: req.user._id,
      productId
    });
    
    res.status(201).json(successResponse(createdReview, 'Review created successfully', 201));
  } catch (error) {
    console.error('Error creating review:', {
      error: error.message,
      userId: req.user._id,
      body: req.body
    });
    
    res.status(500).json(errorResponse(error, 'Failed to create review'));
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Validate required fields
    if (!rating) {
      console.warn('Missing rating for review update:', {
        userId: req.user._id,
        reviewId: req.params.id
      });
      return res.status(400).json(badRequestResponse('Rating is required'));
    }
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      console.warn('Review not found for update:', {
        userId: req.user._id,
        reviewId: req.params.id
      });
      return res.status(404).json(notFoundResponse('Review'));
    }
    
    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      console.warn('Unauthorized review update attempt:', {
        userId: req.user._id,
        reviewId: req.params.id,
        reviewOwnerId: review.user.toString()
      });
      return res.status(403).json(forbiddenResponse('Not authorized to update this review'));
    }
    
    review.rating = Number(rating);
    review.comment = comment || review.comment;
    
    const updatedReview = await review.save();
    
    // Populate user name for response
    await updatedReview.populate('user', 'name');
    
    console.log('Review updated successfully:', {
      reviewId: updatedReview._id,
      userId: req.user._id
    });
    
    res.json(successResponse(updatedReview, 'Review updated successfully'));
  } catch (error) {
    console.error('Error updating review:', {
      error: error.message,
      userId: req.user._id,
      reviewId: req.params.id
    });
    
    res.status(500).json(errorResponse(error, 'Failed to update review'));
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      console.warn('Review not found for deletion:', {
        userId: req.user._id,
        reviewId: req.params.id
      });
      return res.status(404).json(notFoundResponse('Review'));
    }
    
    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      console.warn('Unauthorized review deletion attempt:', {
        userId: req.user._id,
        reviewId: req.params.id,
        reviewOwnerId: review.user.toString()
      });
      return res.status(403).json(forbiddenResponse('Not authorized to delete this review'));
    }
    
    await review.remove();
    
    console.log('Review deleted successfully:', {
      reviewId: req.params.id,
      userId: req.user._id
    });
    
    res.json(successResponse({}, 'Review deleted successfully'));
  } catch (error) {
    console.error('Error deleting review:', {
      error: error.message,
      userId: req.user._id,
      reviewId: req.params.id
    });
    
    res.status(500).json(errorResponse(error, 'Failed to delete review'));
  }
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const markReviewAsHelpful = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      console.warn('Review not found when marking as helpful:', {
        userId: req.user._id,
        reviewId: req.params.id
      });
      return res.status(404).json(notFoundResponse('Review'));
    }
    
    // Check if user has already marked this review as helpful
    if (review.helpfulUsers.includes(req.user._id)) {
      console.warn('User has already marked review as helpful:', {
        userId: req.user._id,
        reviewId: req.params.id
      });
      return res.status(400).json(badRequestResponse('You have already marked this review as helpful'));
    }
    
    // Add user to helpful users and increment helpful count
    review.helpfulUsers.push(req.user._id);
    review.helpfulCount = review.helpfulUsers.length;
    
    const updatedReview = await review.save();
    
    console.log('Review marked as helpful:', {
      reviewId: updatedReview._id,
      userId: req.user._id
    });
    
    res.json(successResponse(updatedReview, 'Review marked as helpful'));
  } catch (error) {
    console.error('Error marking review as helpful:', {
      error: error.message,
      userId: req.user._id,
      reviewId: req.params.id
    });
    
    res.status(500).json(errorResponse(error, 'Failed to mark review as helpful'));
  }
});

// @desc    Mark review as not helpful
// @route   PUT /api/reviews/:id/not-helpful
// @access  Private
const markReviewAsNotHelpful = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      console.warn('Review not found when marking as not helpful:', {
        userId: req.user._id,
        reviewId: req.params.id
      });
      return res.status(404).json(notFoundResponse('Review'));
    }
    
    // Check if user has marked this review as helpful
    const userIndex = review.helpfulUsers.indexOf(req.user._id);
    if (userIndex === -1) {
      console.warn('User has not marked review as helpful:', {
        userId: req.user._id,
        reviewId: req.params.id
      });
      return res.status(400).json(badRequestResponse('You have not marked this review as helpful'));
    }
    
    // Remove user from helpful users and decrement helpful count
    review.helpfulUsers.splice(userIndex, 1);
    review.helpfulCount = review.helpfulUsers.length;
    
    const updatedReview = await review.save();
    
    console.log('Review marked as not helpful:', {
      reviewId: updatedReview._id,
      userId: req.user._id
    });
    
    res.json(successResponse(updatedReview, 'Review marked as not helpful'));
  } catch (error) {
    console.error('Error marking review as not helpful:', {
      error: error.message,
      userId: req.user._id,
      reviewId: req.params.id
    });
    
    res.status(500).json(errorResponse(error, 'Failed to mark review as not helpful'));
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