import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Initial state
const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: ''
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'CART_ADD_ITEM':
      const item = action.payload;
      
      const existItem = state.cartItems.find(x => x.product === item.product);
      
      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(x =>
            x.product === existItem.product ? item : x
          )
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item]
        };
      }
    
    case 'CART_REMOVE_ITEM':
      return {
        ...state,
        cartItems: state.cartItems.filter(x => x.product !== action.payload)
      };
    
    case 'CART_SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: action.payload
      };
    
    case 'CART_SAVE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethod: action.payload
      };
    
    case 'CART_CLEAR_ITEMS':
      return {
        ...state,
        cartItems: []
      };
    
    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    // Load initial state from localStorage
    const cartItemsFromStorage = localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [];
    
    const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {};
    
    return {
      ...initialState,
      cartItems: cartItemsFromStorage,
      shippingAddress: shippingAddressFromStorage
    };
  });
  
  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
  }, [state.cartItems]);
  
  // Save shipping address to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shippingAddress', JSON.stringify(state.shippingAddress));
  }, [state.shippingAddress]);
  
  // Save payment method to localStorage whenever it changes
  useEffect(() => {
    if (state.paymentMethod) {
      localStorage.setItem('paymentMethod', JSON.stringify(state.paymentMethod));
    }
  }, [state.paymentMethod]);
  
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Action creators (similar to Redux actions)
export const cartActions = {
  addToCart: (id, qty) => async (dispatch) => {
    try {
      // Use proxy path in development, full URL in production
      const baseUrl = process.env.NODE_ENV === 'development' ? '' : process.env.REACT_APP_API_URL || '';
      const finalUrl = `${baseUrl.replace(/\/$/, '')}/cart`;
      
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const { data } = await axios.post(finalUrl, { productId: id, qty }, config);
      
      dispatch({
        type: 'CART_ADD_ITEM',
        payload: data
      });
      
      toast.success('Item added to cart!');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart';
      console.error('Error adding item to cart:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
  
  removeFromCart: (id) => async (dispatch) => {
    try {
      // Use proxy path in development, full URL in production
      const baseUrl = process.env.NODE_ENV === 'development' ? '' : process.env.REACT_APP_API_URL || '';
      const finalUrl = `${baseUrl.replace(/\/$/, '')}/cart/${id}`;
      
      await axios.delete(finalUrl);
      
      dispatch({
        type: 'CART_REMOVE_ITEM',
        payload: id
      });
      
      toast.success('Item removed from cart!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item from cart';
      console.error('Error removing item from cart:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
  
  saveShippingAddress: (data) => async (dispatch) => {
    try {
      dispatch({
        type: 'CART_SAVE_SHIPPING_ADDRESS',
        payload: data
      });
      localStorage.setItem('shippingAddress', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save shipping address';
      console.error('Error saving shipping address:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
  
  savePaymentMethod: (data) => async (dispatch) => {
    try {
      dispatch({
        type: 'CART_SAVE_PAYMENT_METHOD',
        payload: data
      });
      localStorage.setItem('paymentMethod', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save payment method';
      console.error('Error saving payment method:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
  
  clearCartItems: () => (dispatch) => {
    dispatch({
      type: 'CART_CLEAR_ITEMS'
    });
    localStorage.removeItem('cartItems');
  }
};