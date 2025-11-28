import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Set base URL for API requests - ensure HTTPS in production
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user info from localStorage on initial load
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo));
      } catch (err) {
        console.error('Failed to parse user info from localStorage', err);
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      // Use proxy path in development, full URL in production
      const finalUrl = process.env.NODE_ENV === 'development' 
        ? '/users/login' 
        : `${API_BASE_URL.replace(/\/$/, '')}/users/login`;

      const { data } = await axios.post(
        finalUrl,
        { email, password },
        config
      );

      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Login successful!');
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      // Use proxy path in development, full URL in production
      const finalUrl = process.env.NODE_ENV === 'development' 
        ? '/users/register' 
        : `${API_BASE_URL.replace(/\/$/, '')}/users/register`;

      const { data } = await axios.post(
        finalUrl,
        { name, email, password },
        config
      );

      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Registration successful! Welcome to our platform.');
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    toast.success('You have been logged out successfully.');
  };

  // Get user profile
  const getUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`
        },
        withCredentials: true
      };

      // Use proxy path in development, full URL in production
      const finalUrl = process.env.NODE_ENV === 'development' 
        ? '/users/profile' 
        : `${API_BASE_URL.replace(/\/$/, '')}/users/profile`;

      const { data } = await axios.get(finalUrl, config);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user details.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`
        },
        withCredentials: true
      };

      // Use proxy path in development, full URL in production
      const finalUrl = process.env.NODE_ENV === 'development' 
        ? '/users/profile' 
        : `${API_BASE_URL.replace(/\/$/, '')}/users/profile`;

      const { data } = await axios.put(finalUrl, userData, config);

      // Update user info with new data
      setUserInfo(prev => ({
        ...prev,
        ...data
      }));
      
      localStorage.setItem('userInfo', JSON.stringify({
        ...userInfo,
        ...data
      }));

      toast.success('Profile updated successfully!');
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  // Get all users (admin only)
  const getAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`
        },
        withCredentials: true
      };

      // Use proxy path in development, full URL in production
      const finalUrl = process.env.NODE_ENV === 'development' 
        ? '/users' 
        : `${API_BASE_URL.replace(/\/$/, '')}/users`;

      const { data } = await axios.get(finalUrl, config);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get user by ID (admin only)
  const getUserById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`
        },
        withCredentials: true
      };

      // Use proxy path in development, full URL in production
      const finalUrl = process.env.NODE_ENV === 'development' 
        ? `/users/${id}` 
        : `${API_BASE_URL.replace(/\/$/, '')}/users/${id}`;

      const { data } = await axios.get(finalUrl, config);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update user (admin only)
  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`
        },
        withCredentials: true
      };

      // Use proxy path in development, full URL in production
      const finalUrl = process.env.NODE_ENV === 'development' 
        ? `/users/${userData._id}` 
        : `${API_BASE_URL.replace(/\/$/, '')}/users/${userData._id}`;

      const { data } = await axios.put(finalUrl, userData, config);
      toast.success('User updated successfully!');
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update user.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete user (admin only)
  const deleteUser = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`
        },
        withCredentials: true
      };

      // Use proxy path in development, full URL in production
      const finalUrl = process.env.NODE_ENV === 'development' 
        ? `/users/${id}` 
        : `${API_BASE_URL.replace(/\/$/, '')}/users/${id}`;

      await axios.delete(finalUrl, config);
      toast.success('User deleted successfully!');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete user.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{
      userInfo,
      loading,
      error,
      login,
      register,
      logout,
      getUserProfile,
      updateUserProfile,
      getAllUsers,
      getUserById,
      updateUser,
      deleteUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};