import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../actions/userActions';
import SearchIcon from '@mui/icons-material/Search';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Avatar from '@mui/material/Avatar';

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#4F46E5',
  },
}));


const Navbar = () => {
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  // Calculate total cart items
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const logoutHandler = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    if (searchKeyword.trim()) {
      window.location.href = `/search/${searchKeyword}`;
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-700 flex items-center">
              <img src="./Nexus_logo.png" alt="" className='w-52' />
            </Link>
          </div>

          <div className="hidden md:block flex-1 px-8">
            <form onSubmit={handleSearch} className="flex justify-center max-w-2xl mx-auto border border-indigo-700 rounded-[3px] overflow-hidden">
              <input 
                className='outline-none w-full h-10 px-3 border-0 focus:ring-0' 
                type="text" 
                name="search" 
                id="search-input" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search products..."
              />

              <button 
                type="submit"
                className="bg-primary-700 text-white h-10 w-10 flex justify-center items-center cursor-pointer"
              >
                <SearchIcon id="search-icon" />
              </button>
            </form>
          </div>

          <div className="hidden md:block">
            {userInfo ? (
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative flex space-x-2">
                  <Link to="/cart" className="flex items-center cursor-pointer mr-4">
                    <StyledBadge badgeContent={cartItemCount} color="secondary">
                      <ShoppingCartIcon />
                    </StyledBadge>
                    <p className='text-[#4F46E5] ml-1'>Cart</p>
                  </Link>

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

                {userInfo.isAdmin && (
                  <div className="relative ml-3">
                    <button
                      onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                      className="flex items-center text-sm rounded-full focus:outline-none"
                    >
                      <span className="text-primary-700 ml-3">
                        <i className="fas fa-cog"></i>
                      </span>
                      <i className={`fas fa-chevron-down text-xs ml-1 text-primary-700 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`}></i>
                    </button>

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
              <Link
                to="/login"
                className="btn btn-outline text-sm"
              >
                <i className="fas fa-sign-in-alt mr-1"></i>
                Login
              </Link>
            )}
          </div>

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

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
            {userInfo ? (
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