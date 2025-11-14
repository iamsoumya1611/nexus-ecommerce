import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../actions/productActions';
import Product from '../components/Product';
import Hero from '../components/Hero';
import CategoryShowcase from '../components/CategoryShowcase';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import Slide from '../components/Slide';
import AIRecommendations from '../components/AIRecommendations';

// Home Screen Component
// This is the main landing page of the e-commerce application
const Home = () => {
  // Redux dispatch function to send actions to the store
  const dispatch = useDispatch();

  // Get product list state from Redux store
  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  // useEffect hook to fetch products when component mounts
  useEffect(() => {
    // Dispatch action to fetch product list
    dispatch(listProducts());
  }, [dispatch]); // Dependency array - runs when dispatch function changes

  // Get first 4 products to display as featured products
  const featuredProducts = Array.isArray(products) ? products.slice(0, 4) : [];

  return (
    // Main container with padding and margin
    <div className="container mx-auto px-4 py-8 font-sans">
      {/* Hero section - displays promotional content */}
      <Hero />

      {/* AI Recommendations Section - only shown when user is logged in */}
      <AIRecommendations />

      <div className="my-8">
        <Slide title="Best Seller" />
      </div>

      <div className="my-8">
        <Slide title="Upto 80% Off" />
      </div>

      <div className="my-8">
        <img className='block w-full lg:w-[80%] h-[300px] mx-auto' src="https://res.cloudinary.com/dm4hy8ivc/image/upload/v1762882112/desktop_banner_kikeem.png" alt="Banner" />
      </div>

      {/* Category showcase - displays product categories */}
      <CategoryShowcase />

      {/* Featured Products Section */}
      <div className="mb-16">
        {/* Section header with title and description */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">Featured Products</h2>
          <p className="text-primary-700 max-w-2xl mx-auto">
            Discover our most popular items loved by thousands of customers
          </p>
        </div>

        {/* Product display area with loading and error handling */}
        {loading ? (
          // Show loading spinner while products are being fetched
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          // Show error message if there was a problem fetching products
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          // Display featured products in a responsive grid
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Map through featured products and render Product component for each */}
            {featuredProducts.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Testimonials section - displays customer reviews */}
      <Testimonials />

      {/* Newsletter section - allows users to subscribe to updates */}
      <Newsletter />
    </div>
  );
};

export default Home;