const express = require('express');
const router = express.Router();
const {
  getProductRecommendations,
  getUserRecommendations,
  getPopularRecommendations
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.route('/popular')
  .get(getPopularRecommendations);

router.route('/:productId')
  .get(getProductRecommendations);

// Protected routes
router.route('/user/:userId')
  .get(protect, getUserRecommendations);

module.exports = router;