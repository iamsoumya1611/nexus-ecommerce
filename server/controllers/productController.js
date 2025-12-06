const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const { cache, clearCache } = require('../middleware/cacheMiddleware');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  badRequestResponse 
} = require('../utils/apiResponse');

// Add the ObjectId validator
const { isValidObjectId } = require('../utils/objectIdValidator');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = [
  cache('products', 300), // Cache for 5 minutes
  asyncHandler(async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 12;
    const page = parseInt(req.query.pageNumber) || 1;
    
    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 50) {
      console.warn('Invalid pagination parameters:', { page, pageSize });
      return res.status(400).json(badRequestResponse('Invalid pagination parameters'));
    }

    // Build query object
    let query = {};
    
    // Add keyword search if provided
    if (req.query.keyword) {
      query.$or = [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
        { brand: { $regex: req.query.keyword, $options: 'i' } },
        { category: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }
    
    // Add category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Add brand filter if provided
    if (req.query.brand) {
      query.brand = req.query.brand;
    }
    
    // Add price range filters if provided
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }
    
    // Add rating filter if provided
    if (req.query.rating) {
      query.rating = { $gte: parseFloat(req.query.rating) };
    }

    try {
      // Use Promise.all for concurrent operations
      const [count, products] = await Promise.all([
        Product.countDocuments(query),
        Product.find(query)
          .limit(pageSize)
          .skip(pageSize * (page - 1))
          .sort({ createdAt: -1 }) // Sort by newest first
          .lean() // Use lean for better performance
      ]);

      res.json(successResponse({
        products,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
      }, 'Products fetched successfully'));
    } catch (error) {
      console.error('Error fetching products:', {
        error: error.message,
        stack: error.stack,
        filters: {
          keyword: req.query.keyword || 'none',
          category: req.query.category || 'all',
          brand: req.query.brand || 'all'
        }
      });
      return res.status(500).json(errorResponse(error, 'Failed to fetch products'));
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
      // Validate ObjectId format using utility
      if (!isValidObjectId(req.params.id)) {
        console.warn('Invalid product ID format:', {
          productId: req.params.id,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(400).json(badRequestResponse('Invalid product ID format'));
      }
      
      const product = await Product.findById(req.params.id).lean();

      if (product) {
        console.log('Product fetched successfully:', {
          productId: product._id,
          productName: product.name
        });
        
        // Add related products
        const relatedProducts = await Product.find({
          _id: { $ne: product._id },
          category: product.category
        })
        .limit(4)
        .select('name image price rating')
        .lean();
        
        res.json(successResponse({
          product: {
            ...product,
            relatedProducts
          }
        }, 'Product fetched successfully'));
      } else {
        console.warn('Product not found:', {
          productId: req.params.id
        });
        
        return res.status(404).json(notFoundResponse('Product'));
      }
    } catch (error) {
      console.error('Error fetching product:', {
        error: error.message,
        stack: error.stack,
        productId: req.params.id
      });
      
      if (error.name === 'CastError') {
        return res.status(400).json(badRequestResponse('Invalid product ID'));
      }
      
      return res.status(500).json(errorResponse(error, 'Failed to fetch product'));
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
        
        console.log('Product deleted successfully:', {
          productId: product._id,
          productName: product.name,
          deletedBy: req.user._id
        });
        
        res.json(successResponse(null, 'Product removed successfully'));
      } else {
        console.warn('Attempt to delete non-existent product:', {
          productId: req.params.id,
          userId: req.user._id
        });
        
        res.status(404);
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error deleting product:', {
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
      
      console.log('Product created successfully:', {
        productId: createdProduct._id,
        productName: createdProduct.name,
        createdBy: req.user._id
      });
      
      res.status(201).json(successResponse(createdProduct, 'Product created successfully', 201));
    } catch (error) {
      console.error('Error creating product:', {
        error: error.message,
        createdBy: req.user._id,
        body: req.body
      });
      
      throw error;
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
        const oldCategory = product.category;
        
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.image = image || product.image;
        product.brand = brand || product.brand;
        product.category = category || product.category;
        product.countInStock = countInStock || product.countInStock;
        product.specifications = specifications || product.specifications;

        const updatedProduct = await product.save();
        
        // Clear cache for related products if category changed
        if (oldCategory !== product.category) {
          await clearCacheByKey(`GET_product_${req.originalUrl}_${JSON.stringify(req.query)}`);
        }
        
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