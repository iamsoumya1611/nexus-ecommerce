import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../actions/productActions';
import Product from '../components/Product';
import Hero from '../components/Hero';
import CategoryShowcase from '../components/CategoryShowcase';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';

const Home = () => {
  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  // Get featured products (first 4 for display)
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />
      
      <CategoryShowcase />
      
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-brown-900 mb-4">Featured Products</h2>
          <p className="text-brown-700 max-w-2xl mx-auto">
            Discover our most popular items loved by thousands of customers
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brown-500"></div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Product product={product} key={product._id} />
            ))}
          </div>
        )}
      </div>
      
      <Testimonials />
      
      <Newsletter />
    </div>
  );
};

export default Home;