const express = require('express');
const router = express.Router();
const {
  processPayment,
  sendStripeApi
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/process')
  .post(protect, processPayment);

router.route('/config')
  .get(sendStripeApi);

module.exports = router;