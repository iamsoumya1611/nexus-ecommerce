const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
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

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Delete image from Cloudinary if it exists
    if (product.cloudinaryId) {
      const cloudinary = require('../config/cloudinary');
      try {
        await cloudinary.uploader.destroy(product.cloudinaryId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error.message);
      }
    }
    
    await product.remove();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: req.body.name || 'Sample name',
    price: req.body.price || 0,
    user: req.user._id,
    image: req.body.image || '/images/sample.jpg',
    cloudinaryId: req.body.cloudinaryId || '',
    brand: req.body.brand || 'Sample brand',
    category: req.body.category || 'Sample category',
    countInStock: req.body.countInStock || 0,
    description: req.body.description || 'Sample description',
    specifications: req.body.specifications || {},
    // Category-specific attributes
    model: req.body.model || '',
    storage: req.body.storage || '',
    color: req.body.color || '',
    screenSize: req.body.screenSize || '',
    size: req.body.size || '',
    material: req.body.material || '',
    gender: req.body.gender || '',
    author: req.body.author || '',
    publisher: req.body.publisher || '',
    pages: req.body.pages || 0,
    weight: req.body.weight || '',
    dimensions: req.body.dimensions || ''
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Store old Cloudinary ID for potential cleanup
    const oldCloudinaryId = product.cloudinaryId;
    
    // Update product fields
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.image = req.body.image || product.image;
    product.cloudinaryId = req.body.cloudinaryId || product.cloudinaryId;
    product.brand = req.body.brand || product.brand;
    product.category = req.body.category || product.category;
    product.countInStock = req.body.countInStock || product.countInStock;
    product.specifications = req.body.specifications || product.specifications;
    
    // Update category-specific attributes
    product.model = req.body.model || product.model;
    product.storage = req.body.storage || product.storage;
    product.color = req.body.color || product.color;
    product.screenSize = req.body.screenSize || product.screenSize;
    product.size = req.body.size || product.size;
    product.material = req.body.material || product.material;
    product.gender = req.body.gender || product.gender;
    product.author = req.body.author || product.author;
    product.publisher = req.body.publisher || product.publisher;
    product.pages = req.body.pages || product.pages;
    product.weight = req.body.weight || product.weight;
    product.dimensions = req.body.dimensions || product.dimensions;

    const updatedProduct = await product.save();
    
    // Delete old image from Cloudinary if a new image was uploaded
    if (oldCloudinaryId && oldCloudinaryId !== product.cloudinaryId) {
      const cloudinary = require('../config/cloudinary');
      try {
        await cloudinary.uploader.destroy(oldCloudinaryId);
      } catch (error) {
        console.error('Error deleting old image from Cloudinary:', error.message);
      }
    }
    
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

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
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.json(products);
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