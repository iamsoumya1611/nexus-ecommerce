const User = require('../models/User');
const Address = require('../models/Address');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwt');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validationMiddleware');

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
        console.warn('Attempt to register existing user:', { email });
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

        console.log('User registered successfully:', { 
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
        console.error('Invalid user data during registration:', { 
          email,
          body: req.body
        });
        res.status(400);
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error('Error during user registration:', {
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
    
    console.log('Login attempt:', { email });

    try {
      const user = await User.findOne({ email });
      
      console.log('User lookup:', { 
        email, 
        userFound: user ? 'Yes' : 'No' 
      });

      if (user && (await user.matchPassword(password))) {
        console.log('Password match: Yes', { email });
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
        console.warn('Invalid login attempt:', { email });
        res.status(401);
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Error during user authentication:', {
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
    // Use lean() for better performance since we don't need to modify the document
    const user = await User.findById(req.user._id).select('-password').lean();

    if (user) {
      console.log('User profile fetched:', { userId: user._id });
      
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isActive: user.isActive
        }
      });
    } else {
      console.warn('User profile not found:', { userId: req.user._id });
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
  } catch (error) {
    console.error('Error fetching user profile:', {
      error: error.message,
      stack: error.stack,
      userId: req.user._id
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    // Validate input
    if (!req.body.name && !req.body.email && !req.body.password) {
      console.warn('No update data provided:', { userId: req.user._id });
      return res.status(400).json({
        success: false,
        error: 'No update data provided'
      });
    }
    
    const user = await User.findById(req.user._id);

    if (user) {
      // Update only provided fields
      if (req.body.name) {
        user.name = req.body.name;
      }
      
      if (req.body.email) {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ 
          email: req.body.email, 
          _id: { $ne: user._id } 
        });
        
        if (existingUser) {
          console.warn('Email already in use:', { 
            userId: user._id, 
            email: req.body.email 
          });
          return res.status(400).json({
            success: false,
            error: 'Email already in use'
          });
        }
        
        user.email = req.body.email;
      }
      
      if (req.body.password) {
        // Validate password strength
        if (req.body.password.length < 8) {
          console.warn('Password too short:', { userId: user._id });
          return res.status(400).json({
            success: false,
            error: 'Password must be at least 8 characters long'
          });
        }
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      console.log('User profile updated:', { userId: user._id });

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
        }
      });
    } else {
      console.warn('Attempt to update non-existent user profile:', { userId: req.user._id });
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', {
      error: error.message,
      stack: error.stack,
      userId: req.user._id
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    // Pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      console.warn('Invalid pagination parameters:', { page, limit });
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters'
      });
    }
    
    // Build query
    const query = {};
    
    // Add search filter if provided
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Add admin filter if provided
    if (req.query.isAdmin !== undefined) {
      query.isAdmin = req.query.isAdmin === 'true';
    }
    
    // Add active filter if provided
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Use Promise.all for concurrent operations
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(query)
    ]);
    
    console.log('Users fetched successfully:', { 
      count: users.length, 
      page, 
      limit, 
      total,
      filters: {
        search: req.query.search || 'none',
        isAdmin: req.query.isAdmin,
        isActive: req.query.isActive
      }
    });
    
    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all users:', { 
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent deleting admin users
      if (user.isAdmin) {
        console.warn('Attempt to delete admin user:', {
          userId: req.user._id,
          targetUserId: user._id
        });
        
        return res.status(400).json({
          success: false,
          message: 'Cannot delete admin user'
        });
      }
      
      await user.remove();
      
      console.log('User deleted by admin:', {
        userId: user._id,
        deletedBy: req.user._id
      });
      
      res.json(successResponse(null, 'User deleted successfully'));
    } else {
      console.warn('Attempt to delete non-existent user by admin:', {
        userId: req.params.id,
        deletedBy: req.user._id
      });
      
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error deleting user by admin:', {
      error: error.message,
      userId: req.params.id,
      deletedBy: req.user._id
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
      console.log('User fetched by ID:', { userId: user._id });
      res.json(user);
    } else {
      console.warn('User not found by ID:', { userId: req.params.id });
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user by ID:', {
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

      console.log('User updated by admin:', { 
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
      console.warn('Attempt to update non-existent user by admin:', { 
        userId: req.params.id, 
        updatedBy: req.user._id 
      });
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error updating user by admin:', {
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

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  try {
    console.log('User logging out:', { userId: req.user._id });
    
    // Clear the token cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    
    console.log('User logged out successfully:', { userId: req.user._id });
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error during user logout:', {
      userId: req.user._id,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};