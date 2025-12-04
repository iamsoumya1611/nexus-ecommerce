import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Ritika Jaiswal",
      role: "Verified Customer",
      content: "The quality of products here is exceptional. I've been a loyal customer for over a year now and have never been disappointed.",
      rating: 5,
      avatar: "https://placehold.co/80x80/e0e7ff/e0e7ff"
    },
    {
      id: 2,
      name: "Anuj Desai",
      role: "Verified Customer",
      content: "Fast shipping and excellent customer service. The product arrived in perfect condition and exceeded my expectations.",
      rating: 5,
      avatar: "https://placehold.co/80x80/a5b4fc/a5b4fc"
    },
    {
      id: 3,
      name: "Nikhil Verma",
      role: "Verified Customer",
      content: "Great prices and wide selection. I always find what I'm looking for here. Will definitely recommend to friends and family.",
      rating: 4,
      avatar: "https://placehold.co/80x80/6366f1/6366f1"
    }
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-primary-900 mb-4">What Our Customers Say</h2>
        <p className="text-primary-700 max-w-2xl mx-auto">
          Don't just take our word for it. Here's what our satisfied customers have to say about their experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="card p-6">
            <div className="flex items-center mb-4">
              <img 
                src={testimonial.avatar} 
                alt={testimonial.name} 
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h4 className="font-bold text-primary-900">{testimonial.name}</h4>
                <p className="text-sm text-primary-700">{testimonial.role}</p>
              </div>
            </div>
            <div className="rating mb-3">
              {[...Array(5)].map((_, i) => (
                <i 
                  key={i} 
                  className={`fas fa-star ${i < testimonial.rating ? 'active' : 'inactive'}`}
                ></i>
              ))}
            </div>
            <p className="text-primary-700 italic">"{testimonial.content}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;