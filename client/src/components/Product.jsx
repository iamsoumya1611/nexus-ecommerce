import React from 'react';
import { Link } from 'react-router-dom';

// Product Component
// This component displays a single product card with its details
const Product = ({ product }) => {
  // Check if product exists, if not return nothing
  if (!product) {
    return null;
  }

  // Format price to Indian Rupees (INR)
  const formatPrice = (price) => {
    // Check if price is a valid number
    if (typeof price !== 'number') return '₹0';
    
    // Format the price as INR currency without decimal places
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Render star ratings for the product
  const renderRating = (rating) => {
    // Ensure rating is a number, default to 0 if not
    const numericRating = typeof rating === 'number' ? rating : 0;
    const numReviews = product.numReviews || 0;
    
    return (
      <div className="flex items-center">
        {/* Create 5 stars, fill them based on the rating */}
        {[...Array(5)].map((_, i) => (
          <i 
            key={i} 
            className={`fas fa-star ${i < Math.floor(numericRating) ? 'text-yellow-400' : 'text-gray-300'}`}
          ></i>
        ))}
        {/* Display number of reviews */}
        <span className="text-primary-700 text-sm font-medium ml-2">({numReviews})</span>
      </div>
    );
  };

  // Get product specifications based on category
  const getSpecifications = () => {
    // Initialize empty array for specifications
    const specs = [];
    
    // Return empty array if no category
    if (!product.category) return specs;
    
    // Add specifications based on product category
    if (product.category === 'Electronics') {
      if (product.brand) specs.push({ label: 'Brand', value: product.brand });
      if (product.model) specs.push({ label: 'Model', value: product.model });
      if (product.storage) specs.push({ label: 'Storage', value: product.storage });
      if (product.color) specs.push({ label: 'Color', value: product.color });
      if (product.screenSize) specs.push({ label: 'Screen Size', value: product.screenSize });
    } else if (product.category === 'Fashion') {
      if (product.brand) specs.push({ label: 'Brand', value: product.brand });
      if (product.size) specs.push({ label: 'Size', value: product.size });
      if (product.material) specs.push({ label: 'Material', value: product.material });
      if (product.color) specs.push({ label: 'Color', value: product.color });
      if (product.gender) specs.push({ label: 'Gender', value: product.gender });
    } else if (product.category === 'Books') {
      if (product.author) specs.push({ label: 'Author', value: product.author });
      if (product.publisher) specs.push({ label: 'Publisher', value: product.publisher });
      if (product.pages) specs.push({ label: 'Pages', value: product.pages });
    } else if (product.category === 'Home & Kitchen') {
      if (product.brand) specs.push({ label: 'Brand', value: product.brand });
      if (product.material) specs.push({ label: 'Material', value: product.material });
      if (product.weight) specs.push({ label: 'Weight', value: product.weight });
      if (product.dimensions) specs.push({ label: 'Dimensions', value: product.dimensions });
    } else if (product.category === 'Sports') {
      if (product.brand) specs.push({ label: 'Brand', value: product.brand });
      if (product.gender) specs.push({ label: 'Gender', value: product.gender });
    } else if (product.category === 'Beauty') {
      if (product.brand) specs.push({ label: 'Brand', value: product.brand });
      if (product.gender) specs.push({ label: 'Gender', value: product.gender });
    }
    
    return specs;
  };

  return (
    // Product card container with hover effects
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Product Image Section */}
      <div className="relative">
        {/* Product image with error handling */}
        <img 
          src={product.image || '/placeholder.svg'} 
          className="w-full h-56 object-cover" 
          alt={product.name || 'Product'} 
          onError={(e) => {
            // Fallback to placeholder image if the product image fails to load
            e.target.src = '/placeholder.svg';
          }}
        />
        
        {/* Top Rated Badge - shown for highly rated products */}
        {product.rating >= 4.5 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <i className="fas fa-star mr-1"></i> Top Rated
          </div>
        )}
        
        {/* Great Deal Badge - shown for affordable products */}
        {product.price < 1000 && product.price > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <i className="fas fa-tag mr-1"></i> Great Deal
          </div>
        )}
      </div>
      
      {/* Product Details Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Product Name */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-primary-900 line-clamp-2">
            <Link to={`/product/${product._id}`} className="hover:text-primary-700 transition-colors">
              {product.name || 'Unnamed Product'}
            </Link>
          </h3>
        </div>
        
        {/* Product Category Badge */}
        <div className="mb-3">
          <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
            {product.category || 'Uncategorized'}
          </span>
        </div>
        
        {/* Product Specifications */}
        <div className="mb-3 max-h-24 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary-200 scrollbar-track-primary-50 rounded">
          {getSpecifications().map((spec, index) => (
            <div key={index} className="flex text-xs text-primary-700 mb-1">
              <span className="font-medium w-20 truncate">{spec.label}:</span>
              <span className="ml-2 truncate">{spec.value}</span>
            </div>
          ))}
        </div>
        
        {/* Product Description */}
        <p className="text-primary-700 text-sm mb-4 flex-grow line-clamp-2">
          {product.description || 'No description available'}
        </p>
        
        {/* Product Actions Section */}
        <div className="mt-auto">
          {/* Rating and Price */}
          <div className="flex justify-between items-center mb-4">
            <div>
              {renderRating(product.rating)}
            </div>
            <div className="text-right">
              <strong className="text-2xl font-bold text-primary-800">{formatPrice(product.price)}</strong>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* View Details Button */}
            <Link 
              to={`/product/${product._id}`} 
              className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-4 rounded-xl text-center transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
            >
              <i className="fas fa-eye mr-2"></i> 
              <span className="text-white text-sm">View Details</span>
            </Link>
            
            {/* Buy Now Button */}
            <button 
              className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl text-center transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
            >
              <i className="fas fa-shopping-cart mr-2"></i> 
              <span className="text-white text-sm">Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;