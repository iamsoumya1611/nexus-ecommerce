const Product = require('../models/Product');

// Calculate similarity between two products based on their attributes
const calculateProductSimilarity = (product1, product2) => {
  let similarityScore = 0;
  let totalWeight = 0;
  
  // Category similarity (high weight)
  if (product1.category === product2.category) {
    similarityScore += 0.4;
  }
  totalWeight += 0.4;
  
  // Brand similarity (medium weight)
  if (product1.brand === product2.brand) {
    similarityScore += 0.2;
  }
  totalWeight += 0.2;
  
  // Price range similarity (medium weight)
  const priceDiff = Math.abs(product1.price - product2.price);
  const avgPrice = (product1.price + product2.price) / 2;
  if (avgPrice > 0) {
    const priceSimilarity = 1 - (priceDiff / avgPrice);
    similarityScore += Math.max(0, priceSimilarity) * 0.2;
  }
  totalWeight += 0.2;
  
  // Description similarity using keyword overlap (low weight)
  const desc1Words = product1.description.toLowerCase().split(/\s+/);
  const desc2Words = product2.description.toLowerCase().split(/\s+/);
  const commonWords = desc1Words.filter(word => desc2Words.includes(word));
  const descSimilarity = commonWords.length / Math.max(desc1Words.length, desc2Words.length);
  similarityScore += descSimilarity * 0.2;
  totalWeight += 0.2;
  
  return totalWeight > 0 ? similarityScore / totalWeight : 0;
};

// Get content-based recommendations for a product
const getContentBasedRecommendations = async (productId, limit = 10) => {
  try {
    // Get the target product
    const targetProduct = await Product.findById(productId);
    if (!targetProduct) {
      throw new Error('Product not found');
    }
    
    // Get all other products
    const allProducts = await Product.find({
      _id: { $ne: productId }
    });
    
    // Calculate similarity scores for all products
    const scoredProducts = allProducts.map(product => ({
      product,
      similarity: calculateProductSimilarity(targetProduct, product)
    }));
    
    // Sort by similarity score (descending) and limit results
    const recommendations = scoredProducts
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.product);
      
    return recommendations;
  } catch (error) {
    throw new Error(`Failed to get content-based recommendations: ${error.message}`);
  }
};

// Get content-based recommendations for a user based on their preferences
const getUserContentBasedRecommendations = async (userPreferences, limit = 10) => {
  try {
    // Get all products
    const allProducts = await Product.find({});
    
    // Calculate preference scores for all products
    const scoredProducts = allProducts.map(product => ({
      product,
      score: calculatePreferenceScore(product, userPreferences)
    }));
    
    // Sort by preference score (descending) and limit results
    const recommendations = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
      
    return recommendations;
  } catch (error) {
    throw new Error(`Failed to get user content-based recommendations: ${error.message}`);
  }
};

// Calculate preference score based on user preferences
const calculatePreferenceScore = (product, userPreferences) => {
  let score = 0;
  
  // Preferred categories
  if (userPreferences.categories && userPreferences.categories.includes(product.category)) {
    score += 0.4;
  }
  
  // Preferred brands
  if (userPreferences.brands && userPreferences.brands.includes(product.brand)) {
    score += 0.3;
  }
  
  // Price range preference
  if (userPreferences.priceRange) {
    const { min, max } = userPreferences.priceRange;
    if (product.price >= min && product.price <= max) {
      score += 0.2;
    } else if (product.price > max) {
      // Penalize products that are too expensive
      score -= 0.1;
    }
  }
  
  // High-rated products get a boost
  if (product.rating >= 4) {
    score += 0.1;
  }
  
  return Math.max(0, score); // Ensure non-negative score
};

module.exports = {
  getContentBasedRecommendations,
  getUserContentBasedRecommendations
};