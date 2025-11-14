const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    logger.info(`Attempting to register user with email: ${email}`);
    
    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected');
      res.status(500);
      throw new Error('Database connection error. Please try again later.');
    }

    // Validate input
    if (!name || !email || !password) {
      logger.warn('Registration attempt with missing fields');
      res.status(400);
      throw new Error('Name, email, and password are required');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      logger.warn(`Registration failed - User already exists with email: ${email}`);
      res.status(409); // Conflict status code
      throw new Error('User already exists');
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
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    logger.error(`Registration error for email: ${req.body.email}`, {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    // If it's already an express async handler error, rethrow it
    if (error instanceof Error && error.message) {
      throw error;
    }
    // Otherwise, create a new error
    res.status(500);
    throw new Error('Internal server error during registration');
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
    
    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected');
      res.status(500);
      throw new Error('Database connection error. Please try again later.');
    }

    // Validate input
    if (!email || !password) {
      logger.warn('Login attempt with missing email or password');
      res.status(400);
      throw new Error('Email and password are required');
    }

    logger.info(`Finding user with email: ${email}`);
    const user = await User.findOne({ email });
    logger.info(`User lookup result: ${user ? 'User found' : 'User not found'}`);

    if (user && (await user.matchPassword(password))) {
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
      
      res.json(responseData);
    } else {
      logger.warn(`Authentication failed for email: ${email}`);
      res.status(401); // Unauthorized status code
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    logger.error(`Authentication error for email: ${req.body.email}`, {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    // If it's already an express async handler error, rethrow it
    if (error instanceof Error && error.message) {
      throw error;
    }
    // Otherwise, create a new error
    res.status(500);
    throw new Error('Internal server error during authentication');
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
      res.status(500);
      throw new Error('Database connection error. Please try again later.');
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
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    logger.error(`Error fetching profile for user ID: ${req.user._id}`, {
      message: error.message,
      stack: error.stack
    });
    // If it's already an express async handler error, rethrow it
    if (error instanceof Error && error.message) {
      throw error;
    }
    // Otherwise, create a new error
    res.status(500);
    throw new Error('Internal server error while fetching profile');
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
      res.status(500);
      throw new Error('Database connection error. Please try again later.');
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
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    logger.error(`Error updating profile for user ID: ${req.user._id}`, {
      message: error.message,
      stack: error.stack
    });
    // If it's already an express async handler error, rethrow it
    if (error instanceof Error && error.message) {
      throw error;
    }
    // Otherwise, create a new error
    res.status(500);
    throw new Error('Internal server error while updating profile');
  }
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile
};