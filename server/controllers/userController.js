const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwt');
const mongoose = require('mongoose');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  try {
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Check password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });
    
    if (user) {
      const token = generateToken(user._id);
      
      // Set secure cookie for production
      try {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
          httpOnly: true,
          secure: isProduction, // Secure only in production (HTTPS)
          sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production, 'lax' for development
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        };
        
        // Only set sameSite: 'none' if we're in production and have a valid origin
        if (isProduction && (!req.headers.origin || !req.headers.origin.includes('vercel.app'))) {
          cookieOptions.sameSite = 'lax';
        }
        
        res.cookie('token', token, cookieOptions);
      } catch (cookieError) {
        console.log('Error setting cookie:', cookieError);
      }
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: token
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    logger.error(`Registration error for email: ${req.body.email || 'unknown'}`, {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation Error',
        errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      logger.error('Duplicate key error during registration:', {
        message: error.message,
        keyValue: error.keyValue
      });
      return res.status(400).json({ 
        message: 'User already exists with this email address' 
      });
    }
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoError') {
      logger.error('MongoDB error during registration:', {
        message: error.message,
        code: error.code
      });
      return res.status(500).json({ 
        message: 'Database error during registration. Please try again later.' 
      });
    }
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error during registration',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    logger.info(`Attempting to authenticate user with email: ${email}`);
    logger.info('Request headers:', req.headers);
    logger.info('Request body:', req.body);
    
    // Validate input
    if (!email || !password) {
      logger.warn('Login attempt with missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected - readyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    // Log database connection info
    logger.info('Database connection info:', {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });

    // Find user with case-insensitive email search
    logger.info(`Finding user with email (case-insensitive): ${email}`);
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    logger.info(`User lookup result: ${user ? 'User found' : 'User not found'}`);
    
    // Log the actual query result for debugging
    if (user) {
      logger.info('Found user details:', {
        _id: user._id,
        email: user.email,
        name: user.name
      });
    } else {
      // Let's also try a more general query to see if there are any users
      try {
        const userCount = await User.countDocuments();
        logger.info(`Total users in database: ${userCount}`);
        
        if (userCount > 0) {
          // Try to find any user to see what's in the database
          const sampleUser = await User.findOne({}, 'email name');
          logger.info('Sample user from database:', sampleUser);
        }
      } catch (countError) {
        logger.error('Error counting users:', countError.message);
      }
    }

    if (user) {
      try {
        // Check if the user object has the matchPassword method
        if (typeof user.matchPassword !== 'function') {
          logger.error(`User object missing matchPassword method for email: ${email}`);
          return res.status(500).json({ message: 'Authentication system error' });
        }
        
        const isPasswordMatch = await user.matchPassword(password);
        
        if (isPasswordMatch) {
          
          // Check if we have a valid user ID before generating token
          if (!user._id) {
            return res.status(500).json({ message: 'Authentication system error' });
          }
          
          const token = generateToken(user._id);
          
          // Set secure cookie for production
          try {
            const isProduction = process.env.NODE_ENV === 'production';
            const cookieOptions = {
              httpOnly: true,
              secure: isProduction, // Secure only in production (HTTPS)
              sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production, 'lax' for development
              maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            };
            
            // Only set sameSite: 'none' if we're in production and have a valid origin
            if (isProduction && (!req.headers.origin || !req.headers.origin.includes('vercel.app'))) {
              cookieOptions.sameSite = 'lax';
            }
            
            res.cookie('token', token, cookieOptions);
          } catch (cookieError) {
            console.log('Error setting cookie:', cookieError);
          }
          
          const responseData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: token
          };
          
          return res.json(responseData);
        } else {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
      } catch (passwordError) {
        return res.status(500).json({ message: 'Error during authentication' });
      }
    } else {
      // This is the key change - provide a more specific error message
      return res.status(401).json({ 
        message: 'No account found with this email address. Please register first.' 
      });
    }
  } catch (error) {
    
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error during authentication',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error during authentication' });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    logger.info(`Fetching profile for user ID: ${req.user._id}`);
    
    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected - readyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      logger.info(`Successfully fetched profile for user ID: ${req.user._id}`);
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      });
    } else {
      logger.warn(`User not found for ID: ${req.user._id}`);
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while fetching profile',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while fetching profile' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    logger.info(`Updating profile for user ID: ${req.user._id}`);
    
    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      
      // Generate new token after profile update
      const token = generateToken(updatedUser._id);
      
      // Set secure cookie for production
      try {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
          httpOnly: true,
          secure: isProduction, // Secure only in production (HTTPS)
          sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production, 'lax' for development
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        };
        
        // Only set sameSite: 'none' if we're in production and have a valid origin
        if (isProduction && (!req.headers.origin || !req.headers.origin.includes('vercel.app'))) {
          cookieOptions.sameSite = 'lax';
        }
        
        res.cookie('token', token, cookieOptions);
      } catch (cookieError) {
        logger.error('Error setting cookie:', cookieError);
      }
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: token
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation Error',
        errors
      });
    }
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while updating profile',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while updating profile' });
  }
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile
};