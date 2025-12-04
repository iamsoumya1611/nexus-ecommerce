const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    if (res.statusCode === 404) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    if (res.statusCode === 404) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      if (user.isAdmin) {
        res.status(400);
        throw new Error('Cannot delete admin user');
      }
      await user.remove();
      res.json({ message: 'User removed' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    if (res.statusCode === 404 || res.statusCode === 400) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};