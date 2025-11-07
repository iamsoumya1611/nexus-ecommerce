const razorpay = require('../config/razorpay');
const asyncHandler = require('express-async-handler');

// @desc    Process payment
// @route   POST /api/payment/process
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    // Create order
    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency || 'INR',
      receipt: receipt || 'order_receipt'
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500);
    throw new Error('Payment processing failed');
  }
});

// @desc    Verify payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify payment signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    const isAuthentic = expectedSignature === razorpay_signature;
    
    if (isAuthentic) {
      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400);
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    res.status(500);
    throw new Error('Payment verification failed');
  }
});

// @desc    Send Razorpay API Key
// @route   GET /api/payment/config
// @access  Public
const sendRazorpayApi = asyncHandler(async (req, res) => {
  res.status(200).json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id'
  });
});

module.exports = {
  processPayment,
  verifyPayment,
  sendRazorpayApi
};