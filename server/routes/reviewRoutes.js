const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewAsHelpful,
  markReviewAsNotHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.route('/product/:productId')
  .get(getProductReviews);

// Protected routes
router.route('/')
  .post(protect, createReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.route('/:id/helpful')
  .put(protect, markReviewAsHelpful);

router.route('/:id/not-helpful')
  .put(protect, markReviewAsNotHelpful);

module.exports = router;