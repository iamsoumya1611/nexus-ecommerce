const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getRecommendationsByCategory
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getRecommendations);

router.route('/category/:category')
  .get(getRecommendationsByCategory);

module.exports = router;