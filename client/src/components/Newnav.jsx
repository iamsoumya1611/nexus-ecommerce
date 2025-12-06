import React from 'react'

const Newnav = () => {
  // Navigation items as specified in project requirements
  const navItems = [
    'Sell',
    'Bestsellers',
    'Mobiles',
    'Today\'s Deals',
    'Customer Service',
    'New Releases',
    'Nexus Pay',
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Books',
    'Computers',
    'Beauty & Personal Care',
    'Car & Motorbike',
    'Gift Cards',
    'Home Improvement',
    'Toys & Games',
    'Grocery & Gourmet Foods',
    'Sports, Fitness & Outdoors',
    'Custom Products',
    'Health, Household & Personal Care',
    'Video Games',
    'Baby',
    'Audible',
    'Nexus Basics',
    'Pet Supplies',
    'Subscribe & Save',
    'Flights'
  ];

  // Show up to 10 items without depending on specific menu items
  // This approach is flexible and will show the first 10 items regardless of their content
  const maxVisibleItems = 10;
  const displayedItems = navItems.slice(0, maxVisibleItems);
  const remainingItems = navItems.slice(maxVisibleItems);

  return (
    <div className='w-full h-10 bg-indigo-800 text-white relative'>
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center space-x-2 px-4">
          <i className="fas fa-bars text-xl"></i>
          <span className="font-medium">All</span>
        </div>

        <nav className="hidden md:flex space-x-6 whitespace-nowrap px-2">
          {displayedItems.map((item, index) => (
            <a
              key={index}
              href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="hover:text-primary-200 transition-colors text-sm"
            >
              {item}
            </a>
          ))}
          {remainingItems.length > 0 && (
            <a
              href="/more"
              className="hover:text-primary-200 transition-colors text-sm"
            >
              More
            </a>
          )}
        </nav>

        {/* Position the image within the navigation flow instead of absolutely */}
        <div className="flex h-full items-center">
          <img src="./nav.png" alt="Navigation data" className="h-full object-contain" />
        </div>
      </div>
    </div>
  )
}

export default Newnav