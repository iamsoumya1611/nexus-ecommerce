const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getPopularProducts,
  getRecommendationsByCategory
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getRecommendations);

router.route('/category/popular')
  .get(getPopularProducts);

router.route('/category/:category')
  .get(getRecommendationsByCategory);

module.exports = router;