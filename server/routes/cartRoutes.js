const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCartItems,
  removeFromCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addToCart)
  .get(protect, getCartItems);

router.route('/:id')
  .delete(protect, removeFromCart);

module.exports = router;