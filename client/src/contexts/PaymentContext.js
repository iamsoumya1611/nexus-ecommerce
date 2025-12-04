import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Initial states
const initialPaymentProcessState = {
  loading: false,
  success: false,
  error: null,
  order: null
};

const initialPaymentVerifyState = {
  loading: false,
  success: false,
  error: null
};

// Payment reducer
const paymentReducer = (state, action) => {
  switch (action.type) {
    // Payment process actions
    case 'PAYMENT_PROCESS_REQUEST':
      return {
        ...state,
        process: {
          ...state.process,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'PAYMENT_PROCESS_SUCCESS':
      return {
        ...state,
        process: {
          ...state.process,
          loading: false,
          success: true,
          order: action.payload
        }
      };
    
    case 'PAYMENT_PROCESS_FAIL':
      return {
        ...state,
        process: {
          ...state.process,
          loading: false,
          error: action.payload
        }
      };
    
    case 'PAYMENT_PROCESS_RESET':
      return {
        ...state,
        process: initialPaymentProcessState
      };
    
    // Payment verify actions
    case 'PAYMENT_VERIFY_REQUEST':
      return {
        ...state,
        verify: {
          ...state.verify,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'PAYMENT_VERIFY_SUCCESS':
      return {
        ...state,
        verify: {
          ...state.verify,
          loading: false,
          success: true
        }
      };
    
    case 'PAYMENT_VERIFY_FAIL':
      return {
        ...state,
        verify: {
          ...state.verify,
          loading: false,
          error: action.payload
        }
      };
    
    case 'PAYMENT_VERIFY_RESET':
      return {
        ...state,
        verify: initialPaymentVerifyState
      };
    
    default:
      return state;
  }
};

// Create context
const PaymentContext = createContext();

// Provider component
export const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, {
    process: initialPaymentProcessState,
    verify: initialPaymentVerifyState
  });
  
  return (
    <PaymentContext.Provider value={{ state, dispatch }}>
      {children}
    </PaymentContext.Provider>
  );
};

// Custom hook to use payment context
export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

// Action creators
export const paymentActions = {
  // Process payment (create Razorpay order)
  processPayment: (paymentData) => async (dispatch) => {
    try {
      dispatch({ type: 'PAYMENT_PROCESS_REQUEST' });

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

      // Updated endpoint to match backend
      const { data } = await axios.post(`${baseUrl}/payment/order`, paymentData, config);

      dispatch({
        type: 'PAYMENT_PROCESS_SUCCESS',
        payload: data
      });

      toast.success('Payment order created successfully!');
      return data;
    } catch (error) {
      dispatch({
        type: 'PAYMENT_PROCESS_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to create payment order'
      );
      
      throw error;
    }
  },

  // Verify payment
  verifyPayment: (verificationData) => async (dispatch) => {
    try {
      dispatch({ type: 'PAYMENT_VERIFY_REQUEST' });

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

      // Updated endpoint to match backend
      const { data } = await axios.post(`${baseUrl}/payment/verify`, verificationData, config);

      dispatch({
        type: 'PAYMENT_VERIFY_SUCCESS',
        payload: data
      });

      toast.success('Payment verified successfully!');
      return data;
    } catch (error) {
      dispatch({
        type: 'PAYMENT_VERIFY_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to verify payment'
      );
      
      throw error;
    }
  },

  // Get payment details
  getPaymentDetails: (paymentId) => async (dispatch) => {
    try {
      dispatch({ type: 'PAYMENT_PROCESS_REQUEST' });

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

      // Updated endpoint to match backend
      const { data } = await axios.get(`${baseUrl}/payment/${paymentId}`, config);

      dispatch({
        type: 'PAYMENT_PROCESS_SUCCESS',
        payload: data
      });

      return data;
    } catch (error) {
      dispatch({
        type: 'PAYMENT_PROCESS_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      throw error;
    }
  },

  // Reset payment process state
  resetPaymentProcess: () => (dispatch) => {
    dispatch({ type: 'PAYMENT_PROCESS_RESET' });
  },

  // Reset payment verify state
  resetPaymentVerify: () => (dispatch) => {
    dispatch({ type: 'PAYMENT_VERIFY_RESET' });
  }
};