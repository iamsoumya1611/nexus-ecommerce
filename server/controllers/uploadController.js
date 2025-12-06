const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');
const { 
  successResponse, 
  errorResponse, 
  badRequestResponse
} = require('../utils/apiResponse');

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image formats
const ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'gif'];

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
const uploadImage = asyncHandler(async (req, res) => {
  try {
    if (!req.body.image) {
      console.warn('No image data provided for upload:', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('No image data provided');
    }

    // If the image is already a URL, return it directly
    if (req.body.image.startsWith('http')) {
      console.log('Existing image URL provided, returning as-is:', {
        userId: req.user._id,
        imageUrl: req.body.image.substring(0, 100) + '...'
      });
      
      return res.json(successResponse({
        url: req.body.image,
        cloudinaryId: ''
      }, 'Image URL returned successfully'));
    }

    // Handle base64 image data
    let imageData = req.body.image;
    
    // Remove base64 prefix if present
    if (imageData.startsWith('data:image')) {
      imageData = imageData.split(',')[1];
    }

    // Validate base64 data
    if (!imageData) {
      console.warn('Invalid image data provided:', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Invalid image data');
    }
    
    // Validate base64 format
    if (!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(imageData)) {
      console.warn('Invalid base64 format:', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Invalid image format');
    }
    
    // Check file size
    const fileSize = Buffer.byteLength(imageData, 'base64');
    if (fileSize > MAX_FILE_SIZE) {
      console.warn('Image file too large:', {
        userId: req.user._id,
        fileSize,
        maxSize: MAX_FILE_SIZE
      });
      
      res.status(400);
      throw new Error(`Image size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    // Upload image to Cloudinary with enhanced options
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageData}`, {
      folder: 'nexus-ecommerce/products',
      width: 800,
      height: 800,
      crop: 'fill',
      quality: 'auto',
      format: 'jpg',
      // Add security transformations
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { dpr: 'auto', responsive: true }
      ],
      // Add accessibility features
      accessibility_analysis: true,
      // Add moderation
      moderation: 'aws_rek',
      // Invalidate CDN cache
      invalidate: true
    });

    console.log('Image uploaded successfully to Cloudinary:', {
      userId: req.user._id,
      publicId: result.public_id,
      url: result.secure_url
    });

    res.json(successResponse({
      url: result.secure_url,
      cloudinaryId: result.public_id
    }, 'Image uploaded successfully'));
  } catch (error) {
    console.error('Image upload failed:', {
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
      console.warn('No public ID provided for image deletion:', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Public ID is required for image deletion');
    }

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('Image deleted successfully from Cloudinary:', {
        userId: req.user._id,
        publicId
      });
      
      res.json(successResponse(null, 'Image deleted successfully'));
    } else {
      console.warn('Image deletion failed:', {
        userId: req.user._id,
        publicId,
        result: result.result
      });
      
      res.status(400);
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    console.error('Image deletion failed:', {
      error: error.message,
      userId: req.user._id,
      publicId: req.params.publicId
    });
    
    res.status(500);
    throw new Error('Image deletion failed: ' + error.message);
  }
});

// @desc    Optimize image using Cloudinary transformations
// @route   POST /api/upload/optimize
// @access  Private/Admin
const optimizeImage = asyncHandler(async (req, res) => {
  try {
    const { publicId, transformations } = req.body;
    
    if (!publicId) {
      console.warn('No public ID provided for image optimization:', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Public ID is required for image optimization');
    }
    
    // Validate transformations
    if (transformations && typeof transformations !== 'object') {
      console.warn('Invalid transformations provided:', {
        userId: req.user._id,
        transformations
      });
      
      res.status(400);
      throw new Error('Invalid transformations format');
    }
    
    // Apply transformations
    const transformationOptions = {
      ...transformations,
      quality: transformations?.quality || 'auto',
      fetch_format: transformations?.format || 'auto'
    };
    
    // Generate optimized image URL
    const optimizedUrl = cloudinary.url(publicId, transformationOptions);
    
    console.log('Image optimization URL generated:', {
      userId: req.user._id,
      publicId,
      transformations: transformationOptions
    });
    
    res.json(successResponse({
      url: optimizedUrl,
      transformations: transformationOptions
    }, 'Image optimization URL generated'));
  } catch (error) {
    console.error('Image optimization failed:', {
      error: error.message,
      userId: req.user._id,
      body: req.body
    });
    
    res.status(500);
    throw new Error('Image optimization failed: ' + error.message);
  }
});

// @desc    Get image info from Cloudinary
// @route   GET /api/upload/info/:publicId
// @access  Private/Admin
const getImageInfo = asyncHandler(async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      console.warn('No public ID provided for image info:', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Public ID is required for image info');
    }
    
    // Get image info from Cloudinary
    const result = await cloudinary.api.resource(publicId, {
      colors: true,
      faces: true,
      quality_analysis: true,
      accessibility_analysis: true
    });
    
    console.log('Image info retrieved successfully:', {
      userId: req.user._id,
      publicId
    });
    
    res.json(successResponse({
      info: {
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        url: result.secure_url,
        colors: result.colors,
        qualityScore: result.quality_analysis?.focus,
        accessibility: result.accessibility_analysis
      }
    }, 'Image info retrieved successfully'));
  } catch (error) {
    console.error('Failed to retrieve image info:', {
      error: error.message,
      userId: req.user._id,
      publicId: req.params.publicId
    });
    
    if (error.http_code === 404) {
      res.status(404);
      throw new Error('Image not found');
    }
    
    res.status(500);
    throw new Error('Failed to retrieve image info: ' + error.message);
  }
});

module.exports = {
  uploadImage,
  deleteImage,
  optimizeImage,
  getImageInfo
};