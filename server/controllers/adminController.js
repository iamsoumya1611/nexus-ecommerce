const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  badRequestResponse,
  forbiddenResponse
} = require('../utils/apiResponse');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    console.log('Admin fetching all users:', { adminId: req.user._id });
    
    const users = await User.find({}).select('-password');
    
    console.log('Users fetched successfully:', { 
      adminId: req.user._id, 
      count: users.length 
    });
    
    res.json(successResponse({
      count: users.length,
      users
    }, 'Users fetched successfully'));
  } catch (error) {
    console.error('Error fetching users:', {
      adminId: req.user._id,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json(errorResponse(error, 'Failed to fetch users'));
  }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  try {
    console.log('Admin fetching user by ID:', { 
      adminId: req.user._id, 
      userId: req.params.id 
    });
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
      console.log('User fetched successfully:', { 
        adminId: req.user._id, 
        userId: user._id 
      });
      
      res.json(successResponse(user, 'User fetched successfully'));
    } else {
      console.warn('User not found:', { 
        adminId: req.user._id, 
        userId: req.params.id 
      });
      
      res.status(404).json(notFoundResponse('User'));
    }
  } catch (error) {
    console.error('Error fetching user:', {
      adminId: req.user._id,
      userId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json(badRequestResponse('Invalid user ID'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to fetch user'));
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  try {
    console.log('Admin updating user:', { 
      adminId: req.user._id, 
      userId: req.params.id,
      updateData: req.body
    });
    
    const user = await User.findById(req.params.id);
    
    if (user) {
      // Prevent admin from removing their own admin status
      if (user._id.toString() === req.user._id.toString() && 
          req.body.isAdmin === false && user.isAdmin) {
        console.warn('Admin tried to remove their own admin status:', { 
          adminId: req.user._id, 
          userId: user._id 
        });
        
        return res.status(400).json(badRequestResponse('Cannot remove your own admin status'));
      }
      
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin !== undefined ? Boolean(req.body.isAdmin) : user.isAdmin;
      
      const updatedUser = await user.save();
      
      console.log('User updated successfully:', { 
        adminId: req.user._id, 
        userId: updatedUser._id 
      });
      
      res.json(successResponse({
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin
        }
      }, 'User updated successfully'));
    } else {
      console.warn('User not found for update:', { 
        adminId: req.user._id, 
        userId: req.params.id 
      });
      
      res.status(404).json(notFoundResponse('User'));
    }
  } catch (error) {
    console.error('Error updating user:', {
      adminId: req.user._id,
      userId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json(badRequestResponse('Invalid user ID'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to update user'));
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    console.log('Admin deleting user:', { 
      adminId: req.user._id, 
      userId: req.params.id 
    });
    
    const user = await User.findById(req.params.id);
    
    if (user) {
      // Prevent admin from deleting themselves
      if (user._id.toString() === req.user._id.toString()) {
        console.warn('Admin tried to delete themselves:', { 
          adminId: req.user._id 
        });
        
        return res.status(400).json(badRequestResponse('Cannot delete your own account'));
      }
      
      // Prevent deleting other admins
      if (user.isAdmin) {
        console.warn('Admin tried to delete another admin:', { 
          adminId: req.user._id, 
          targetUserId: user._id 
        });
        
        return res.status(403).json(forbiddenResponse('Cannot delete admin user'));
      }
      
      await user.remove();
      
      console.log('User deleted successfully:', { 
        adminId: req.user._id, 
        userId: user._id 
      });
      
      res.json(successResponse(null, 'User deleted successfully'));
    } else {
      console.warn('User not found for deletion:', { 
        adminId: req.user._id, 
        userId: req.params.id 
      });
      
      res.status(404).json(notFoundResponse('User'));
    }
  } catch (error) {
    console.error('Error deleting user:', {
      adminId: req.user._id,
      userId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json(badRequestResponse('Invalid user ID'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to delete user'));
  }
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};