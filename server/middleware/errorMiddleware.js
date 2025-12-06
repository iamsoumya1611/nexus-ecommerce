// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Don't log passwords or other sensitive data
  const sanitizedBody = { ...req.body };
  if (sanitizedBody.password) {
    sanitizedBody.password = '[REDACTED]';
  }
  if (sanitizedBody.confirmPassword) {
    sanitizedBody.confirmPassword = '[REDACTED]';
  }
  
  // Log error with request context
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: sanitizedBody,
    params: req.params,
    query: req.query,
    userId: req.user ? req.user._id : 'anonymous'
  });

  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { statusCode: 404, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { statusCode: 400, message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { statusCode: 400, message };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { statusCode: 401, message };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { statusCode: 401, message };
  }
  
  // Stripe/Billing errors
  if (err.type === 'StripeCardError') {
    const message = err.message;
    error = { statusCode: 400, message };
  }
  
  // Stripe API connection errors
  if (err.type === 'StripeConnectionError') {
    const message = 'Payment service temporarily unavailable';
    error = { statusCode: 503, message };
  }
  
  // Generic Stripe errors
  if (err.type === 'StripeError') {
    const message = 'Payment processing error';
    error = { statusCode: 500, message };
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    // Include stack trace in development only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;