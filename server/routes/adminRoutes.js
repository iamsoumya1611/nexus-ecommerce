const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/adminController');
const {
  getDashboardStats,
  getSalesReport,
  getUserAnalytics
} = require('../controllers/adminDashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

// Dashboard routes
router.route('/dashboard/stats')
  .get(protect, admin, getDashboardStats);

router.route('/dashboard/analytics')
  .get(protect, admin, getSalesReport);

router.route('/dashboard/users')
  .get(protect, admin, getUserAnalytics);

// User management routes
router.route('/users')
  .get(protect, admin, getUsers);

router.route('/users/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;