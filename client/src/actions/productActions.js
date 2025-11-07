import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for API requests
// This allows us to easily switch between development and production environments
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// ACTION TYPES
// These are defined in constants/productConstants.js
// We import them here to make the code more readable

// ACTION CREATORS
// These functions create actions that will be dispatched to the Redux store

// Fetch list of products
// This function gets all products from the backend
export const listProducts = (keyword = '', pageNumber = '') => async (dispatch) => {
  try {
    // Dispatch request action to show loading state
    dispatch({ type: 'PRODUCT_LIST_REQUEST' });

    // Make API call to get products
    const { data } = await axios.get(
      `${API_BASE_URL}/products?keyword=${keyword}&pageNumber=${pageNumber}`
    );

    // Dispatch success action with the received data
    dispatch({
      type: 'PRODUCT_LIST_SUCCESS',
      payload: data
    });
  } catch (error) {
    // Dispatch fail action with error message
    dispatch({
      type: 'PRODUCT_LIST_FAIL',
      payload:
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to fetch products'
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Failed to fetch products. Please try again.'
    );
  }
};

// Fetch details of a single product
// This function gets details for one specific product by ID
export const listProductDetails = (id) => async (dispatch) => {
  try {
    // Dispatch request action to show loading state
    dispatch({ type: 'PRODUCT_DETAILS_REQUEST' });

    // Validate that we have a product ID
    if (!id) {
      throw new Error('Product ID is required');
    }

    // Make API call to get product details
    const { data } = await axios.get(`${API_BASE_URL}/products/${id}`);

    // Dispatch success action with the received data
    dispatch({
      type: 'PRODUCT_DETAILS_SUCCESS',
      payload: data
    });
  } catch (error) {
    // Dispatch fail action with error message
    dispatch({
      type: 'PRODUCT_DETAILS_FAIL',
      payload:
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to fetch product details'
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Failed to fetch product details. Please try again.'
    );
  }
};

// Create a product review
// This function allows users to submit reviews for products
export const createProductReview = (productId, review) => async (dispatch, getState) => {
  try {
    // Dispatch request action to show loading state
    dispatch({ type: 'PRODUCT_CREATE_REVIEW_REQUEST' });

    // Get user info from Redux store
    const { userLogin: { userInfo } } = getState();

    // Check if user is logged in
    if (!userInfo) {
      throw new Error('You must be logged in to submit a review');
    }

    // Set up request headers with authentication token
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Make API call to create review
    await axios.post(`${API_BASE_URL}/products/${productId}/reviews`, review, config);

    // Dispatch success action
    dispatch({ type: 'PRODUCT_CREATE_REVIEW_SUCCESS' });
    
    // Show success toast notification
    toast.success('Review submitted successfully!');
  } catch (error) {
    // Dispatch fail action with error message
    dispatch({
      type: 'PRODUCT_CREATE_REVIEW_FAIL',
      payload:
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to create review'
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Failed to submit review. Please try again.'
    );
  }
};

// Update an existing product
// This function allows admins to update product information
export const updateProduct = (product) => async (dispatch, getState) => {
  try {
    // Dispatch request action to show loading state
    dispatch({ type: 'PRODUCT_UPDATE_REQUEST' });

    // Get user info from Redux store
    const { userLogin: { userInfo } } = getState();

    // Check if user is logged in
    if (!userInfo) {
      throw new Error('You must be logged in to update a product');
    }

    // Set up request headers with authentication token
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Validate product data
    if (!product || !product._id) {
      throw new Error('Invalid product data');
    }

    // Make API call to update product
    const { data } = await axios.put(
      `${API_BASE_URL}/products/${product._id}`,
      product,
      config
    );

    // Dispatch success action with updated product data
    dispatch({
      type: 'PRODUCT_UPDATE_SUCCESS',
      payload: data
    });
    
    // Show success toast notification
    toast.success('Product updated successfully!');
  } catch (error) {
    // Dispatch fail action with error message
    dispatch({
      type: 'PRODUCT_UPDATE_FAIL',
      payload:
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to update product'
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Failed to update product. Please try again.'
    );
  }
};

// Create a new product
// This function allows admins to add new products
export const createProduct = (product) => async (dispatch, getState) => {
  try {
    // Dispatch request action to show loading state
    dispatch({ type: 'PRODUCT_CREATE_REQUEST' });

    // Get user info from Redux store
    const { userLogin: { userInfo } } = getState();

    // Check if user is logged in
    if (!userInfo) {
      throw new Error('You must be logged in to create a product');
    }

    // Set up request headers with authentication token
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Make API call to create product
    const { data } = await axios.post(`${API_BASE_URL}/products`, product, config);

    // Dispatch success action with new product data
    dispatch({
      type: 'PRODUCT_CREATE_SUCCESS',
      payload: data
    });
    
    // Show success toast notification
    toast.success('Product created successfully!');
  } catch (error) {
    // Dispatch fail action with error message
    dispatch({
      type: 'PRODUCT_CREATE_FAIL',
      payload:
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to create product'
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Failed to create product. Please try again.'
    );
  }
};

// Delete a product
// This function allows admins to remove products
export const deleteProduct = (id) => async (dispatch, getState) => {
  try {
    // Dispatch request action to show loading state
    dispatch({ type: 'PRODUCT_DELETE_REQUEST' });

    // Get user info from Redux store
    const { userLogin: { userInfo } } = getState();

    // Check if user is logged in
    if (!userInfo) {
      throw new Error('You must be logged in to delete a product');
    }

    // Set up request headers with authentication token
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Validate product ID
    if (!id) {
      throw new Error('Product ID is required');
    }

    // Make API call to delete product
    await axios.delete(`${API_BASE_URL}/products/${id}`, config);

    // Dispatch success action
    dispatch({ type: 'PRODUCT_DELETE_SUCCESS' });
    
    // Show success toast notification
    toast.success('Product deleted successfully!');
  } catch (error) {
    // Dispatch fail action with error message
    dispatch({
      type: 'PRODUCT_DELETE_FAIL',
      payload:
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to delete product'
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Failed to delete product. Please try again.'
    );
  }
};