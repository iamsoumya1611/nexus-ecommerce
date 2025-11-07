const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    logger.info(`Attempting to register user with email: ${email}`);

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
    logger.error(`Registration error for email: ${req.body.email}`, error);
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

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      logger.info(`Successfully authenticated user with email: ${email}`);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      logger.warn(`Authentication failed for email: ${email}`);
      res.status(401); // Unauthorized status code
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    logger.error(`Authentication error for email: ${email}`, error);
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
  logger.info(`Fetching profile for user ID: ${req.user._id}`);

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
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  logger.info(`Updating profile for user ID: ${req.user._id}`);

  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    logger.info(`Successfully updated profile for user ID: ${req.user._id}`);
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
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile
};