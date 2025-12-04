const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
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

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in cookies first, then in header
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
        } catch (error) {
            logger.warn('Malformed authorization header', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
        }
    }

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Add user to request object
            req.user = await User.findById(decoded.id).select('-password');
            
            // Log successful authentication
            logger.info('User authenticated', {
                userId: req.user._id,
                email: req.user.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            next();
        } catch (error) {
            logger.warn('Token verification failed', {
                error: error.message,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        logger.warn('No token provided', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Admin middleware
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        logger.warn('Unauthorized admin access attempt', {
            userId: req.user ? req.user._id : 'unknown',
            email: req.user ? req.user.email : 'unknown',
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.status(401);
        throw new Error('Not authorized as admin');
    }
};

module.exports = { protect, admin };