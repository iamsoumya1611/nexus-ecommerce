const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Get collaborative filtering recommendations based on user behavior
const getCollaborativeRecommendations = async (userId, limit = 10) => {
  try {
    // Get user's purchase history
    const userOrders = await Order.find({ user: userId }).populate('orderItems.product');
    
    if (!userOrders || userOrders.length === 0) {
      // If no purchase history, return popular products
      return await getPopularProducts(limit);
    }
    
    // Extract purchased product IDs
    const purchasedProductIds = [];
    userOrders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.product && !purchasedProductIds.includes(item.product._id.toString())) {
          purchasedProductIds.push(item.product._id.toString());
        }
      });
    });
    
    // Find users with similar purchase history
    const similarUsers = await findSimilarUsers(userId, purchasedProductIds);
    
    if (similarUsers.length === 0) {
      // If no similar users, return category-based recommendations
      return await getCategoryBasedRecommendations(purchasedProductIds, limit);
    }
    
    // Get products purchased by similar users but not by current user
    const recommendations = await getProductsFromSimilarUsers(similarUsers, purchasedProductIds, limit);
    
    return recommendations;
  } catch (error) {
    throw new Error(`Failed to get collaborative recommendations: ${error.message}`);
  }
};

// Find users with similar purchase history
const findSimilarUsers = async (userId, purchasedProductIds) => {
  try {
    // Find orders from other users
    const otherUsersOrders = await Order.find({
      user: { $ne: userId }
    }).populate('user', 'name').populate('orderItems.product');
    
    // Calculate similarity scores for each user
    const userSimilarityScores = {};
    
    otherUsersOrders.forEach(order => {
      const orderId = order.user._id.toString();
      
      // Initialize user score if not exists
      if (!userSimilarityScores[orderId]) {
        userSimilarityScores[orderId] = {
          user: order.user,
          similarity: 0,
          commonProducts: 0
        };
      }
      
      // Count common products
      order.orderItems.forEach(item => {
        if (item.product && purchasedProductIds.includes(item.product._id.toString())) {
          userSimilarityScores[orderId].similarity += 1;
          userSimilarityScores[orderId].commonProducts += 1;
        }
      });
    });
    
    // Convert to array and sort by similarity
    const sortedUsers = Object.values(userSimilarityScores)
      .filter(user => user.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Top 10 similar users
    
    return sortedUsers;
  } catch (error) {
    throw new Error(`Failed to find similar users: ${error.message}`);
  }
};

// Get products purchased by similar users but not by current user
const getProductsFromSimilarUsers = async (similarUsers, excludeProductIds, limit) => {
  try {
    // Get similar user IDs
    const similarUserIds = similarUsers.map(user => user.user._id);
    
    // Find orders from similar users
    const similarUsersOrders = await Order.find({
      user: { $in: similarUserIds }
    }).populate('orderItems.product');
    
    // Count product frequencies
    const productFrequency = {};
    
    similarUsersOrders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.product) {
          const productId = item.product._id.toString();
          
          // Skip products already purchased by the user
          if (excludeProductIds.includes(productId)) {
            return;
          }
          
          if (!productFrequency[productId]) {
            productFrequency[productId] = {
              product: item.product,
              frequency: 0,
              rating: item.product.rating || 0
            };
          }
          
          productFrequency[productId].frequency += 1;
        }
      });
    });
    
    // Convert to array and sort by frequency and rating
    const sortedProducts = Object.values(productFrequency)
      .sort((a, b) => {
        // Primary sort by frequency
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        // Secondary sort by rating
        return b.rating - a.rating;
      })
      .slice(0, limit)
      .map(item => item.product);
    
    return sortedProducts;
  } catch (error) {
    throw new Error(`Failed to get products from similar users: ${error.message}`);
  }
};

// Get popular products for users with no purchase history
const getPopularProducts = async (limit = 10) => {
  try {
    const popularProducts = await Product.find({})
      .sort({ rating: -1, numReviews: -1 })
      .limit(limit);
    
    return popularProducts;
  } catch (error) {
    throw new Error(`Failed to get popular products: ${error.message}`);
  }
};

// Get category-based recommendations
const getCategoryBasedRecommendations = async (excludeProductIds, limit) => {
  try {
    // Get products from the same categories as excluded products
    const excludedProducts = await Product.find({
      _id: { $in: excludeProductIds.map(id => id.toString()) }
    });
    
    const categories = [...new Set(excludedProducts.map(p => p.category))];
    
    const recommendations = await Product.find({
      category: { $in: categories },
      _id: { $nin: excludeProductIds }
    })
    .sort({ rating: -1 })
    .limit(limit);
    
    return recommendations;
  } catch (error) {
    throw new Error(`Failed to get category-based recommendations: ${error.message}`);
  }
};

module.exports = {
  getCollaborativeRecommendations,
  getPopularProducts
};