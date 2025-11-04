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

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageData}`, {
      folder: 'ecommerce',
      width: 800,
      crop: 'scale'
    });

    res.json({
      url: result.secure_url,
      cloudinaryId: result.public_id
    });
  } catch (error) {
    res.status(500);
    throw new Error('Image upload failed: ' + error.message);
  }
});

module.exports = {
  uploadImage
};