const express = require('express');
const router = express.Router();
const {
  processPayment,
  verifyPayment,
  sendRazorpayApi
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/process')
  .post(protect, processPayment);

router.route('/verify')
  .post(protect, verifyPayment);

router.route('/config')
  .get(sendRazorpayApi);

module.exports = router;