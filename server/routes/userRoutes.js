const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Add logging middleware for user routes
router.use((req, res, next) => {
  console.log(`User route accessed: ${req.method} ${req.originalUrl}`);
  console.log(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

// User registration route
router.post('/register', registerUser);

// User login route
router.post('/login', authUser);

// User profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;