const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  // Category-specific attributes
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  // Electronics specific
  model: {
    type: String
  },
  storage: {
    type: String
  },
  color: {
    type: String
  },
  screenSize: {
    type: String
  },
  // Fashion specific
  size: {
    type: String
  },
  material: {
    type: String
  },
  gender: {
    type: String
  },
  // Books specific
  author: {
    type: String
  },
  publisher: {
    type: String
  },
  pages: {
    type: Number
  },
  // Common attributes
  weight: {
    type: String
  },
  dimensions: {
    type: String
  },
  reviews: [reviewSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);