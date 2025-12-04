const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentDetails
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/order')
  .post(protect, createOrder);

router.route('/verify')
  .post(protect, verifyPayment);

router.route('/:paymentId')
  .get(protect, getPaymentDetails);

module.exports = router;