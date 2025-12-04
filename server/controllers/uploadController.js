const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
const uploadImage = asyncHandler(async (req, res) => {
  try {
    if (!req.body.image) {
      res.status(400);
      throw new Error('No image data provided');
    }

    // If the image is already a URL, return it directly
    if (req.body.image.startsWith('http')) {
      return res.json({
        url: req.body.image,
        cloudinaryId: ''
      });
    }

    // Handle base64 image data
    let imageData = req.body.image;
    
    // Remove base64 prefix if present
    if (imageData.startsWith('data:image')) {
      imageData = imageData.split(',')[1];
    }

    // Validate base64 data
    if (!imageData) {
      res.status(400);
      throw new Error('Invalid image data provided');
    }

    // Upload image to Cloudinary with enhanced options
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageData}`, {
      folder: 'nexus-ecommerce/products',
      width: 800,
      height: 800,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      format: 'jpg'
    });

    res.json({
      url: result.secure_url,
      cloudinaryId: result.public_id
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500);
    throw new Error('Image upload failed: ' + error.message);
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:id
// @access  Private/Admin
const deleteImage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400);
      throw new Error('No image ID provided');
    }

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(id);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404);
      throw new Error('Image not found or already deleted');
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500);
    throw new Error('Image deletion failed: ' + error.message);
  }
});

module.exports = {
  uploadImage,
  deleteImage
};