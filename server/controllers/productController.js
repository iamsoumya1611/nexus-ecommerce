const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  try {
    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected - readyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    logger.info(`Fetching products - page: ${page}, keyword: ${req.query.keyword || 'none'}`);

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    logger.info(`Successfully fetched ${products.length} products`);
    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    logger.error('Error fetching products:', {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
    
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while fetching products',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while fetching products' });
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  logger.info(`Fetching product with ID: ${req.params.id}`);

  try {
    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected - readyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      logger.info(`Successfully fetched product with ID: ${req.params.id}`);
      res.json(product);
    } else {
      logger.warn(`Product not found with ID: ${req.params.id}`);
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    logger.error('Error fetching product by ID:', {
      message: error.message,
      stack: error.stack,
      productId: req.params.id
    });
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while fetching product',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while fetching product' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  logger.info(`Deleting product with ID: ${req.params.id}`);

  try {
    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected - readyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      await product.remove();
      logger.info(`Successfully deleted product with ID: ${req.params.id}`);
      res.json({ message: 'Product removed' });
    } else {
      logger.warn(`Product not found for deletion with ID: ${req.params.id}`);
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    logger.error('Error deleting product:', {
      message: error.message,
      stack: error.stack,
      productId: req.params.id
    });
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while deleting product',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while deleting product' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    image,
    cloudinaryId,
    brand,
    category,
    countInStock,
    description,
    model,
    storage,
    color,
    screenSize,
    size,
    material,
    gender,
    author,
    publisher,
    pages,
    weight,
    dimensions,
    specifications
  } = req.body;

  logger.info(`Creating new product: ${name}`);

  try {
    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected - readyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    const product = new Product({
      name,
      price,
      image,
      cloudinaryId,
      brand,
      category,
      countInStock,
      description,
      model: model || '',
      storage: storage || '',
      color: color || '',
      screenSize: screenSize || '',
      size: size || '',
      material: material || '',
      gender: gender || '',
      author: author || '',
      publisher: publisher || '',
      pages: pages || 0,
      weight: weight || '',
      dimensions: dimensions || '',
      specifications: specifications || new Map(),
      user: req.user._id
    });

    const createdProduct = await product.save();
    logger.info(`Successfully created product with ID: ${createdProduct._id}`);
    res.status(201).json(createdProduct);
  } catch (error) {
    logger.error('Error creating product:', {
      message: error.message,
      stack: error.stack,
      productData: req.body
    });
    
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while creating product',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while creating product' });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    cloudinaryId,
    brand,
    category,
    countInStock,
    model,
    storage,
    color,
    screenSize,
    size,
    material,
    gender,
    author,
    publisher,
    pages,
    weight,
    dimensions,
    specifications
  } = req.body;

  logger.info(`Updating product with ID: ${req.params.id}`);

  try {
    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected - readyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name;
      product.price = price;
      product.description = description;
      product.image = image;
      product.cloudinaryId = cloudinaryId || product.cloudinaryId;
      product.brand = brand;
      product.category = category;
      product.countInStock = countInStock;
      
      // Update new attributes
      product.model = model || '';
      product.storage = storage || '';
      product.color = color || '';
      product.screenSize = screenSize || '';
      product.size = size || '';
      product.material = material || '';
      product.gender = gender || '';
      product.author = author || '';
      product.publisher = publisher || '';
      product.pages = pages || 0;
      product.weight = weight || '';
      product.dimensions = dimensions || '';
      product.specifications = specifications || new Map();

      const updatedProduct = await product.save();
      logger.info(`Successfully updated product with ID: ${req.params.id}`);
      res.json(updatedProduct);
    } else {
      logger.warn(`Product not found for update with ID: ${req.params.id}`);
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    logger.error('Error updating product:', {
      message: error.message,
      stack: error.stack,
      productId: req.params.id,
      productData: req.body
    });
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while updating product',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while updating product' });
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  try {
    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected - readyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
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
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    logger.error('Error creating product review:', {
      message: error.message,
      stack: error.stack,
      productId: req.params.id,
      reviewData: req.body
    });
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while creating review',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while creating review' });
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  try {
    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected - readyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    const products = await Product.find({}).sort({ rating: -1 }).limit(3);
    res.json(products);
  } catch (error) {
    logger.error('Error fetching top products:', {
      message: error.message,
      stack: error.stack
    });
    
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error while fetching top products',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error while fetching top products' });
  }
});

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
};