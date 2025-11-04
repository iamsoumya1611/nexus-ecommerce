const express = require('express');
const router = express.Router();
const {
  getProducts,
  getUsers,
  getOrders,
  updateUserToAdmin
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/products')
  .get(protect, admin, getProducts);

router.route('/users')
  .get(protect, admin, getUsers);

router.route('/users/:id')
  .put(protect, admin, updateUserToAdmin);

router.route('/orders')
  .get(protect, admin, getOrders);

module.exports = router;