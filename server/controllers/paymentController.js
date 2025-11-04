const stripe = require('../config/stripe');
const asyncHandler = require('express-async-handler');

// @desc    Process payment
// @route   POST /api/payment/process
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
  try {
    const { amount, currency, description, token } = req.body;

    // Create charge
    const charge = await stripe.charges.create({
      amount: amount * 100, // Convert to cents
      currency: currency || 'usd',
      source: token, // obtained with Stripe.js
      description: description || 'E-commerce payment'
    });

    res.json({
      success: true,
      charge
    });
  } catch (error) {
    res.status(500);
    throw new Error('Payment processing failed');
  }
});

// @desc    Send stripe API Key
// @route   GET /api/payment/config
// @access  Public
const sendStripeApi = asyncHandler(async (req, res) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_key'
  });
});

module.exports = {
  processPayment,
  sendStripeApi
};