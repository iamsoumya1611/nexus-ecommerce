import React from 'react';
import { Link } from 'react-router-dom';

const CategoryShowcase = () => {
  const categories = [
    {
      id: 1,
      name: "Electronics",
      image: "https://placehold.co/300x200/e0e7ff/e0e7ff",
      description: "Latest gadgets and devices"
    },
    {
      id: 2,
      name: "Fashion",
      image: "https://placehold.co/300x200/a5b4fc/a5b4fc",
      description: "Trendy clothing and accessories"
    },
    {
      id: 3,
      name: "Home & Garden",
      image: "https://placehold.co/300x200/6366f1/6366f1",
      description: "Everything for your living space"
    },
    {
      id: 4,
      name: "Sports",
      image: "https://placehold.co/300x200/4f46e5/4f46e5",
      description: "Gear up for your activities"
    }
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-primary-900 mb-4">Shop by Category</h2>
        <p className="text-primary-700 max-w-2xl mx-auto">
          Discover the perfect products for your needs in our carefully curated categories
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={`/category/${category.id}`}
            className="group block"
          >
            <div className="card overflow-hidden transition-all duration-300 group-hover:shadow-xl">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900 to-transparent opacity-70"></div>
                <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">
                  {category.name}
                </h3>
              </div>
              <div className="p-4">
                <p className="text-primary-700">{category.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryShowcase;