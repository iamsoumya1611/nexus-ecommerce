const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const winston = require('winston');
const { cache, clearCache } = require('../middleware/cacheMiddleware');

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

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = [
  cache('products', 300), // Cache for 5 minutes
  asyncHandler(async (req, res) => {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    try {
      const count = await Product.countDocuments({ ...keyword });
      const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

      logger.info('Products fetched successfully', {
        count: products.length,
        page,
        totalPages: Math.ceil(count / pageSize),
        keyword: req.query.keyword || 'none'
      });

      res.json({
        products,
        page,
        pages: Math.ceil(count / pageSize),
      });
    } catch (error) {
      logger.error('Error fetching products', {
        error: error.message,
        keyword: req.query.keyword || 'none'
      });
      throw new Error('Failed to fetch products');
    }
  })
];

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = [
  cache('product', 600), // Cache for 10 minutes
  asyncHandler(async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (product) {
        logger.info('Product fetched successfully', {
          productId: product._id,
          productName: product.name
        });
        
        res.json(product);
      } else {
        logger.warn('Product not found', {
          productId: req.params.id
        });
        
        res.status(404);
        throw new Error('Product not found');
      }
    } catch (error) {
      logger.error('Error fetching product', {
        error: error.message,
        productId: req.params.id
      });
      
      if (error.name === 'CastError') {
        res.status(404);
        throw new Error('Product not found');
      }
      
      throw error;
    }
  })
];

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = [
  clearCache('product'), // Clear product cache
  clearCache('products'), // Clear products list cache
  asyncHandler(async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (product) {
        await product.remove();
        
        logger.info('Product deleted successfully', {
          productId: product._id,
          productName: product.name,
          deletedBy: req.user._id
        });
        
        res.json({ message: 'Product removed' });
      } else {
        logger.warn('Attempt to delete non-existent product', {
          productId: req.params.id,
          userId: req.user._id
        });
        
        res.status(404);
        throw new Error('Product not found');
      }
    } catch (error) {
      logger.error('Error deleting product', {
        error: error.message,
        productId: req.params.id,
        userId: req.user._id
      });
      
      if (error.name === 'CastError') {
        res.status(404);
        throw new Error('Product not found');
      }
      
      throw error;
    }
  })
];

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = [
  clearCache('products'), // Clear products list cache
  asyncHandler(async (req, res) => {
    try {
      const product = new Product({
        name: req.body.name || 'Sample name',
        price: req.body.price || 0,
        user: req.user._id,
        image: req.body.image || '/images/sample.jpg',
        brand: req.body.brand || 'Sample brand',
        category: req.body.category || 'Sample category',
        countInStock: req.body.countInStock || 0,
        description: req.body.description || 'Sample description',
        specifications: req.body.specifications || [],
      });

      const createdProduct = await product.save();
      
      logger.info('Product created successfully', {
        productId: createdProduct._id,
        productName: createdProduct.name,
        createdBy: req.user._id
      });
      
      res.status(201).json(createdProduct);
    } catch (error) {
      logger.error('Error creating product', {
        error: error.message,
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('Invalid product data');
    }
  })
];

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = [
  clearCache('product'), // Clear product cache
  clearCache('products'), // Clear products list cache
  asyncHandler(async (req, res) => {
    try {
      const {
        name,
        price,
        description,
        image,
        brand,
        category,
        countInStock,
        specifications
      } = req.body;

      const product = await Product.findById(req.params.id);

      if (product) {
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.image = image || product.image;
        product.brand = brand || product.brand;
        product.category = category || product.category;
        product.countInStock = countInStock || product.countInStock;
        product.specifications = specifications || product.specifications;

        const updatedProduct = await product.save();
        
        logger.info('Product updated successfully', {
          productId: updatedProduct._id,
          productName: updatedProduct.name,
          updatedBy: req.user._id
        });
        
        res.json(updatedProduct);
      } else {
        logger.warn('Attempt to update non-existent product', {
          productId: req.params.id,
          userId: req.user._id
        });
        
        res.status(404);
        throw new Error('Product not found');
      }
    } catch (error) {
      logger.error('Error updating product', {
        error: error.message,
        productId: req.params.id,
        userId: req.user._id
      });
      
      if (error.name === 'CastError') {
        res.status(404);
        throw new Error('Product not found');
      }
      
      res.status(400);
      throw new Error('Invalid product data');
    }
  })
];

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = [
  clearCache('product'), // Clear product cache when review is added
  asyncHandler(async (req, res) => {
    try {
      const { rating, comment } = req.body;

      const product = await Product.findById(req.params.id);

      if (product) {
        const alreadyReviewed = product.reviews.find(
          (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
          logger.warn('Attempt to review product multiple times', {
            productId: product._id,
            userId: req.user._id
          });
          
          res.status(400);
          throw new Error('Product already reviewed');
        }

        const review = {
          name: req.user.name,
          rating: Number(rating),
          comment,
          user: req.user._id,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length;

        await product.save();
        
        logger.info('Product review added successfully', {
          productId: product._id,
          userId: req.user._id,
          rating
        });
        
        res.status(201).json({ message: 'Review added' });
      } else {
        logger.warn('Attempt to review non-existent product', {
          productId: req.params.id,
          userId: req.user._id
        });
        
        res.status(404);
        throw new Error('Product not found');
      }
    } catch (error) {
      logger.error('Error adding product review', {
        error: error.message,
        productId: req.params.id,
        userId: req.user._id
      });
      
      if (error.name === 'CastError') {
        res.status(404);
        throw new Error('Product not found');
      }
      
      throw error;
    }
  })
];

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = [
  cache('top_products', 600), // Cache for 10 minutes
  asyncHandler(async (req, res) => {
    try {
      const products = await Product.find({}).sort({ rating: -1 }).limit(3);
      
      logger.info('Top products fetched successfully', {
        count: products.length
      });
      
      res.json(products);
    } catch (error) {
      logger.error('Error fetching top products', {
        error: error.message
      });
      
      throw new Error('Failed to fetch top products');
    }
  })
];

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
};