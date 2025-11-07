import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for API requests
// This allows us to easily switch between development and production environments
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// ACTION CREATORS
// These functions create actions that will be dispatched to the Redux store

// User login function
// This function handles user authentication
export const login = (email, password) => async (dispatch) => {
  try {
    // Dispatch request action to show loading state
    dispatch({ type: 'USER_LOGIN_REQUEST' });

    // Set up request configuration
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Make API call to authenticate user
    const { data } = await axios.post(
      `${API_BASE_URL}/users/login`,
      { email, password },
      config
    );

    // Dispatch success action with user data
    dispatch({
      type: 'USER_LOGIN_SUCCESS',
      payload: data
    });

    // Show success toast notification
    toast.success('Login successful!');

    // Save user info to localStorage for persistence
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    // Dispatch fail action with error message
    dispatch({
      type: 'USER_LOGIN_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Login failed. Please try again.'
    );
  }
};

// User logout function
// This function clears user data and logs the user out
export const logout = () => (dispatch) => {
  // Remove user data from localStorage
  localStorage.removeItem('userInfo');
  localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingAddress');
  localStorage.removeItem('paymentMethod');
  
  // Dispatch logout actions to reset state
  dispatch({ type: 'USER_LOGOUT' });
  dispatch({ type: 'USER_DETAILS_RESET' });
  dispatch({ type: 'ORDER_LIST_MY_RESET' });
  dispatch({ type: 'CART_CLEAR_ITEMS' });
  
  // Show success toast notification
  toast.success('You have been logged out successfully.');
};

// User registration function
// This function handles new user registration
export const register = (name, email, password) => async (dispatch) => {
  try {
    // Dispatch request action to show loading state
    dispatch({ type: 'USER_REGISTER_REQUEST' });

    // Set up request configuration
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Make API call to register new user
    const { data } = await axios.post(
      `${API_BASE_URL}/users/register`,
      { name, email, password },
      config
    );

    // Dispatch success actions
    dispatch({
      type: 'USER_REGISTER_SUCCESS',
      payload: data
    });

    // Also log the user in automatically after registration
    dispatch({
      type: 'USER_LOGIN_SUCCESS',
      payload: data
    });

    // Show success toast notification
    toast.success('Registration successful! Welcome to our platform.');

    // Save user info to localStorage for persistence
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    // Dispatch fail action with error message
    dispatch({
      type: 'USER_REGISTER_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Registration failed. Please try again.'
    );
  }
};

// Get user profile details
// This function fetches detailed information about a user
export const getUserDetails = (id) => async (dispatch, getState) => {
  try {
    // Dispatch request action to show loading state
    dispatch({ type: 'USER_DETAILS_REQUEST' });

    // Get user info from Redux store
    const { userLogin: { userInfo } } = getState();

    // Set up request configuration with authentication token
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Make API call to get user details
    const { data } = await axios.get(`${API_BASE_URL}/users/profile`, config);

    // Dispatch success action with user data
    dispatch({
      type: 'USER_DETAILS_SUCCESS',
      payload: data
    });
  } catch (error) {
    // Dispatch fail action with error message
    dispatch({
      type: 'USER_DETAILS_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to fetch user details.'
    );
  }
};

// Update user profile
// This function allows users to update their profile information
export const updateUserProfile = (user) => async (dispatch, getState) => {
  try {
    // Dispatch request action to show loading state
    dispatch({ type: 'USER_UPDATE_PROFILE_REQUEST' });

    // Get user info from Redux store
    const { userLogin: { userInfo } } = getState();

    // Set up request configuration with authentication token
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Make API call to update user profile
    const { data } = await axios.put(`${API_BASE_URL}/users/profile`, user, config);

    // Dispatch success actions
    dispatch({
      type: 'USER_UPDATE_PROFILE_SUCCESS',
      payload: data
    });

    // Also update the login state with new user data
    dispatch({
      type: 'USER_LOGIN_SUCCESS',
      payload: data
    });

    // Show success toast notification
    toast.success('Profile updated successfully!');

    // Update user info in localStorage for persistence
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    // Dispatch fail action with error message
    dispatch({
      type: 'USER_UPDATE_PROFILE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to update profile. Please try again.'
    );
  }
};