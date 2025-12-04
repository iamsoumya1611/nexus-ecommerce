const { body, validationResult, param, query } = require('express-validator');
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

// Validation middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    
    logger.warn('Validation failed', {
      errors: errorMessages,
      url: req.url,
      method: req.method,
      userId: req.user ? req.user._id : 'anonymous'
    });
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Product validation
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name is required and must be less than 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Category is required'),
  body('brand')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Brand is required'),
  body('countInStock')
    .isInt({ min: 0 })
    .withMessage('Count in stock must be a non-negative integer'),
  handleValidationErrors
];

// Order validation
const validateOrder = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shippingAddress.address')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Address must be at least 5 characters'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2 })
    .withMessage('City is required'),
  body('shippingAddress.postalCode')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Postal code is required'),
  body('shippingAddress.country')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Country is required'),
  body('paymentMethod')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Payment method is required'),
  body('itemsPrice')
    .isFloat({ min: 0 })
    .withMessage('Items price must be a positive number'),
  body('taxPrice')
    .isFloat({ min: 0 })
    .withMessage('Tax price must be a non-negative number'),
  body('shippingPrice')
    .isFloat({ min: 0 })
    .withMessage('Shipping price must be a non-negative number'),
  body('totalPrice')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),
  handleValidationErrors
];

// Review validation
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Comment must be between 5 and 500 characters'),
  handleValidationErrors
];

// ID validation (for routes with :id parameters)
const validateId = [
  param('id')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('pageNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer')
    .toInt(),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100')
    .toInt(),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProduct,
  validateOrder,
  validateReview,
  validateId,
  validatePagination,
  handleValidationErrors
};