const User = require('../models/User');
const Address = require('../models/Address');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwt');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validationMiddleware');
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

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = [
  validateUserRegistration,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      const userExists = await User.findOne({ email });

      if (userExists) {
        logger.warn('Attempt to register existing user', { email });
        res.status(400);
        throw new Error('User already exists');
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
      });

      if (user) {
        const token = generateToken(user._id.toString());
        
        // Set cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        logger.info('User registered successfully', { 
          userId: user._id, 
          email: user.email 
        });

        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: token
        });
      } else {
        logger.error('Invalid user data during registration', { 
          email,
          body: req.body
        });
        res.status(400);
        throw new Error('Invalid user data');
      }
    } catch (error) {
      logger.error('Error during user registration', {
        error: error.message,
        email,
        body: req.body
      });
      throw error;
    }
  })
];

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = [
  validateUserLogin,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    logger.info('Login attempt', { email });

    try {
      const user = await User.findOne({ email });
      
      logger.info('User lookup', { 
        email, 
        userFound: user ? 'Yes' : 'No' 
      });

      if (user && (await user.matchPassword(password))) {
        logger.info('Password match: Yes', { email });
        const token = generateToken(user._id.toString());
        
        // Set cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: token
        });
      } else {
        logger.warn('Invalid login attempt', { email });
        res.status(401);
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      logger.error('Error during user authentication', {
        error: error.message,
        email
      });
      throw error;
    }
  })
];

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      logger.info('User profile fetched', { userId: user._id });
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      logger.warn('User profile not found', { userId: req.user._id });
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    logger.error('Error fetching user profile', {
      error: error.message,
      userId: req.user._id
    });
    throw error;
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      logger.info('User profile updated', { userId: user._id });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      logger.warn('Attempt to update non-existent user profile', { userId: req.user._id });
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    logger.error('Error updating user profile', {
      error: error.message,
      userId: req.user._id
    });
    throw error;
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    
    logger.info('All users fetched', { count: users.length });
    
    res.json(users);
  } catch (error) {
    logger.error('Error fetching all users', { error: error.message });
    throw error;
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.isAdmin) {
        logger.warn('Attempt to delete admin user', { userId: user._id });
        res.status(400);
        throw new Error('Cannot delete admin user');
      }
      await user.remove();
      
      logger.info('User deleted', { userId: user._id });
      
      res.json({ message: 'User removed' });
    } else {
      logger.warn('Attempt to delete non-existent user', { userId: req.params.id });
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    logger.error('Error deleting user', {
      error: error.message,
      userId: req.params.id
    });
    
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('User not found');
    }
    
    throw error;
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      logger.info('User fetched by ID', { userId: user._id });
      res.json(user);
    } else {
      logger.warn('User not found by ID', { userId: req.params.id });
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    logger.error('Error fetching user by ID', {
      error: error.message,
      userId: req.params.id
    });
    
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('User not found');
    }
    
    throw error;
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

      const updatedUser = await user.save();

      logger.info('User updated by admin', { 
        userId: user._id, 
        updatedBy: req.user._id 
      });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      logger.warn('Attempt to update non-existent user by admin', { 
        userId: req.params.id, 
        updatedBy: req.user._id 
      });
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    logger.error('Error updating user by admin', {
      error: error.message,
      userId: req.params.id,
      updatedBy: req.user._id
    });
    
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('User not found');
    }
    
    throw error;
  }
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};