import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    setSubmitted(true);
    setEmail('');
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-xl p-8 mb-16">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Join Our Newsletter</h2>
        <p className="text-primary-100 mb-6">
          Subscribe to get special offers, free giveaways, and new product alerts
        </p>
        
        {submitted ? (
          <div className="bg-success-50 text-success-800 p-4 rounded-lg">
            <p className="font-medium">Thank you for subscribing!</p>
            <p>You'll receive our next newsletter soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <button 
              type="submit" 
              className="btn btn-primary px-6 py-3 font-semibold whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}
        
        <p className="text-primary-300 text-sm mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export default Newsletter;