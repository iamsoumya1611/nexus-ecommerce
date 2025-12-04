const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, uploadImage);

router.route('/:publicId')
  .delete(protect, admin, deleteImage);

module.exports = router;