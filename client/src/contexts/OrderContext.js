import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Initial states
const initialOrderCreateState = {
  order: null,
  loading: false,
  success: false,
  error: null
};

const initialOrderDetailsState = {
  order: {},
  loading: false,
  error: null
};

const initialOrderPayState = {
  loading: false,
  success: false,
  error: null
};

const initialOrderListMyState = {
  orders: [],
  loading: false,
  error: null
};

// Order reducer
const orderReducer = (state, action) => {
  switch (action.type) {
    // Order create actions
    case 'ORDER_CREATE_REQUEST':
      return {
        ...state,
        create: {
          ...state.create,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'ORDER_CREATE_SUCCESS':
      return {
        ...state,
        create: {
          ...state.create,
          loading: false,
          success: true,
          order: action.payload
        }
      };
    
    case 'ORDER_CREATE_FAIL':
      return {
        ...state,
        create: {
          ...state.create,
          loading: false,
          error: action.payload
        }
      };
    
    case 'ORDER_CREATE_RESET':
      return {
        ...state,
        create: initialOrderCreateState
      };
    
    // Order details actions
    case 'ORDER_DETAILS_REQUEST':
      return {
        ...state,
        details: {
          ...state.details,
          loading: true,
          error: null
        }
      };
    
    case 'ORDER_DETAILS_SUCCESS':
      return {
        ...state,
        details: {
          ...state.details,
          loading: false,
          order: action.payload
        }
      };
    
    case 'ORDER_DETAILS_FAIL':
      return {
        ...state,
        details: {
          ...state.details,
          loading: false,
          error: action.payload
        }
      };
    
    // Order pay actions
    case 'ORDER_PAY_REQUEST':
      return {
        ...state,
        pay: {
          ...state.pay,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'ORDER_PAY_SUCCESS':
      return {
        ...state,
        pay: {
          ...state.pay,
          loading: false,
          success: true
        }
      };
    
    case 'ORDER_PAY_FAIL':
      return {
        ...state,
        pay: {
          ...state.pay,
          loading: false,
          error: action.payload
        }
      };
    
    case 'ORDER_PAY_RESET':
      return {
        ...state,
        pay: initialOrderPayState
      };
    
    // My orders list actions
    case 'ORDER_LIST_MY_REQUEST':
      return {
        ...state,
        listMy: {
          ...state.listMy,
          loading: true,
          error: null
        }
      };
    
    case 'ORDER_LIST_MY_SUCCESS':
      return {
        ...state,
        listMy: {
          ...state.listMy,
          loading: false,
          orders: action.payload
        }
      };
    
    case 'ORDER_LIST_MY_FAIL':
      return {
        ...state,
        listMy: {
          ...state.listMy,
          loading: false,
          error: action.payload
        }
      };
    
    case 'ORDER_LIST_MY_RESET':
      return {
        ...state,
        listMy: initialOrderListMyState
      };
    
    default:
      return state;
  }
};

// Create context
const OrderContext = createContext();

// Provider component
export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, {
    create: initialOrderCreateState,
    details: initialOrderDetailsState,
    pay: initialOrderPayState,
    listMy: initialOrderListMyState
  });
  
  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

// Action creators
export const orderActions = {
  // Create order
  createOrder: (order) => async (dispatch) => {
    try {
      dispatch({ type: 'ORDER_CREATE_REQUEST' });

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

      const { data } = await axios.post(`${baseUrl}/orders`, order, config);

      dispatch({
        type: 'ORDER_CREATE_SUCCESS',
        payload: data
      });

      toast.success('Order placed successfully!');
    } catch (error) {
      dispatch({
        type: 'ORDER_CREATE_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to place order'
      );
    }
  },

  // Get order details
  getOrderDetails: (id) => async (dispatch) => {
    try {
      dispatch({ type: 'ORDER_DETAILS_REQUEST' });

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

      const { data } = await axios.get(`${baseUrl}/orders/${id}`, config);

      dispatch({
        type: 'ORDER_DETAILS_SUCCESS',
        payload: data
      });
    } catch (error) {
      dispatch({
        type: 'ORDER_DETAILS_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to fetch order details'
      );
    }
  },

  // Pay for order
  payOrder: (orderId, paymentResult) => async (dispatch) => {
    try {
      dispatch({ type: 'ORDER_PAY_REQUEST' });

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

      const { data } = await axios.put(`${baseUrl}/orders/${orderId}/pay`, paymentResult, config);

      dispatch({
        type: 'ORDER_PAY_SUCCESS',
        payload: data
      });

      toast.success('Payment processed successfully!');
    } catch (error) {
      dispatch({
        type: 'ORDER_PAY_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to process payment'
      );
    }
  },

  // Reset pay state
  resetPay: () => (dispatch) => {
    dispatch({ type: 'ORDER_PAY_RESET' });
  },

  // List my orders
  listMyOrders: () => async (dispatch) => {
    try {
      dispatch({ type: 'ORDER_LIST_MY_REQUEST' });

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

      const { data } = await axios.get(`${baseUrl}/orders/myorders`, config);

      dispatch({
        type: 'ORDER_LIST_MY_SUCCESS',
        payload: data
      });
    } catch (error) {
      dispatch({
        type: 'ORDER_LIST_MY_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to fetch orders'
      );
    }
  },

  // Reset my orders list
  resetMyOrders: () => (dispatch) => {
    dispatch({ type: 'ORDER_LIST_MY_RESET' });
  }
};