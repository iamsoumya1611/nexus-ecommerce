const express = require('express');
const router = express.Router();
const {
  getRecommendationsByProduct,
  getRecommendationsForUser,
  getCollaborativeRecommendationsCtrl,
  getCacheStats,
  clearCache
} = require('../controllers/recommendationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/popular')
  .get(getCollaborativeRecommendationsCtrl);

router.route('/:productId')
  .get(getRecommendationsByProduct);

// Protected routes
router.route('/user/:userId')
  .get(protect, getRecommendationsForUser);

// Admin routes
router.route('/stats')
  .get(protect, admin, getCacheStats);

router.route('/cache')
  .delete(protect, admin, clearCache);

module.exports = router;