const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, uploadImage);

module.exports = router;