const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { verifyToken } = require('../config/jwt');

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
            console.warn('Malformed authorization header:', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(401).json({
                success: false,
                error: 'Malformed authorization header'
            });
        }
    }

    if (token) {
        try {
            // Verify token with enhanced security
            const decoded = verifyToken(token);
            
            // Check if user still exists
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                console.warn('Token user not found:', {
                    userId: decoded.id,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
                return res.status(401).json({
                    success: false,
                    error: 'Not authorized, user not found'
                });
            }
            
            // Check if user is active
            if (user.isActive === false) {
                console.warn('Inactive user attempted access:', {
                    userId: user._id,
                    email: user.email,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
                return res.status(401).json({
                    success: false,
                    error: 'Account deactivated'
                });
            }
            
            // Add user to request object
            req.user = user;
            
            // Log successful authentication
            console.log('User authenticated:', {
                userId: req.user._id,
                email: req.user.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            next();
        } catch (error) {
            console.warn('Token verification failed:', {
                error: error.message,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            // Specific error handling for JWT errors
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token'
                });
            }
            
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired'
                });
            }
            
            return res.status(401).json({
                success: false,
                error: 'Not authorized, token failed'
            });
        }
    } else {
        console.warn('No token provided:', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        return res.status(401).json({
            success: false,
            error: 'Not authorized, no token'
        });
    }
});

// Admin middleware
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        console.warn('Unauthorized admin access attempt:', {
            userId: req.user ? req.user._id : 'unknown',
            email: req.user ? req.user.email : 'unknown',
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        return res.status(403).json({
            success: false,
            error: 'Forbidden: Admin access required'
        });
    }
};

module.exports = { protect, admin };