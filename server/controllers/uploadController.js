const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
const uploadImage = asyncHandler(async (req, res) => {
  try {
    if (!req.body.image) {
      logger.warn('No image data provided for upload', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('No image data provided');
    }

    // If the image is already a URL, return it directly
    if (req.body.image.startsWith('http')) {
      logger.info('Existing image URL provided, returning as-is', {
        userId: req.user._id,
        imageUrl: req.body.image.substring(0, 100) + '...'
      });
      
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
      logger.warn('Invalid image data provided', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Invalid image data');
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageData}`, {
      folder: 'nexus-ecommerce/products',
      width: 800,
      height: 800,
      crop: 'fill',
      quality: 'auto',
      format: 'jpg'
    });

    logger.info('Image uploaded successfully to Cloudinary', {
      userId: req.user._id,
      publicId: result.public_id,
      url: result.secure_url
    });

    res.json({
      url: result.secure_url,
      cloudinaryId: result.public_id
    });
  } catch (error) {
    logger.error('Image upload failed', {
      error: error.message,
      userId: req.user._id,
      body: req.body
    });
    
    res.status(500);
    throw new Error('Image upload failed: ' + error.message);
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private/Admin
const deleteImage = asyncHandler(async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      logger.warn('No public ID provided for image deletion', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Public ID is required for image deletion');
    }

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      logger.info('Image deleted successfully from Cloudinary', {
        userId: req.user._id,
        publicId
      });
      
      res.json({ message: 'Image deleted successfully' });
    } else {
      logger.warn('Image deletion failed', {
        userId: req.user._id,
        publicId,
        result: result.result
      });
      
      res.status(400);
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    logger.error('Image deletion failed', {
      error: error.message,
      userId: req.user._id,
      publicId: req.params.publicId
    });
    
    res.status(500);
    throw new Error('Image deletion failed: ' + error.message);
  }
});

module.exports = {
  uploadImage,
  deleteImage
};