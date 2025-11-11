import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../actions/productActions';
import Product from '../components/Product';
import Hero from '../components/Hero';
import CategoryShowcase from '../components/CategoryShowcase';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import Slide from '../components/Slide';

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

      <div className="flex items-center flex-wrap lg:flex-nowrap">
        <div className="w-full lg:w-[80%]">
          <Slide title='Deal Of The Day' />
        </div>

        <div className="w-full lg:w-[20%] h-[370px] flex flex-col justify-evenly items-center bg-white rounded-md p-4 mt-4 lg:mt-0 lg:ml-4">
          <h4 className='text-primary-700 font-semibold text-center'>Festive latest launches</h4>

          <img className='w-full h-60 object-contain' src="https://res.cloudinary.com/dm4hy8ivc/image/upload/v1762881242/winter_season_offer_gscyrr.png" alt="Festive Offer" />

          <a className='text-primary-700 hover:text-primary-900 font-medium' href="#">See More</a>
        </div>
      </div>

      <div className="my-8">
        <Slide title="Today's Deal" />
      </div>

      <div className="my-8">
        <img className='block w-full lg:w-[80%] h-[300px] mx-auto' src="https://res.cloudinary.com/dm4hy8ivc/image/upload/v1762882112/desktop_banner_kikeem.png" alt="Banner" />
      </div>

      <div className="my-8">
        <Slide title="Best Seller" />
      </div>

      <div className="my-8">
        <Slide title="Upto 80% Off" />
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
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          // Display products in a grid layout
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts && featuredProducts.length > 0 ? (
              // Map through featured products and render Product components
              featuredProducts.map((product) => (
                <Product product={product} key={product._id} />
              ))
            ) : (
              // Show message if no products are available
              <div className="col-span-full text-center py-8">
                <p className="text-primary-700">No products found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Testimonials section - displays customer reviews */}
      <Testimonials />

      {/* Newsletter section - allows users to subscribe */}
      <Newsletter />
    </div>
  );
};

export default Home;