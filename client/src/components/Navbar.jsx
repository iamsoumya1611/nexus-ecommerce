import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../actions/userActions';
import SearchIcon from '@mui/icons-material/Search';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Style for the shopping cart badge
const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#4F46E5',
  },
}));

// Navbar Component
// This component displays the navigation bar at the top of the page
const Navbar = () => {
  // Redux dispatch function
  const dispatch = useDispatch();
  
  // State variables for controlling menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);        // Mobile menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // User dropdown menu
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false); // Admin dropdown menu
  const [searchKeyword, setSearchKeyword] = useState('');     // Search input value

  // Get user login state from Redux store
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Get cart items from Redux store
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  // Calculate total number of items in cart
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // Handle user logout
  const logoutHandler = () => {
    dispatch(logout());
    setIsUserMenuOpen(false); // Close user menu after logout
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Redirect to search results page if search keyword is not empty
    if (searchKeyword.trim()) {
      window.location.href = `/search/${searchKeyword}`;
    }
  };

  return (
    // Main header container
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        {/* Main navigation bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and site name */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-700 flex items-center">
              <img src="./Nexus_logo.png" alt="" className='w-52' />
            </Link>
          </div>

          {/* Search bar - hidden on mobile, visible on medium screens and larger */}
          <div className="hidden md:block flex-1 px-8">
            <form onSubmit={handleSearch} className="flex justify-center max-w-2xl mx-auto border border-indigo-700 rounded-[3px] overflow-hidden">
              {/* Search input field */}
              <input 
                className='outline-none w-full h-10 px-3 border-0 focus:ring-0' 
                type="text" 
                name="search" 
                id="search-input" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search products..."
              />

              {/* Search button */}
              <button 
                type="submit"
                className="bg-primary-700 text-white h-10 w-10 flex justify-center items-center cursor-pointer"
              >
                <SearchIcon id="search-icon" />
              </button>
            </form>
          </div>

          {/* User navigation - hidden on mobile, visible on medium screens and larger */}
          <div className="hidden md:block">
            {userInfo ? (
              // If user is logged in, show user-specific navigation
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative flex space-x-2">
                  {/* Shopping cart link with item count badge */}
                  <Link to="/cart" className="flex items-center cursor-pointer mr-4">
                    <StyledBadge badgeContent={cartItemCount} color="secondary">
                      <ShoppingCartIcon />
                    </StyledBadge>
                    <p className='text-[#4F46E5] ml-1'>Cart</p>
                  </Link>

                  {/* User profile dropdown trigger */}
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-sm rounded-full focus:outline-none"
                  >
                    <span className="text-primary-700 mr-1">
                      <i className="fas fa-user-circle text-xl"></i>
                    </span>
                    <span className="text-primary-700 text-sm font-medium">{userInfo.name}</span>
                    <i className={`fas fa-chevron-down text-xs ml-1 text-primary-700 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
                  </button>

                  {/* User dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute top-5 right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1" role="none">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <i className="fas fa-user mr-2"></i>
                          Profile
                        </Link>
                        <button
                          onClick={logoutHandler}
                          className="block w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-100"
                        >
                          <i className="fas fa-sign-out-alt mr-2"></i>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin menu - only shown if user is an admin */}
                {userInfo.isAdmin && (
                  <div className="relative ml-3">
                    {/* Admin menu trigger */}
                    <button
                      onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                      className="flex items-center text-sm rounded-full focus:outline-none"
                    >
                      <span className="text-primary-700 ml-3">
                        <i className="fas fa-cog"></i>
                      </span>
                      <i className={`fas fa-chevron-down text-xs ml-1 text-primary-700 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`}></i>
                    </button>

                    {/* Admin dropdown menu */}
                    {isAdminMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="py-1" role="none">
                          <Link
                            to="/admin/userlist"
                            className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-100"
                            onClick={() => setIsAdminMenuOpen(false)}
                          >
                            <i className="fas fa-users mr-2"></i>
                            Users
                          </Link>
                          <Link
                            to="/admin/productlist"
                            className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-100"
                            onClick={() => setIsAdminMenuOpen(false)}
                          >
                            <i className="fas fa-box-open mr-2"></i>
                            Products
                          </Link>
                          <Link
                            to="/admin/orderlist"
                            className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-100"
                            onClick={() => setIsAdminMenuOpen(false)}
                          >
                            <i className="fas fa-shopping-bag mr-2"></i>
                            Orders
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // If user is not logged in, show login link
              <Link
                to="/login"
                className="btn btn-outline text-sm"
              >
                <i className="fas fa-sign-in-alt mr-1"></i>
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button - visible only on mobile */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-700 hover:text-primary-900 hover:bg-primary-100 focus:outline-none"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - shown when isMenuOpen is true */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile search form */}
            <form onSubmit={handleSearch} className="flex items-center px-3 py-2">
              <input 
                className='w-full h-10 px-3 border border-indigo-700 rounded-l-[3px] focus:outline-none focus:ring-0' 
                type="text" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search products..."
              />
              <button 
                type="submit"
                className="bg-primary-700 text-white h-10 w-10 flex justify-center items-center cursor-pointer rounded-r-[3px]"
              >
                <SearchIcon />
              </button>
            </form>
            
            {/* Mobile navigation links */}
            <Link
              to="/"
              className="text-primary-700 hover:text-primary-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-primary-700 hover:text-primary-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/cart"
              className="text-primary-700 hover:text-primary-900 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="fas fa-shopping-cart mr-1"></i>
              Cart
              {cartItemCount > 0 && (
                <span className="ml-1 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 inline-flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {/* Mobile user navigation */}
            {userInfo ? (
              // If user is logged in
              <>
                <Link
                  to="/profile"
                  className="text-primary-700 hover:text-primary-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user mr-2"></i>
                  Profile
                </Link>
                <button
                  onClick={logoutHandler}
                  className="text-primary-700 hover:text-primary-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </button>
                
                {/* Admin links - only shown if user is an admin */}
                {userInfo.isAdmin && (
                  <>
                    <Link
                      to="/admin/userlist"
                      className="text-primary-700 hover:text-primary-900 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="fas fa-users mr-2"></i>
                      Users
                    </Link>
                    <Link
                      to="/admin/productlist"
                      className="text-primary-700 hover:text-primary-900 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="fas fa-box-open mr-2"></i>
                      Products
                    </Link>
                    <Link
                      to="/admin/orderlist"
                      className="text-primary-700 hover:text-primary-900 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="fas fa-shopping-bag mr-2"></i>
                      Orders
                    </Link>
                  </>
                )}
              </>
            ) : (
              // If user is not logged in
              <Link
                to="/login"
                className="text-primary-700 hover:text-primary-900 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-sign-in-alt mr-1"></i>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;