import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../actions/productActions';
import Product from '../components/Product';
import CategoryRecommendations from '../components/CategoryRecommendations';

const Products = () => {
  const dispatch = useDispatch();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'name',
    // Category-specific filters
    brand: '',
    model: '',
    storage: '',
    color: '',
    size: '',
    material: '',
    gender: '',
    author: '',
    publisher: ''
  });

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...products];

    // Apply category filter
    if (filters.category) {
      result = result.filter(product =>
        product.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Apply price filter
    if (filters.priceRange) {
      switch (filters.priceRange) {
        case '0-2500':
          result = result.filter(product => product.price <= 2500);
          break;
        case '2500-5000':
          result = result.filter(product => product.price > 2500 && product.price <= 5000);
          break;
        case '5000-10000':
          result = result.filter(product => product.price > 5000 && product.price <= 10000);
          break;
        case '10000+':
          result = result.filter(product => product.price > 10000);
          break;
        default:
          break;
      }
    }

    // Apply category-specific filters
    if (filters.category === 'Electronics') {
      if (filters.brand) {
        result = result.filter(product => 
          product.brand && product.brand.toLowerCase().includes(filters.brand.toLowerCase())
        );
      }
      if (filters.model) {
        result = result.filter(product => 
          product.model && product.model.toLowerCase().includes(filters.model.toLowerCase())
        );
      }
      if (filters.storage) {
        result = result.filter(product => 
          product.storage && product.storage.toLowerCase().includes(filters.storage.toLowerCase())
        );
      }
      if (filters.color) {
        result = result.filter(product => 
          product.color && product.color.toLowerCase().includes(filters.color.toLowerCase())
        );
      }
    } else if (filters.category === 'Fashion') {
      if (filters.brand) {
        result = result.filter(product => 
          product.brand && product.brand.toLowerCase().includes(filters.brand.toLowerCase())
        );
      }
      if (filters.size) {
        result = result.filter(product => 
          product.size && product.size.toLowerCase().includes(filters.size.toLowerCase())
        );
      }
      if (filters.material) {
        result = result.filter(product => 
          product.material && product.material.toLowerCase().includes(filters.material.toLowerCase())
        );
      }
      if (filters.gender) {
        result = result.filter(product => 
          product.gender && product.gender.toLowerCase().includes(filters.gender.toLowerCase())
        );
      }
    } else if (filters.category === 'Books') {
      if (filters.author) {
        result = result.filter(product => 
          product.author && product.author.toLowerCase().includes(filters.author.toLowerCase())
        );
      }
      if (filters.publisher) {
        result = result.filter(product => 
          product.publisher && product.publisher.toLowerCase().includes(filters.publisher.toLowerCase())
        );
      }
    } else if (filters.category === 'Home & Kitchen') {
      if (filters.brand) {
        result = result.filter(product => 
          product.brand && product.brand.toLowerCase().includes(filters.brand.toLowerCase())
        );
      }
      if (filters.material) {
        result = result.filter(product => 
          product.material && product.material.toLowerCase().includes(filters.material.toLowerCase())
        );
      }
    } else if (filters.category === 'Sports') {
      if (filters.brand) {
        result = result.filter(product => 
          product.brand && product.brand.toLowerCase().includes(filters.brand.toLowerCase())
        );
      }
      if (filters.gender) {
        result = result.filter(product => 
          product.gender && product.gender.toLowerCase().includes(filters.gender.toLowerCase())
        );
      }
    } else if (filters.category === 'Beauty') {
      if (filters.brand) {
        result = result.filter(product => 
          product.brand && product.brand.toLowerCase().includes(filters.brand.toLowerCase())
        );
      }
      if (filters.gender) {
        result = result.filter(product => 
          product.gender && product.gender.toLowerCase().includes(filters.gender.toLowerCase())
        );
      }
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'date':
        // Assuming products have a createdAt field
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, filters]);

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Categories for filtering
  const categories = [
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Sports',
    'Books',
    'Beauty'
  ];

  // Price ranges for filtering
  const priceRanges = [
    { value: '0-2500', label: '₹0 - ₹2500' },
    { value: '2500-5000', label: '₹2500 - ₹5000' },
    { value: '5000-10000', label: '₹5000 - ₹10000' },
    { value: '10000+', label: '₹10000+' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'rating', label: 'Rating (High to Low)' },
    { value: 'date', label: 'Newest First' }
  ];

  // Get unique brands from products
  const getUniqueBrands = () => {
    const brands = [...new Set(products
      .filter(p => p.category === filters.category)
      .map(p => p.brand)
      .filter(Boolean))];
    return brands;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-900 mb-2">Our Products</h1>
        <p className="text-primary-700 text-lg">Discover amazing products at great prices</p>
      </div>

      {/* Enhanced Filter Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-primary-100 transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <h2 className="text-2xl font-bold text-primary-800 flex items-center">
            <i className="fas fa-filter mr-3 text-primary-500"></i>
            Filter & Sort Products
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Category Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-primary-700 mb-1">Category</label>
              <select
                className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none shadow-sm transition-all duration-300"
                value={filters.category}
                onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary-700 mt-5">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-primary-700 mb-1">Price Range</label>
              <select
                className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none shadow-sm transition-all duration-300"
                value={filters.priceRange}
                onChange={(e) => handleFilterChange({ ...filters, priceRange: e.target.value })}
              >
                <option value="">All Prices</option>
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary-700 mt-5">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>

            {/* Sort By */}
            <div className="relative">
              <label className="block text-sm font-medium text-primary-700 mb-1">Sort By</label>
              <select
                className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none shadow-sm transition-all duration-300"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary-700 mt-5">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>

            {/* Reset Filters Button */}
            <div className="flex items-end">
              <button
                className="w-full bg-gradient-to-r from-primary-100 to-primary-200 hover:from-primary-200 hover:to-primary-300 text-primary-800 py-2 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-sm flex items-center justify-center"
                onClick={() => {
                  const resetFilters = {
                    category: '',
                    priceRange: '',
                    sortBy: 'name',
                    brand: '',
                    model: '',
                    storage: '',
                    color: '',
                    size: '',
                    material: '',
                    gender: '',
                    author: '',
                    publisher: ''
                  };
                  setFilters(resetFilters);
                }}
              >
                <i className="fas fa-redo mr-2"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Dynamic Filters based on Category */}
          {filters.category && (
            <div className="mt-8 pt-6 border-t border-primary-100">
              <h3 className="text-xl font-bold text-primary-800 mb-4 flex items-center">
                <i className="fas fa-sliders-h mr-2"></i>
                Category-Specific Filters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* Electronics Filters */}
                {filters.category === 'Electronics' && (
                  <>
                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Brand</label>
                      <select
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none shadow-sm transition-all duration-300"
                        value={filters.brand}
                        onChange={(e) => handleFilterChange({ ...filters, brand: e.target.value })}
                      >
                        <option value="">All Brands</option>
                        {getUniqueBrands().map((brand) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary-700 mt-5">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Model</label>
                      <input
                        type="text"
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all duration-300"
                        placeholder="Search by model"
                        value={filters.model}
                        onChange={(e) => handleFilterChange({ ...filters, model: e.target.value })}
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Storage</label>
                      <input
                        type="text"
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all duration-300"
                        placeholder="Search by storage"
                        value={filters.storage}
                        onChange={(e) => handleFilterChange({ ...filters, storage: e.target.value })}
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Color</label>
                      <input
                        type="text"
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all duration-300"
                        placeholder="Search by color"
                        value={filters.color}
                        onChange={(e) => handleFilterChange({ ...filters, color: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Fashion Filters */}
                {filters.category === 'Fashion' && (
                  <>
                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Brand</label>
                      <select
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none shadow-sm transition-all duration-300"
                        value={filters.brand}
                        onChange={(e) => handleFilterChange({ ...filters, brand: e.target.value })}
                      >
                        <option value="">All Brands</option>
                        {getUniqueBrands().map((brand) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary-700 mt-5">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Size</label>
                      <input
                        type="text"
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all duration-300"
                        placeholder="Search by size"
                        value={filters.size}
                        onChange={(e) => handleFilterChange({ ...filters, size: e.target.value })}
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Material</label>
                      <input
                        type="text"
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all duration-300"
                        placeholder="Search by material"
                        value={filters.material}
                        onChange={(e) => handleFilterChange({ ...filters, material: e.target.value })}
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Gender</label>
                      <input
                        type="text"
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all duration-300"
                        placeholder="Search by gender"
                        value={filters.gender}
                        onChange={(e) => handleFilterChange({ ...filters, gender: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Books Filters */}
                {filters.category === 'Books' && (
                  <>
                    <div className="relative md:col-span-2">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Author</label>
                      <input
                        type="text"
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all duration-300"
                        placeholder="Search by author"
                        value={filters.author}
                        onChange={(e) => handleFilterChange({ ...filters, author: e.target.value })}
                      />
                    </div>

                    <div className="relative md:col-span-2">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Publisher</label>
                      <input
                        type="text"
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all duration-300"
                        placeholder="Search by publisher"
                        value={filters.publisher}
                        onChange={(e) => handleFilterChange({ ...filters, publisher: e.target.value })}
                      />
                    </div>
                  </>
                )}
                
                {/* Home & Kitchen Filters */}
                {filters.category === 'Home & Kitchen' && (
                  <>
                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Brand</label>
                      <select
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none shadow-sm transition-all duration-300"
                        value={filters.brand}
                        onChange={(e) => handleFilterChange({ ...filters, brand: e.target.value })}
                      >
                        <option value="">All Brands</option>
                        {getUniqueBrands().map((brand) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary-700 mt-5">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Material</label>
                      <input
                        type="text"
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all duration-300"
                        placeholder="Search by material"
                        value={filters.material}
                        onChange={(e) => handleFilterChange({ ...filters, material: e.target.value })}
                      />
                    </div>
                  </>
                )}
                
                {/* Sports Filters */}
                {filters.category === 'Sports' && (
                  <>
                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Brand</label>
                      <select
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none shadow-sm transition-all duration-300"
                        value={filters.brand}
                        onChange={(e) => handleFilterChange({ ...filters, brand: e.target.value })}
                      >
                        <option value="">All Brands</option>
                        {getUniqueBrands().map((brand) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary-700 mt-5">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Gender</label>
                      <input
                        type="text"
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all duration-300"
                        placeholder="Search by gender"
                        value={filters.gender}
                        onChange={(e) => handleFilterChange({ ...filters, gender: e.target.value })}
                      />
                    </div>
                  </>
                )}
                
                {/* Beauty Filters */}
                {filters.category === 'Beauty' && (
                  <>
                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Brand</label>
                      <select
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none shadow-sm transition-all duration-300"
                        value={filters.brand}
                        onChange={(e) => handleFilterChange({ ...filters, brand: e.target.value })}
                      >
                        <option value="">All Brands</option>
                        {getUniqueBrands().map((brand) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary-700 mt-5">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Gender</label>
                      <input
                        type="text"
                        className="w-full bg-primary-50 border-2 border-primary-200 text-primary-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all duration-300"
                        placeholder="Search by gender"
                        value={filters.gender}
                        onChange={(e) => handleFilterChange({ ...filters, gender: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Count and Results */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 bg-primary-50 rounded-xl p-4">
        <p className="text-primary-700 font-medium">
          Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
        </p>
        <div className="mt-2 md:mt-0">
          <span className="text-primary-700 font-medium">Products per page:</span>
          <select 
            className="ml-2 bg-white border border-primary-300 rounded-lg py-1 px-2 text-primary-800"
            value={productsPerPage}
            onChange={(e) => {
              productsPerPage = parseInt(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="8">8</option>
            <option value="12">12</option>
            <option value="16">16</option>
            <option value="24">24</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          {/* Category Recommendations - only shown when a category is selected */}
          {selectedCategory && (
            <CategoryRecommendations category={selectedCategory} />
          )}
          
          {currentProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <i className="fas fa-box-open text-6xl text-primary-300 mb-6"></i>
              <h3 className="text-3xl font-semibold text-primary-900 mb-4">No products found</h3>
              <p className="text-primary-700 text-lg mb-8 max-w-md mx-auto">Try adjusting your filters to see more products</p>
              <button
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => {
                  const resetFilters = {
                    category: '',
                    priceRange: '',
                    sortBy: 'name',
                    brand: '',
                    model: '',
                    storage: '',
                    color: '',
                    size: '',
                    material: '',
                    gender: '',
                    author: '',
                    publisher: ''
                  };
                  setFilters(resetFilters);
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {currentProducts.map((product) => (
                  <Product product={product} key={product._id} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-5 py-3 rounded-xl font-medium ${
                        currentPage === 1 
                          ? 'bg-primary-100 text-primary-400 cursor-not-allowed' 
                          : 'bg-primary-100 text-primary-700 hover:bg-primary-200 hover:shadow-md'
                      } transition-all duration-300`}
                    >
                      <i className="fas fa-chevron-left mr-2"></i> Previous
                    </button>

                    {[...Array(totalPages).keys()].map(number => (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`w-12 h-12 rounded-xl font-bold ${
                          currentPage === number + 1
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                            : 'bg-primary-100 text-primary-700 hover:bg-primary-200 hover:shadow-md'
                        } transition-all duration-300`}
                      >
                        {number + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-5 py-3 rounded-xl font-medium ${
                        currentPage === totalPages 
                          ? 'bg-primary-100 text-primary-400 cursor-not-allowed' 
                          : 'bg-primary-100 text-primary-700 hover:bg-primary-200 hover:shadow-md'
                      } transition-all duration-300`}
                    >
                      Next <i className="fas fa-chevron-right ml-2"></i>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Products;