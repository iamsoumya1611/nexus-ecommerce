import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Gita Chodhary",
      role: "Regular Customer",
      avatar: "https://placehold.co/100x100/6366f1/white?text=SJ",
      rating: 5,
      content: "Nexus has completely transformed my shopping experience. The quality of products and fast delivery exceeded my expectations!"
    },
    {
      id: 2,
      name: "Mayank Sharma",
      role: "Tech Enthusiast",
      avatar: "https://placehold.co/100x100/4f46e5/white?text=MC",
      rating: 5,
      content: "As someone who values efficiency, I appreciate how easy it is to find exactly what I need. The AI recommendations are spot on!"
    },
    {
      id: 3,
      name: "Ekta Rastogi",
      role: "Fashion Blogger",
      avatar: "https://placehold.co/100x100/a5b4fc/white?text=ER",
      rating: 4,
      content: "The fashion section is well-curated with trendy pieces. Customer service resolved my sizing issue promptly. Will shop again!"
    }
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-primary-900 mb-4">What Our Customers Say</h2>
        <p className="text-primary-700 max-w-2xl mx-auto">
          Don't just take our word for it. Hear from our satisfied customers about their shopping experiences.
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
                loading="lazy"
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