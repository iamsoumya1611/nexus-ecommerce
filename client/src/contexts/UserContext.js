import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Set base URL for API requests - ensure HTTPS in production
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Ensure HTTPS is used in production
if (process.env.NODE_ENV === 'production' && API_BASE_URL.startsWith('http://')) {
  console.warn('API URL should use HTTPS in production');
}

// Initial states
const initialUserLoginState = { 
  userInfo: null,
  loading: false,
  error: null
};

const initialUserRegisterState = { 
  userInfo: null,
  loading: false,
  error: null
};

const initialUserDetailsState = { 
  user: {},
  loading: false,
  error: null
};

const initialUserUpdateProfileState = { 
  loading: false,
  success: false,
  error: null,
  userInfo: null
};

// User reducer
const userReducer = (state, action) => {
  switch (action.type) {
    // Login actions
    case 'USER_LOGIN_REQUEST':
      return { 
        ...state,
        login: {
          ...state.login,
          loading: true,
          error: null
        }
      };
    
    case 'USER_LOGIN_SUCCESS':
      return { 
        ...state,
        login: {
          ...state.login,
          loading: false, 
          userInfo: action.payload 
        }
      };
    
    case 'USER_LOGIN_FAIL':
      return { 
        ...state,
        login: {
          ...state.login,
          loading: false, 
          error: action.payload 
        }
      };
    
    case 'USER_LOGOUT':
      return {
        ...state,
        login: initialUserLoginState,
        details: initialUserDetailsState,
        updateProfile: initialUserUpdateProfileState
      };
    
    // Register actions
    case 'USER_REGISTER_REQUEST':
      return { 
        ...state,
        register: {
          ...state.register,
          loading: true,
          error: null
        }
      };
    
    case 'USER_REGISTER_SUCCESS':
      return { 
        ...state,
        register: {
          ...state.register,
          loading: false, 
          userInfo: action.payload 
        }
      };
    
    case 'USER_REGISTER_FAIL':
      return { 
        ...state,
        register: {
          ...state.register,
          loading: false, 
          error: action.payload 
        }
      };
    
    // User details actions
    case 'USER_DETAILS_REQUEST':
      return { 
        ...state,
        details: {
          ...state.details,
          loading: true,
          error: null
        }
      };
    
    case 'USER_DETAILS_SUCCESS':
      return { 
        ...state,
        details: {
          ...state.details,
          loading: false, 
          user: action.payload 
        }
      };
    
    case 'USER_DETAILS_FAIL':
      return { 
        ...state,
        details: {
          ...state.details,
          loading: false, 
          error: action.payload 
        }
      };
    
    case 'USER_DETAILS_RESET':
      return { 
        ...state,
        details: initialUserDetailsState
      };
    
    // Update profile actions
    case 'USER_UPDATE_PROFILE_REQUEST':
      return { 
        ...state,
        updateProfile: {
          ...state.updateProfile,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'USER_UPDATE_PROFILE_SUCCESS':
      return { 
        ...state,
        updateProfile: {
          ...state.updateProfile,
          loading: false, 
          success: true,
          userInfo: action.payload 
        }
      };
    
    case 'USER_UPDATE_PROFILE_FAIL':
      return { 
        ...state,
        updateProfile: {
          ...state.updateProfile,
          loading: false, 
          error: action.payload 
        }
      };
    
    case 'USER_UPDATE_PROFILE_RESET':
      return { 
        ...state,
        updateProfile: initialUserUpdateProfileState
      };
    
    default:
      return state;
  }
};

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    login: initialUserLoginState,
    register: initialUserRegisterState,
    details: initialUserDetailsState,
    updateProfile: initialUserUpdateProfileState
  });
  
  return (
    <UserContext.Provider value={{ state, dispatch }}>
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

// Action creators
export const userActions = {
  // User login function
  login: (email, password) => async (dispatch) => {
    try {
      dispatch({ type: 'USER_LOGIN_REQUEST' });

      const config = {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      // Construct the URL correctly based on environment
      let baseUrl = API_BASE_URL;
      // In development, we don't need the full URL because of proxy
      if (process.env.NODE_ENV === 'development') {
        baseUrl = '';
      }

      // Ensure we don't have double slashes in the URL and use HTTPS in production
      const loginUrl = baseUrl ? 
        `${baseUrl.replace(/\/$/, '')}/users/login` : 
        '/users/login';
      
      const { data } = await axios.post(
        loginUrl,
        { email, password },
        config
      );

      dispatch({
        type: 'USER_LOGIN_SUCCESS',
        payload: data
      });

      toast.success('Login successful!');
      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
      dispatch({
        type: 'USER_LOGIN_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Login failed. Please try again.'
      );
    }
  },

  // User logout function
  logout: () => (dispatch) => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    
    dispatch({ type: 'USER_LOGOUT' });
    dispatch({ type: 'USER_DETAILS_RESET' });
    // Note: We'll handle clearing orders and cart in their respective contexts
    
    toast.success('You have been logged out successfully.');
  },

  // User registration function
  register: (name, email, password) => async (dispatch) => {
    try {
      dispatch({ type: 'USER_REGISTER_REQUEST' });

      const config = {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      // Construct the URL correctly based on environment
      let baseUrl = API_BASE_URL;
      // In development, we don't need the full URL because of proxy
      if (process.env.NODE_ENV === 'development') {
        baseUrl = '';
      }

      // Ensure we don't have double slashes in the URL and use HTTPS in production
      const registerUrl = baseUrl ? 
        `${baseUrl.replace(/\/$/, '')}/users/register` : 
        '/users/register';
      
      const { data } = await axios.post(
        registerUrl,
        { name, email, password },
        config
      );

      dispatch({
        type: 'USER_REGISTER_SUCCESS',
        payload: data
      });

      // Also log the user in automatically after registration
      dispatch({
        type: 'USER_LOGIN_SUCCESS',
        payload: data
      });

      toast.success('Registration successful! Welcome to our platform.');
      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
      dispatch({
        type: 'USER_REGISTER_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Registration failed. Please try again.'
      );
    }
  },

  // Get user profile details
  getUserDetails: (id) => async (dispatch, getState) => {
    try {
      dispatch({ type: 'USER_DETAILS_REQUEST' });

      // In a real implementation, you would get the token from context/state
      // For now, we'll get it from localStorage
      const userInfoFromStorage = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfoFromStorage?.token}`
        },
        withCredentials: true
      };

      // Construct the URL correctly based on environment
      let baseUrl = API_BASE_URL;
      // In development, we don't need the full URL because of proxy
      if (process.env.NODE_ENV === 'development') {
        baseUrl = '';
      }

      // Ensure we don't have double slashes in the URL and use HTTPS in production
      const profileUrl = baseUrl ? 
        `${baseUrl.replace(/\/$/, '')}/users/profile` : 
        '/users/profile';
      
      const { data } = await axios.get(profileUrl, config);

      dispatch({
        type: 'USER_DETAILS_SUCCESS',
        payload: data
      });
    } catch (error) {
      dispatch({
        type: 'USER_DETAILS_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to fetch user details.'
      );
    }
  },

  // Update user profile
  updateUserProfile: (user) => async (dispatch) => {
    try {
      dispatch({ type: 'USER_UPDATE_PROFILE_REQUEST' });

      // In a real implementation, you would get the token from context/state
      // For now, we'll get it from localStorage
      const userInfoFromStorage = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfoFromStorage?.token}`
        },
        withCredentials: true
      };

      // Construct the URL correctly based on environment
      let baseUrl = API_BASE_URL;
      // In development, we don't need the full URL because of proxy
      if (process.env.NODE_ENV === 'development') {
        baseUrl = '';
      }

      // Ensure we don't have double slashes in the URL and use HTTPS in production
      const profileUrl = baseUrl ? 
        `${baseUrl.replace(/\/$/, '')}/users/profile` : 
        '/users/profile';
      
      const { data } = await axios.put(profileUrl, user, config);

      dispatch({
        type: 'USER_UPDATE_PROFILE_SUCCESS',
        payload: data
      });

      // Also update the login state with new user data
      dispatch({
        type: 'USER_LOGIN_SUCCESS',
        payload: data
      });

      toast.success('Profile updated successfully!');
      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
      dispatch({
        type: 'USER_UPDATE_PROFILE_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to update profile. Please try again.'
      );
    }
  }
};