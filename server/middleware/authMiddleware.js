const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies first
  if (req.cookies.token) {
    token = req.cookies.token;
    logger.info('Token extracted from cookies');
  }
  // Check for token in Authorization header (Bearer token)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    logger.info('Token extracted from request header');
  }

  if (token) {
    try {
      // Ensure we have a proper secret key
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        logger.error('JWT_SECRET is not defined in environment variables');
        res.status(500);
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      logger.info('Verifying token with secret');
      const decoded = jwt.verify(token, secret);
      logger.info('Token verified successfully, user ID:', decoded.id);

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        logger.error('User not found for ID:', decoded.id);
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      
      logger.info('User authenticated:', req.user.email);
      next();
    } catch (error) {
      logger.error('Token verification error:', {
        message: error.message,
        stack: error.stack,
        token: token ? 'present' : 'missing'
      });
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    logger.warn('No token provided in authorization header or cookies');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    logger.warn('User not authorized as admin:', req.user ? req.user.email : 'no user');
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin };