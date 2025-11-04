import React from 'react';
import { Link } from 'react-router-dom';

const Product = ({ product }) => {
  // Format price to INR
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Render star ratings
  const renderRating = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <i 
            key={i} 
            className={`fas fa-star ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          ></i>
        ))}
        <span className="text-primary-700 text-sm font-medium ml-2">({product.numReviews})</span>
      </div>
    );
  };

  // Get specification details based on category
  const getSpecifications = () => {
    const specs = [];
    
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative">
        <img 
          src={product.image} 
          className="w-full h-56 object-cover" 
          alt={product.name} 
        />
        {product.rating >= 4.5 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <i className="fas fa-star mr-1"></i> Top Rated
          </div>
        )}
        {product.price < 1000 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <i className="fas fa-tag mr-1"></i> Great Deal
          </div>
        )}
      </div>
      
      {/* Product Details */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-primary-900 line-clamp-2">
            <Link to={`/product/${product._id}`} className="hover:text-primary-700 transition-colors">
              {product.name}
            </Link>
          </h3>
        </div>
        
        <div className="mb-3">
          <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        
        {/* Specifications */}
        <div className="mb-3 max-h-24 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary-200 scrollbar-track-primary-50 rounded">
          {getSpecifications().map((spec, index) => (
            <div key={index} className="flex text-xs text-primary-700 mb-1">
              <span className="font-medium w-20 truncate">{spec.label}:</span>
              <span className="ml-2 truncate">{spec.value}</span>
            </div>
          ))}
        </div>
        
        <p className="text-primary-700 text-sm mb-4 flex-grow line-clamp-2">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              {renderRating(product.rating)}
            </div>
            <div className="text-right">
              <strong className="text-2xl font-bold text-primary-800">{formatPrice(product.price)}</strong>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to={`/product/${product._id}`} 
              className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-4 rounded-xl text-center transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
            >
              <i className="fas fa-eye mr-2"></i> 
              <span className="text-white text-sm">View Details</span>
            </Link>
            
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