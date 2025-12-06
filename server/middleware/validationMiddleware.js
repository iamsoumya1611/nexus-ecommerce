const { body, validationResult, param, query } = require('express-validator');

// Validation middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    
    console.warn('Validation failed:', errorMessages);
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }
  next();
};

// Sanitization middleware
const sanitizeInput = [
  (req, res, next) => {
    // Allow certain fields to have HTML content if needed
    // For example, product descriptions might need some HTML
    const allowedHtmlFields = ['description'];
    
    // Re-add allowed HTML for specific fields
    allowedHtmlFields.forEach(field => {
      if (req.body[field]) {
        // Restore safe HTML entities
        req.body[field] = req.body[field]
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&amp;/g, '&');
      }
    });
    
    next();
  }
];

// User registration validation
const validateUserRegistration = [
  sanitizeInput,
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s._-]+$/)
    .withMessage('Name can only contain letters, numbers, spaces, dots, underscores, and hyphens'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address is too long'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  sanitizeInput,
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
  sanitizeInput,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name is required and must be less than 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  body('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category is required and must be less than 50 characters'),
  body('brand')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand is required and must be less than 50 characters'),
  body('countInStock')
    .isInt({ min: 0 })
    .withMessage('Count in stock must be a non-negative integer'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  handleValidationErrors
];

// Order validation
const validateOrder = [
  sanitizeInput,
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shippingAddress.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('shippingAddress.postalCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters'),
  body('shippingAddress.country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('paymentMethod')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Payment method must be between 2 and 50 characters'),
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
  sanitizeInput,
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Comment must be between 5 and 1000 characters'),
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
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page number must be between 1 and 1000')
    .toInt(),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Page size must be between 1 and 50')
    .toInt(),
  handleValidationErrors
];

// Address validation
const validateAddress = [
  sanitizeInput,
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('streetAddress')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('postalCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters'),
  body('country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Phone number must be between 5 and 20 characters')
    .matches(/^[+]?[\d\s()-]+$/)
    .withMessage('Phone number can only contain digits, spaces, parentheses, hyphens, and plus sign'),
  handleValidationErrors
];

// Cart item validation
const validateCartItem = [
  sanitizeInput,
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid product ID format'),
  body('qty')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100')
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
  validateAddress,
  validateCartItem,
  handleValidationErrors,
  sanitizeInput
};