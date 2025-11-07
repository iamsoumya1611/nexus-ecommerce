import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h5 className="text-lg font-bold mb-4">Nexus</h5>
            <p className="text-primary-100">
              Your one-stop destination for all your shopping needs. Quality products at affordable prices.
            </p>
          </div>
          <div>
            <h5 className="text-lg font-bold mb-4">Quick Links</h5>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-primary-100 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/cart" className="text-primary-100 hover:text-white transition-colors">
                  Cart
                </a>
              </li>
              <li>
                <a href="/login" className="text-primary-100 hover:text-white transition-colors">
                  Login
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-bold mb-4">Contact Us</h5>
            <ul className="space-y-2 text-primary-100">
              <li>Email: support@soumyadeveloper.site</li>
              <li>Phone: (123) 456-7890</li>
            </ul>
          </div>
        </div>
        <hr className="my-6 border-primary-700" />
        <div className="text-center text-primary-300">
          <p>&copy; {new Date().getFullYear()} Nexus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;