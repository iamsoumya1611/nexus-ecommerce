import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="text-lg font-bold mb-4">Get to Know Us</h5>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-primary-100 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className="text-primary-100 hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="/press-releases" className="text-primary-100 hover:text-white transition-colors">
                  Press Releases
                </a>
              </li>
              <li>
                <a href="/nexus-cares" className="text-primary-100 hover:text-white transition-colors">
                  Nexus Cares
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-bold mb-4">Connect With Us</h5>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-primary-100 hover:text-white transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="/twitter" className="text-primary-100 hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="/instagram" className="text-primary-100 hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-bold mb-4">Make Money with Us</h5>
            <ul className="space-y-2">
              <li>
                <a href="/sell-on-nexus" className="text-primary-100 hover:text-white transition-colors">
                  Sell on Nexus
                </a>
              </li>
              <li>
                <a href="/advertise" className="text-primary-100 hover:text-white transition-colors">
                  Advertise
                </a>
              </li>
              <li>
                <a href="/business-solutions" className="text-primary-100 hover:text-white transition-colors">
                  Business Solutions
                </a>
              </li>
              <li>
                <a href="/large-appliance-rental" className="text-primary-100 hover:text-white transition-colors">
                  Large Appliances Rental
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-bold mb-4">Contact Us</h5>
            <ul className="space-y-2 text-primary-100">
              <li>Email: support@soumyadeveloper.site</li>
              <li>Contact: +91 (629) 079-8965</li>
            </ul>
          </div>
        </div>
        <hr className="my-6 border-primary-700" />
        <div className="text-center text-primary-300">
          <img src="/logo-removebg.png" alt="Nexus Logo" className="h-10 mx-auto" loading="lazy" />
          <p>&copy; {new Date().getFullYear()} Nexus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;