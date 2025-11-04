import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-brown-900 mb-6">About ShopEase</h1>
          <p className="text-xl text-brown-700 max-w-3xl mx-auto">
            We're passionate about providing the best shopping experience with quality products at competitive prices.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">Our Story</h2>
            <p className="text-brown-700 mb-4">
              Founded in 2020, ShopEase began with a simple mission: to make quality products accessible to everyone. 
              What started as a small online store has grown into a trusted platform serving thousands of customers worldwide.
            </p>
            <p className="text-brown-700 mb-4">
              Our team is dedicated to curating the finest products and ensuring each customer receives exceptional service. 
              We believe in building long-term relationships based on trust, quality, and value.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64" />
          </div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-brown-900 mb-8 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 card">
              <div className="w-16 h-16 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shipping-fast text-brown-700 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-brown-900 mb-2">Fast Shipping</h3>
              <p className="text-brown-700">
                Free shipping on orders over $50. Most orders delivered within 3-5 business days.
              </p>
            </div>
            
            <div className="text-center p-6 card">
              <div className="w-16 h-16 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-undo text-brown-700 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-brown-900 mb-2">Easy Returns</h3>
              <p className="text-brown-700">
                Not satisfied? Return within 30 days for a full refund. No questions asked.
              </p>
            </div>
            
            <div className="text-center p-6 card">
              <div className="w-16 h-16 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-headset text-brown-700 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-brown-900 mb-2">24/7 Support</h3>
              <p className="text-brown-700">
                Our customer service team is available around the clock to assist you.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-brown-100 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-brown-900 mb-4">Our Commitment</h2>
          <p className="text-brown-700 max-w-2xl mx-auto mb-6">
            We're committed to sustainability and ethical business practices. 
            Every purchase you make supports our mission to create a better future.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-white text-brown-700 px-4 py-2 rounded-full">Eco-Friendly</span>
            <span className="bg-white text-brown-700 px-4 py-2 rounded-full">Ethically Sourced</span>
            <span className="bg-white text-brown-700 px-4 py-2 rounded-full">Community Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;