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
  
  console.log('Razorpay initialized successfully');
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
    console.warn('Payment service not configured when creating order:', {
      userId: req.user._id
    });
    
    return res.status(503).json({ 
      success: false, 
      message: 'Payment service is not configured' 
    });
  }
  
  try {
    const { amount, currency = 'INR', receipt, orderId } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      console.warn('Invalid amount provided for order creation:', {
        userId: req.user._id,
        amount
      });
      
      res.status(400);
      throw new Error('Invalid amount');
    }
    
    // Validate that amount is a number
    if (isNaN(amount)) {
      console.warn('Non-numeric amount provided for order creation:', {
        userId: req.user._id,
        amount
      });
      
      res.status(400);
      throw new Error('Amount must be a number');
    }
    
    // If orderId is provided, verify it matches the amount
    if (orderId) {
      // Here you would typically verify the order exists in your database
      // and that the amount matches the order total
      console.log('Order ID provided for payment verification:', {
        orderId,
        amount,
        userId: req.user._id
      });
    }
    
    // Create order options
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise, round to avoid floating point issues
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1 // Auto-capture payment
    };
    
    // Create order
    const order = await razorpay.orders.create(options);
    
    console.log('Razorpay order created successfully:', {
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
    console.error('Error creating Razorpay order:', {
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
    console.warn('Payment service not configured when verifying payment:', {
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
      console.warn('Missing required fields for payment verification:', {
        userId: req.user._id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      
      res.status(400);
      throw new Error('Missing required payment information');
    }
    
    // Validate field formats
    if (typeof razorpay_order_id !== 'string' || razorpay_order_id.length > 50) {
      console.warn('Invalid razorpay_order_id format:', {
        userId: req.user._id,
        orderId: razorpay_order_id
      });
      
      res.status(400);
      throw new Error('Invalid order ID format');
    }
    
    if (typeof razorpay_payment_id !== 'string' || razorpay_payment_id.length > 50) {
      console.warn('Invalid razorpay_payment_id format:', {
        userId: req.user._id,
        paymentId: razorpay_payment_id
      });
      
      res.status(400);
      throw new Error('Invalid payment ID format');
    }
    
    if (typeof razorpay_signature !== 'string' || razorpay_signature.length !== 64) {
      console.warn('Invalid razorpay_signature format:', {
        userId: req.user._id,
        signatureLength: razorpay_signature ? razorpay_signature.length : 0
      });
      
      res.status(400);
      throw new Error('Invalid signature format');
    }
    
    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    // Verify signature with timing-safe comparison to prevent timing attacks
    const isVerified = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );
    
    if (isVerified) {
      console.log('Payment verified successfully:', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userId: req.user._id
      });
      
      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      console.warn('Payment verification failed - invalid signature:', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    console.error('Error verifying payment:', {
      error: error.message,
      userId: req.user._id,
      body: req.body
    });
    
    // Differentiate between validation errors and server errors
    if (error.message.includes('Invalid') || error.message.includes('Missing')) {
      res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed', 
        error: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Payment verification failed', 
        error: 'Internal server error during verification' 
      });
    }
  }
});

// @desc    Get payment details
// @route   GET /payment/:paymentId
// @access  Private
const getPaymentDetails = asyncHandler(async (req, res) => {
  // Check if Razorpay is configured
  if (!isRazorpayConfigured()) {
    console.warn('Payment service not configured when fetching payment details:', {
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
      console.warn('Payment ID missing when fetching payment details:', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Payment ID is required');
    }
    
    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    
    console.log('Payment details fetched successfully:', {
      paymentId: payment.id,
      userId: req.user._id
    });
    
    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching payment details:', {
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

// @desc    Verify payment status with Razorpay API
// @route   GET /payment/status/:paymentId
// @access  Private
const verifyPaymentStatus = asyncHandler(async (req, res) => {
  // Check if Razorpay is configured
  if (!isRazorpayConfigured()) {
    console.warn('Payment service not configured when verifying payment status:', {
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
      console.warn('Payment ID missing when verifying payment status:', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Payment ID is required');
    }
    
    // Validate payment ID format
    if (typeof paymentId !== 'string' || paymentId.length > 50) {
      console.warn('Invalid payment ID format when verifying payment status:', {
        userId: req.user._id,
        paymentId
      });
      
      res.status(400);
      throw new Error('Invalid payment ID format');
    }
    
    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    
    // Verify payment status
    const isValidStatus = ['captured', 'authorized'].includes(payment.status);
    
    console.log('Payment status verified:', {
      paymentId: payment.id,
      status: payment.status,
      isValid: isValidStatus,
      userId: req.user._id
    });
    
    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        isValid: isValidStatus
      }
    });
  } catch (error) {
    console.error('Error verifying payment status:', {
      error: error.message,
      paymentId: req.params.paymentId,
      userId: req.user._id
    });
    
    // Handle specific Razorpay errors
    if (error.statusCode === 404) {
      res.status(404).json({ 
        success: false, 
        message: 'Payment not found', 
        error: 'Payment ID does not exist' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to verify payment status', 
        error: error.message 
      });
    }
  }
});

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  verifyPaymentStatus
};