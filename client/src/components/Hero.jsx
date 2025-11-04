import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary-700 to-primary-900 rounded-xl overflow-hidden mb-12">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Shop the latest trends with unbeatable prices and exceptional quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                to="/products" 
                className="btn btn-primary px-8 py-3 text-lg font-semibold"
              >
                Shop Now
              </Link>
              <Link 
                to="/about" 
                className="btn btn-light px-8 py-3 text-lg font-semibold"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-primary-500 rounded-full opacity-20 absolute -top-6 -left-6"></div>
              <div className="w-64 h-64 md:w-80 md:h-80 bg-primary-300 rounded-full opacity-20 absolute -bottom-6 -right-6"></div>
              <div className="relative bg-white rounded-xl shadow-xl p-4 transform rotate-3">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 md:h-80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;