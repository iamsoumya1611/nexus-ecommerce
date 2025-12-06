const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  getUsers,
  deleteUser,
  getUserById,
  updateUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validationMiddleware');

// User registration route
router.post('/register', validateUserRegistration, registerUser);

// User login route
router.post('/login', validateUserLogin, authUser);

// User logout route
router.post('/logout', protect, logoutUser);

// User profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin routes
router.route('/')
  .get(protect, admin, getUsers)
  .delete(protect, admin, deleteUser);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

module.exports = router;