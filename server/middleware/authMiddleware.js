const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in cookies first, then in header
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Add user to request object
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Admin middleware
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403); // Changed to 403 Forbidden
        throw new Error('Not authorized as admin');
    }
};

// Optional auth middleware (for routes that can be accessed by both authenticated and unauthenticated users)
const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in cookies first, then in header
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Add user to request object
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Don't throw error for optional auth, just continue
            console.error('Optional auth token verification error:', error.message);
        }
    }
    
    next();
});

module.exports = { protect, admin, optionalAuth };