const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const { generateToken } = require('../config/jwt');
const mongoose = require('mongoose');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    logger.info(`Attempting to register user with email: ${email}`);
    
    // Validate input
    if (!name || !email || !password) {
      logger.warn('Registration attempt with missing fields');
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected');
      return res.status(500).json({ message: 'Database connection error. Please try again later.' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      logger.warn(`Registration failed - User already exists with email: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    logger.info(`Creating new user with email: ${email}`);
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      logger.info(`Successfully registered user with email: ${email}`);
      const token = generateToken(user._id);
      logger.info(`Generated token for user ${email}`);
      
      // Ensure proper headers for CORS (normalize origin)
      const origin = req.headers.origin;
      const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '*';
      res.header('Access-Control-Allow-Origin', normalizedOrigin);
      res.header('Access-Control-Allow-Credentials', 'true');
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: token
      });
    } else {
      logger.error(`Invalid user data for email: ${email}`);
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    logger.error(`Registration error for email: ${req.body.email || 'unknown'}`, {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    
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
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    
    // Validate input
    if (!email || !password) {
      logger.warn('Login attempt with missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected');
      return res.status(500).json({ message: 'Database connection error. Please try again later.' });
    }

    logger.info(`Finding user with email: ${email}`);
    const user = await User.findOne({ email });
    logger.info(`User lookup result: ${user ? 'User found' : 'User not found'}`);

    if (user) {
      logger.info(`User found, attempting password comparison`);
      try {
        const isPasswordMatch = await user.matchPassword(password);
        logger.info(`Password match result: ${isPasswordMatch}`);
        
        if (isPasswordMatch) {
          logger.info(`Successfully authenticated user with email: ${email}`);
          const token = generateToken(user._id);
          logger.info(`Token generated for user: ${user.email}`);
          
          const responseData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: token
          };
          
          logger.info(`Sending response: ${JSON.stringify(responseData)}`);
          
          // Ensure proper headers for CORS (normalize origin)
          const origin = req.headers.origin;
          const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '*';
          res.header('Access-Control-Allow-Origin', normalizedOrigin);
          res.header('Access-Control-Allow-Credentials', 'true');
          
          return res.json(responseData);
        } else {
          logger.warn(`Authentication failed - password mismatch for email: ${email}`);
          return res.status(401).json({ message: 'Invalid email or password' });
        }
      } catch (passwordError) {
        logger.error(`Error during password comparison for email: ${email}`, {
          message: passwordError.message,
          stack: passwordError.stack
        });
        return res.status(500).json({ message: 'Error during authentication' });
      }
    } else {
      logger.warn(`Authentication failed - user not found with email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    logger.error(`Authentication error for email: ${req.body.email || 'unknown'}`, {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    
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
      logger.error('Database not connected');
      return res.status(500).json({ message: 'Database connection error. Please try again later.' });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      logger.info(`Successfully fetched profile for user ID: ${req.user._id}`);
      
      // Ensure proper headers for CORS (normalize origin)
      const origin = req.headers.origin;
      const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '*';
      res.header('Access-Control-Allow-Origin', normalizedOrigin);
      res.header('Access-Control-Allow-Credentials', 'true');
      
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
    logger.error(`Error fetching profile for user ID: ${req.user._id || 'unknown'}`, {
      message: error.message,
      stack: error.stack
    });
    
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
      logger.error('Database not connected');
      return res.status(500).json({ message: 'Database connection error. Please try again later.' });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      logger.info(`Successfully updated profile for user ID: ${req.user._id}`);
      
      // Ensure proper headers for CORS (normalize origin)
      const origin = req.headers.origin;
      const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '*';
      res.header('Access-Control-Allow-Origin', normalizedOrigin);
      res.header('Access-Control-Allow-Credentials', 'true');
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id)
      });
    } else {
      logger.warn(`User not found for ID: ${req.user._id}`);
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    logger.error(`Error updating profile for user ID: ${req.user._id || 'unknown'}`, {
      message: error.message,
      stack: error.stack
    });
    
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