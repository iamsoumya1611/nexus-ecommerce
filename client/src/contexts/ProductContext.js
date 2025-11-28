import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Initial states
const initialProductListState = {
  products: [],
  loading: false,
  error: null,
  pages: 1,
  page: 1
};

const initialProductDetailsState = {
  product: { reviews: [] },
  loading: false,
  error: null
};

const initialProductCreateReviewState = {
  loading: false,
  success: false,
  error: null
};

const initialProductUpdateState = {
  product: {},
  loading: false,
  success: false,
  error: null
};

const initialProductCreateState = {
  product: {},
  loading: false,
  success: false,
  error: null
};

const initialProductDeleteState = {
  loading: false,
  success: false,
  error: null
};

// Product reducer
const productReducer = (state, action) => {
  switch (action.type) {
    // Product list actions
    case 'PRODUCT_LIST_REQUEST':
      return {
        ...state,
        list: {
          ...state.list,
          loading: true,
          error: null
        }
      };
    
    case 'PRODUCT_LIST_SUCCESS':
      return {
        ...state,
        list: {
          ...state.list,
          loading: false,
          products: action.payload.products,
          pages: action.payload.pages,
          page: action.payload.page
        }
      };
    
    case 'PRODUCT_LIST_FAIL':
      return {
        ...state,
        list: {
          ...state.list,
          loading: false,
          error: action.payload
        }
      };
    
    // Product details actions
    case 'PRODUCT_DETAILS_REQUEST':
      return {
        ...state,
        details: {
          ...state.details,
          loading: true,
          error: null
        }
      };
    
    case 'PRODUCT_DETAILS_SUCCESS':
      return {
        ...state,
        details: {
          ...state.details,
          loading: false,
          product: action.payload
        }
      };
    
    case 'PRODUCT_DETAILS_FAIL':
      return {
        ...state,
        details: {
          ...state.details,
          loading: false,
          error: action.payload
        }
      };
    
    // Product create review actions
    case 'PRODUCT_CREATE_REVIEW_REQUEST':
      return {
        ...state,
        createReview: {
          ...state.createReview,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'PRODUCT_CREATE_REVIEW_SUCCESS':
      return {
        ...state,
        createReview: {
          ...state.createReview,
          loading: false,
          success: true
        }
      };
    
    case 'PRODUCT_CREATE_REVIEW_FAIL':
      return {
        ...state,
        createReview: {
          ...state.createReview,
          loading: false,
          error: action.payload
        }
      };
    
    case 'PRODUCT_CREATE_REVIEW_RESET':
      return {
        ...state,
        createReview: initialProductCreateReviewState
      };
    
    // Product update actions
    case 'PRODUCT_UPDATE_REQUEST':
      return {
        ...state,
        update: {
          ...state.update,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'PRODUCT_UPDATE_SUCCESS':
      return {
        ...state,
        update: {
          ...state.update,
          loading: false,
          success: true,
          product: action.payload
        }
      };
    
    case 'PRODUCT_UPDATE_FAIL':
      return {
        ...state,
        update: {
          ...state.update,
          loading: false,
          error: action.payload
        }
      };
    
    case 'PRODUCT_UPDATE_RESET':
      return {
        ...state,
        update: initialProductUpdateState
      };
    
    // Product create actions
    case 'PRODUCT_CREATE_REQUEST':
      return {
        ...state,
        create: {
          ...state.create,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'PRODUCT_CREATE_SUCCESS':
      return {
        ...state,
        create: {
          ...state.create,
          loading: false,
          success: true,
          product: action.payload
        }
      };
    
    case 'PRODUCT_CREATE_FAIL':
      return {
        ...state,
        create: {
          ...state.create,
          loading: false,
          error: action.payload
        }
      };
    
    case 'PRODUCT_CREATE_RESET':
      return {
        ...state,
        create: initialProductCreateState
      };
    
    // Product delete actions
    case 'PRODUCT_DELETE_REQUEST':
      return {
        ...state,
        delete: {
          ...state.delete,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'PRODUCT_DELETE_SUCCESS':
      return {
        ...state,
        delete: {
          ...state.delete,
          loading: false,
          success: true
        }
      };
    
    case 'PRODUCT_DELETE_FAIL':
      return {
        ...state,
        delete: {
          ...state.delete,
          loading: false,
          error: action.payload
        }
      };
    
    default:
      return state;
  }
};

// Create context
const ProductContext = createContext();

// Provider component
export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, {
    list: initialProductListState,
    details: initialProductDetailsState,
    createReview: initialProductCreateReviewState,
    update: initialProductUpdateState,
    create: initialProductCreateState,
    delete: initialProductDeleteState
  });
  
  return (
    <ProductContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use product context
export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

// Action creators
export const productActions = {
  // List products
  listProducts: (keyword = '', pageNumber = '') => async (dispatch) => {
    try {
      dispatch({ type: 'PRODUCT_LIST_REQUEST' });

      // Construct the URL correctly based on environment
      let finalUrl;
      if (process.env.NODE_ENV === 'development') {
        // In development, use relative paths for proxy
        finalUrl = `/products?keyword=${keyword}&pageNumber=${pageNumber}`;
      } else {
        // In production, use full URL
        finalUrl = `${API_BASE_URL.replace(/\/$/, '')}/products?keyword=${keyword}&pageNumber=${pageNumber}`;
      }

      const { data } = await axios.get(finalUrl);

      dispatch({
        type: 'PRODUCT_LIST_SUCCESS',
        payload: data
      });
    } catch (error) {
      dispatch({
        type: 'PRODUCT_LIST_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      // Show error toast only for unexpected errors
      if (!error.response || error.response.status !== 404) {
        toast.error(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to fetch products'
        );
      }
    }
  },

  // Get product details
  listProductDetails: (id) => async (dispatch) => {
    try {
      dispatch({ type: 'PRODUCT_DETAILS_REQUEST' });

      // Construct the URL correctly based on environment
      let baseUrl = API_BASE_URL;
      if (process.env.NODE_ENV === 'development') {
        baseUrl = '';
      }

      // Ensure we're using HTTPS in production
      let finalUrl = `${baseUrl}/products/${id}`;
      if (process.env.NODE_ENV === 'production' && finalUrl.startsWith('http://')) {
        finalUrl = finalUrl.replace('http://', 'https://');
      }

      const { data } = await axios.get(finalUrl);

      dispatch({
        type: 'PRODUCT_DETAILS_SUCCESS',
        payload: data
      });
    } catch (error) {
      dispatch({
        type: 'PRODUCT_DETAILS_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      // Show error toast only for unexpected errors (not 404)
      if (!error.response || error.response.status !== 404) {
        toast.error(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to fetch product details'
        );
      }
    }
  },

  // Create product review
  createProductReview: (productId, review) => async (dispatch) => {
    try {
      dispatch({ type: 'PRODUCT_CREATE_REVIEW_REQUEST' });

      // Get user info from localStorage
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
      if (process.env.NODE_ENV === 'development') {
        baseUrl = '';
      }

      // Ensure we're using HTTPS in production
      let finalUrl = `${baseUrl}/products/${productId}/reviews`;
      if (process.env.NODE_ENV === 'production' && finalUrl.startsWith('http://')) {
        finalUrl = finalUrl.replace('http://', 'https://');
      }

      const { data } = await axios.post(finalUrl, review, config);

      dispatch({
        type: 'PRODUCT_CREATE_REVIEW_SUCCESS',
        payload: data
      });

      toast.success('Review submitted successfully!');
    } catch (error) {
      dispatch({
        type: 'PRODUCT_CREATE_REVIEW_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to submit review'
      );
    }
  },

  // Delete product
  deleteProduct: (id) => async (dispatch) => {
    try {
      dispatch({ type: 'PRODUCT_DELETE_REQUEST' });

      // Get user info from localStorage
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
      if (process.env.NODE_ENV === 'development') {
        baseUrl = '';
      }

      // Ensure we're using HTTPS in production
      let finalUrl = `${baseUrl}/products/${id}`;
      if (process.env.NODE_ENV === 'production' && finalUrl.startsWith('http://')) {
        finalUrl = finalUrl.replace('http://', 'https://');
      }

      await axios.delete(finalUrl, config);

      dispatch({
        type: 'PRODUCT_DELETE_SUCCESS'
      });

      toast.success('Product deleted successfully!');
    } catch (error) {
      dispatch({
        type: 'PRODUCT_DELETE_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to delete product'
      );
    }
  },

  // Create product
  createProduct: (product) => async (dispatch) => {
    try {
      dispatch({ type: 'PRODUCT_CREATE_REQUEST' });

      // Get user info from localStorage
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
      if (process.env.NODE_ENV === 'development') {
        baseUrl = '';
      }

      // Ensure we're using HTTPS in production
      let finalUrl = `${baseUrl}/products`;
      if (process.env.NODE_ENV === 'production' && finalUrl.startsWith('http://')) {
        finalUrl = finalUrl.replace('http://', 'https://');
      }

      const { data } = await axios.post(finalUrl, product, config);

      dispatch({
        type: 'PRODUCT_CREATE_SUCCESS',
        payload: data
      });

      toast.success('Product created successfully!');
    } catch (error) {
      dispatch({
        type: 'PRODUCT_CREATE_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to create product'
      );
    }
  },

  // Update product
  updateProduct: (product) => async (dispatch) => {
    try {
      dispatch({ type: 'PRODUCT_UPDATE_REQUEST' });

      // Get user info from localStorage
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
      if (process.env.NODE_ENV === 'development') {
        baseUrl = '';
      }

      // Ensure we're using HTTPS in production
      let finalUrl = `${baseUrl}/products/${product._id}`;
      if (process.env.NODE_ENV === 'production' && finalUrl.startsWith('http://')) {
        finalUrl = finalUrl.replace('http://', 'https://');
      }

      const { data } = await axios.put(finalUrl, product, config);

      dispatch({
        type: 'PRODUCT_UPDATE_SUCCESS',
        payload: data
      });

      toast.success('Product updated successfully!');
    } catch (error) {
      dispatch({
        type: 'PRODUCT_UPDATE_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to update product'
      );
    }
  },

  // Reset product create state
  resetProductCreate: () => (dispatch) => {
    dispatch({ type: 'PRODUCT_CREATE_RESET' });
  },

  // Reset product update state
  resetProductUpdate: () => (dispatch) => {
    dispatch({ type: 'PRODUCT_UPDATE_RESET' });
  },

  // Reset product create review state
  resetProductCreateReview: () => (dispatch) => {
    dispatch({ type: 'PRODUCT_CREATE_REVIEW_RESET' });
  }
};