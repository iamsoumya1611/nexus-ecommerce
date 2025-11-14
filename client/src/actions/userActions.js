import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Configure axios defaults
axios.defaults.withCredentials = true;

// User login function
export const login = (email, password) => async (dispatch) => {
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

    const { data } = await axios.post(
      `${baseUrl}/users/login`,
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
};

// User logout function
export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingAddress');
  localStorage.removeItem('paymentMethod');
  
  dispatch({ type: 'USER_LOGOUT' });
  dispatch({ type: 'USER_DETAILS_RESET' });
  dispatch({ type: 'ORDER_LIST_MY_RESET' });
  dispatch({ type: 'CART_CLEAR_ITEMS' });
  
  toast.success('You have been logged out successfully.');
};

// User registration function
export const register = (name, email, password) => async (dispatch) => {
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

    const { data } = await axios.post(
      `${baseUrl}/users/register`,
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
};

// Get user profile details
export const getUserDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: 'USER_DETAILS_REQUEST' });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      },
      withCredentials: true
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.get(`${baseUrl}/users/profile`, config);

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
};

// Update user profile
export const updateUserProfile = (user) => async (dispatch, getState) => {
  try {
    dispatch({ type: 'USER_UPDATE_PROFILE_REQUEST' });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      },
      withCredentials: true
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.put(`${baseUrl}/users/profile`, user, config);

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
};