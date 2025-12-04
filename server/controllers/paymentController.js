const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance only if credentials are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn('Razorpay credentials not found. Payment functionality will be disabled.');
}

// Helper function to check if Razorpay is configured
const isRazorpayConfigured = () => {
  return razorpay !== null;
};

// @desc    Create a Razorpay order
// @route   POST /payment/order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  // Check if Razorpay is configured
  if (!isRazorpayConfigured()) {
    return res.status(503).json({ 
      success: false, 
      message: 'Payment service is not configured' 
    });
  }
  
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error('Invalid amount');
    }
    
    // Create order options
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1 // Auto-capture payment
    };
    
    // Create order
    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order', 
      error: error.message 
    });
  }
});

// @desc    Verify Razorpay payment
// @route   POST /payment/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  // Check if Razorpay is configured
  if (!isRazorpayConfigured()) {
    return res.status(503).json({ 
      success: false, 
      message: 'Payment service is not configured' 
    });
  }
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    // Verify signature
    const isVerified = expectedSignature === razorpay_signature;
    
    if (isVerified) {
      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400);
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Payment verification failed', 
      error: error.message 
    });
  }
});

// @desc    Get payment details
// @route   GET /payment/:paymentId
// @access  Private
const getPaymentDetails = asyncHandler(async (req, res) => {
  // Check if Razorpay is configured
  if (!isRazorpayConfigured()) {
    return res.status(503).json({ 
      success: false, 
      message: 'Payment service is not configured' 
    });
  }
  
  try {
    const { paymentId } = req.params;
    
    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment details', 
      error: error.message 
    });
  }
});

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentDetails
};