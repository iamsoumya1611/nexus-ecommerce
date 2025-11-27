const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  try {
    
    // Check for token in cookies first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Check for token in Authorization header (Bearer token)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in request body (fallback for some clients)
    else if (req.body && req.body.token) {
      token = req.body.token;
    }

    if (token) {
      // Ensure we have a proper secret key
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        res.status(500);
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      const decoded = jwt.verify(token, secret);

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      next();
    } else {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin };