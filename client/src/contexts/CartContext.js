import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';

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
  addToCart: (id, qty) => async (dispatch, getState) => {
    try {
      // In a real app, you would fetch product data from an API
      // For now, we'll simulate getting product data
      // This would typically be an API call like:
      // const response = await fetch(`/api/products/${id}`);
      // const data = await response.json();
      
      // For demo purposes, we'll create a mock product object
      // In a real implementation, replace this with actual API call
      const mockProductData = {
        _id: id,
        name: `Product ${id}`,
        image: '/placeholder.jpg',
        price: 29.99,
        countInStock: 5
      };
      
      const item = {
        product: mockProductData._id,
        name: mockProductData.name,
        image: mockProductData.image,
        price: mockProductData.price,
        countInStock: mockProductData.countInStock,
        qty
      };
      
      dispatch({
        type: 'CART_ADD_ITEM',
        payload: item
      });
      
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  },
  
  removeFromCart: (id) => (dispatch) => {
    dispatch({
      type: 'CART_REMOVE_ITEM',
      payload: id
    });
    
    toast.success('Item removed from cart!');
  },
  
  saveShippingAddress: (data) => (dispatch) => {
    dispatch({
      type: 'CART_SAVE_SHIPPING_ADDRESS',
      payload: data
    });
  },
  
  savePaymentMethod: (data) => (dispatch) => {
    dispatch({
      type: 'CART_SAVE_PAYMENT_METHOD',
      payload: data
    });
  },
  
  clearCartItems: () => (dispatch) => {
    dispatch({
      type: 'CART_CLEAR_ITEMS'
    });
  }
};