const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage, optimizeImage, getImageInfo } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, uploadImage);

router.route('/optimize')
  .post(protect, admin, optimizeImage);

router.route('/info/:publicId')
  .get(protect, admin, getImageInfo);

router.route('/:publicId')
  .delete(protect, admin, deleteImage);

module.exports = router;