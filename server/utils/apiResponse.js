/**
 * Standardized API Response Utility
 * Provides consistent response format across all API endpoints
 */

// Success response format
const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode
  };
};

// Error response format
const errorResponse = (error, message = 'An error occurred', statusCode = 500) => {
  return {
    success: false,
    message,
    error: error.message || error,
    statusCode
  };
};

// Validation error response format
const validationErrorResponse = (errors, message = 'Validation failed', statusCode = 400) => {
  return {
    success: false,
    message,
    errors,
    statusCode
  };
};

// Not found response format
const notFoundResponse = (resource = 'Resource', message = null) => {
  return {
    success: false,
    message: message || `${resource} not found`,
    statusCode: 404
  };
};

// Unauthorized response format
const unauthorizedResponse = (message = 'Unauthorized access') => {
  return {
    success: false,
    message,
    statusCode: 401
  };
};

// Forbidden response format
const forbiddenResponse = (message = 'Access forbidden') => {
  return {
    success: false,
    message,
    statusCode: 403
  };
};

// Bad request response format
const badRequestResponse = (message = 'Bad request') => {
  return {
    success: false,
    message,
    statusCode: 400
  };
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse
};