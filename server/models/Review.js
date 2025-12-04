const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews from the same user for the same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update product rating when a review is saved
reviewSchema.statics.updateProductRating = async function(productId) {
  const Review = this;
  
  const stats = await Review.aggregate([
    {
      $match: { product: mongoose.Types.ObjectId(productId) }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      rating: stats[0].averageRating,
      numReviews: stats[0].numOfReviews
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0
    });
  }
};

// Update product rating after saving or removing a review
reviewSchema.post('save', async function() {
  await this.constructor.updateProductRating(this.product);
});

reviewSchema.post('remove', async function() {
  await this.constructor.updateProductRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);