const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

// Upload image route
router.post('/', protect, admin, uploadImage);

// Delete image route
router.delete('/:id', protect, admin, deleteImage);

module.exports = router;