import React, { useState } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Login' button in the top right corner and select 'Register'. Fill in your details and submit the form. You'll receive a confirmation email to verify your account."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards including Visa, Mastercard, and American Express. We also support PayPal and Apple Pay for your convenience."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-5 business days. Express shipping is available for next-day delivery in most metropolitan areas. Shipping times may vary based on your location."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy on all items. Items must be in their original condition with tags attached. Please contact our customer service team to initiate a return."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to over 50 countries worldwide. International shipping costs and delivery times vary by destination. Customs and import duties may apply."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order has been shipped, you'll receive a tracking number via email. You can use this number on our website's order tracking page or directly on the carrier's website."
    },
    {
      question: "Are my personal details secure?",
      answer: "We take your privacy seriously. All personal information is encrypted and stored securely. We never share your information with third parties without your consent."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team 24/7 through our contact form, email at support@shopease.com, or by calling our toll-free number at +1 (555) 123-4567."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-primary-700 max-w-2xl mx-auto">
            Find answers to common questions about our products, services, and policies.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="card overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-6 text-left"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-semibold text-primary-900">{faq.question}</h3>
                <i className={`fas fa-chevron-down transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}></i>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 text-primary-700">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Still Have Questions?</h2>
          <p className="text-primary-700 mb-6">
            Can't find the answer you're looking for? Please contact our customer support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn btn-primary px-6 py-3">
              Contact Us
            </a>
            <a href="tel:+15551234567" className="btn btn-light px-6 py-3">
              <i className="fas fa-phone mr-2"></i>
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;