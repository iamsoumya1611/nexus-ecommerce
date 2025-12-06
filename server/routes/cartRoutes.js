const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCartItems,
  removeFromCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { validateId, validateCartItem } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, validateCartItem, addToCart)
  .get(protect, getCartItems);

router.route('/:id')
  .delete(protect, validateId, removeFromCart);

module.exports = router;