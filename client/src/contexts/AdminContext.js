import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Initial states
const initialAdminProductListState = {
  products: [],
  loading: false,
  error: null,
  pages: 1,
  page: 1
};

const initialAdminUserListState = {
  users: [],
  loading: false,
  error: null
};

const initialUserDeleteState = {
  loading: false,
  success: false,
  error: null
};

const initialUserUpdateAdminState = {
  loading: false,
  success: false,
  error: null,
  user: {}
};

const initialAdminOrderListState = {
  orders: [],
  loading: false,
  error: null
};

const initialOrderDeliverState = {
  loading: false,
  success: false,
  error: null
};

// Admin reducer
const adminReducer = (state, action) => {
  switch (action.type) {
    // Admin product list actions
    case 'ADMIN_PRODUCT_LIST_REQUEST':
      return {
        ...state,
        productList: {
          ...state.productList,
          loading: true,
          error: null
        }
      };
    
    case 'ADMIN_PRODUCT_LIST_SUCCESS':
      return {
        ...state,
        productList: {
          ...state.productList,
          loading: false,
          products: action.payload.products,
          pages: action.payload.pages,
          page: action.payload.page
        }
      };
    
    case 'ADMIN_PRODUCT_LIST_FAIL':
      return {
        ...state,
        productList: {
          ...state.productList,
          loading: false,
          error: action.payload
        }
      };
    
    // Admin user list actions
    case 'ADMIN_USER_LIST_REQUEST':
      return {
        ...state,
        userList: {
          ...state.userList,
          loading: true,
          error: null
        }
      };
    
    case 'ADMIN_USER_LIST_SUCCESS':
      return {
        ...state,
        userList: {
          ...state.userList,
          loading: false,
          users: action.payload
        }
      };
    
    case 'ADMIN_USER_LIST_FAIL':
      return {
        ...state,
        userList: {
          ...state.userList,
          loading: false,
          error: action.payload
        }
      };
    
    // User delete actions
    case 'USER_DELETE_REQUEST':
      return {
        ...state,
        userDelete: {
          ...state.userDelete,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'USER_DELETE_SUCCESS':
      return {
        ...state,
        userDelete: {
          ...state.userDelete,
          loading: false,
          success: true
        }
      };
    
    case 'USER_DELETE_FAIL':
      return {
        ...state,
        userDelete: {
          ...state.userDelete,
          loading: false,
          error: action.payload
        }
      };
    
    // User update actions
    case 'USER_UPDATE_ADMIN_REQUEST':
      return {
        ...state,
        userUpdate: {
          ...state.userUpdate,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'USER_UPDATE_ADMIN_SUCCESS':
      return {
        ...state,
        userUpdate: {
          ...state.userUpdate,
          loading: false,
          success: true,
          user: action.payload
        }
      };
    
    case 'USER_UPDATE_ADMIN_FAIL':
      return {
        ...state,
        userUpdate: {
          ...state.userUpdate,
          loading: false,
          error: action.payload
        }
      };
    
    case 'USER_UPDATE_ADMIN_RESET':
      return {
        ...state,
        userUpdate: {
          loading: false,
          success: false,
          error: null,
          user: {}
        }
      };
    
    // Admin order list actions
    case 'ADMIN_ORDER_LIST_REQUEST':
      return {
        ...state,
        orderList: {
          ...state.orderList,
          loading: true,
          error: null
        }
      };
    
    case 'ADMIN_ORDER_LIST_SUCCESS':
      return {
        ...state,
        orderList: {
          ...state.orderList,
          loading: false,
          orders: action.payload
        }
      };
    
    case 'ADMIN_ORDER_LIST_FAIL':
      return {
        ...state,
        orderList: {
          ...state.orderList,
          loading: false,
          error: action.payload
        }
      };
    
    // Order deliver actions
    case 'ORDER_DELIVER_REQUEST':
      return {
        ...state,
        orderDeliver: {
          ...state.orderDeliver,
          loading: true,
          success: false,
          error: null
        }
      };
    
    case 'ORDER_DELIVER_SUCCESS':
      return {
        ...state,
        orderDeliver: {
          ...state.orderDeliver,
          loading: false,
          success: true
        }
      };
    
    case 'ORDER_DELIVER_FAIL':
      return {
        ...state,
        orderDeliver: {
          ...state.orderDeliver,
          loading: false,
          error: action.payload
        }
      };
    
    case 'ORDER_DELIVER_RESET':
      return {
        ...state,
        orderDeliver: {
          loading: false,
          success: false,
          error: null
        }
      };
    
    default:
      return state;
  }
};

// Create context
const AdminContext = createContext();

// Provider component
export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, {
    productList: initialAdminProductListState,
    userList: initialAdminUserListState,
    userDelete: initialUserDeleteState,
    userUpdate: initialUserUpdateAdminState,
    orderList: initialAdminOrderListState,
    orderDeliver: initialOrderDeliverState
  });
  
  return (
    <AdminContext.Provider value={{ state, dispatch }}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook to use admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Action creators
export const adminActions = {
  // List products for admin
  listProducts: (pageNumber = '') => async (dispatch) => {
    try {
      dispatch({ type: 'ADMIN_PRODUCT_LIST_REQUEST' });

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

      const { data } = await axios.get(`${baseUrl}/products/admin/all?pageNumber=${pageNumber}`, config);

      dispatch({
        type: 'ADMIN_PRODUCT_LIST_SUCCESS',
        payload: data
      });
    } catch (error) {
      dispatch({
        type: 'ADMIN_PRODUCT_LIST_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
    }
  },

  // List users for admin
  listUsers: () => async (dispatch) => {
    try {
      dispatch({ type: 'ADMIN_USER_LIST_REQUEST' });

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

      const { data } = await axios.get(`${baseUrl}/users`, config);

      dispatch({
        type: 'ADMIN_USER_LIST_SUCCESS',
        payload: data
      });
    } catch (error) {
      dispatch({
        type: 'ADMIN_USER_LIST_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
    }
  },

  // Delete user
  deleteUser: (id) => async (dispatch) => {
    try {
      dispatch({ type: 'USER_DELETE_REQUEST' });

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

      await axios.delete(`${baseUrl}/users/${id}`, config);

      dispatch({
        type: 'USER_DELETE_SUCCESS'
      });

      toast.success('User deleted successfully!');
    } catch (error) {
      dispatch({
        type: 'USER_DELETE_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to delete user'
      );
    }
  },

  // Update user
  updateUser: (user) => async (dispatch) => {
    try {
      dispatch({ type: 'USER_UPDATE_ADMIN_REQUEST' });

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

      const { data } = await axios.put(`${baseUrl}/users/${user._id}`, user, config);

      dispatch({
        type: 'USER_UPDATE_ADMIN_SUCCESS',
        payload: data
      });

      toast.success('User updated successfully!');
    } catch (error) {
      dispatch({
        type: 'USER_UPDATE_ADMIN_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to update user'
      );
    }
  },

  // Reset user update state
  resetUserUpdate: () => (dispatch) => {
    dispatch({ type: 'USER_UPDATE_ADMIN_RESET' });
  },

  // List orders for admin
  listOrders: () => async (dispatch) => {
    try {
      dispatch({ type: 'ADMIN_ORDER_LIST_REQUEST' });

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

      const { data } = await axios.get(`${baseUrl}/orders`, config);

      dispatch({
        type: 'ADMIN_ORDER_LIST_SUCCESS',
        payload: data
      });
    } catch (error) {
      dispatch({
        type: 'ADMIN_ORDER_LIST_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
    }
  },

  // Mark order as delivered
  deliverOrder: (orderId) => async (dispatch) => {
    try {
      dispatch({ type: 'ORDER_DELIVER_REQUEST' });

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

      const { data } = await axios.put(`${baseUrl}/orders/${orderId}/deliver`, {}, config);

      dispatch({
        type: 'ORDER_DELIVER_SUCCESS',
        payload: data
      });

      toast.success('Order marked as delivered!');
    } catch (error) {
      dispatch({
        type: 'ORDER_DELIVER_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to mark order as delivered'
      );
    }
  },

  // Reset order deliver state
  resetOrderDeliver: () => (dispatch) => {
    dispatch({ type: 'ORDER_DELIVER_RESET' });
  }
};