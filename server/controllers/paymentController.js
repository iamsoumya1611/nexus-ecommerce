const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Initialize Razorpay instance only if credentials are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  
  logger.info('Razorpay initialized successfully');
} else {
  logger.warn('Razorpay credentials not found. Payment functionality will be disabled.');
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
    logger.warn('Payment service not configured when creating order', {
      userId: req.user._id
    });
    
    return res.status(503).json({ 
      success: false, 
      message: 'Payment service is not configured' 
    });
  }
  
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      logger.warn('Invalid amount provided for order creation', {
        userId: req.user._id,
        amount
      });
      
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
    
    logger.info('Razorpay order created successfully', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      userId: req.user._id
    });
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    logger.error('Error creating Razorpay order', {
      error: error.message,
      userId: req.user._id,
      body: req.body
    });
    
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
    logger.warn('Payment service not configured when verifying payment', {
      userId: req.user._id
    });
    
    return res.status(503).json({ 
      success: false, 
      message: 'Payment service is not configured' 
    });
  }
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      logger.warn('Missing required fields for payment verification', {
        userId: req.user._id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      
      res.status(400);
      throw new Error('Missing required payment information');
    }
    
    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    // Verify signature
    const isVerified = expectedSignature === razorpay_signature;
    
    if (isVerified) {
      logger.info('Payment verified successfully', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userId: req.user._id
      });
      
      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      logger.warn('Payment verification failed - invalid signature', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    logger.error('Error verifying payment', {
      error: error.message,
      userId: req.user._id,
      body: req.body
    });
    
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
    logger.warn('Payment service not configured when fetching payment details', {
      userId: req.user._id
    });
    
    return res.status(503).json({ 
      success: false, 
      message: 'Payment service is not configured' 
    });
  }
  
  try {
    const { paymentId } = req.params;
    
    // Validate payment ID
    if (!paymentId) {
      logger.warn('Payment ID missing when fetching payment details', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Payment ID is required');
    }
    
    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    
    logger.info('Payment details fetched successfully', {
      paymentId: payment.id,
      userId: req.user._id
    });
    
    res.json({
      success: true,
      payment
    });
  } catch (error) {
    logger.error('Error fetching payment details', {
      error: error.message,
      paymentId: req.params.paymentId,
      userId: req.user._id
    });
    
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