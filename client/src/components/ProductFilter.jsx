import React, { useState } from 'react';

const ProductFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'name'
  });

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Beauty'
  ];

  const handleCategoryChange = (category) => {
    const newFilters = { ...filters, category };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (priceRange) => {
    const newFilters = { ...filters, priceRange };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="card p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Filter */}
        <div>
          <h3 className="font-semibold text-primary-900 mb-3">Categories</h3>
          <div className="space-y-2">
            <button
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                filters.category === '' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
              onClick={() => handleCategoryChange('')}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  filters.category === category 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <h3 className="font-semibold text-primary-900 mb-3">Price Range</h3>
          <div className="space-y-2">
            <button
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                filters.priceRange === '' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
              onClick={() => handlePriceChange('')}
            >
              All Prices
            </button>
            <button
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                filters.priceRange === '0-2500' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
              onClick={() => handlePriceChange('0-2500')}
            >
              ₹0 - ₹2500
            </button>
            <button
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                filters.priceRange === '2500-5000' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
              onClick={() => handlePriceChange('2500-5000')}
            >
              ₹2500 - ₹5000
            </button>
            <button
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                filters.priceRange === '5000-10000' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
              onClick={() => handlePriceChange('5000-10000')}
            >
              ₹5000 - ₹10000
            </button>
            <button
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                filters.priceRange === '10000+' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
              onClick={() => handlePriceChange('10000+')}
            >
              ₹10000+
            </button>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <h3 className="font-semibold text-primary-900 mb-3">Sort By</h3>
          <select
            className="form-input w-full"
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="name">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="rating">Rating (High to Low)</option>
            <option value="date">Newest First</option>
          </select>
          
          <button
            className="btn btn-light w-full mt-4"
            onClick={() => {
              const resetFilters = { category: '', priceRange: '', sortBy: 'name' };
              setFilters(resetFilters);
              onFilterChange(resetFilters);
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;