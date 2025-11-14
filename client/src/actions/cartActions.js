import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for axios
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const addToCart = (id, qty) => async (dispatch, getState) => {
  // Construct the URL correctly based on environment
  let baseUrl = API_BASE_URL;
  // In development, we don't need the full URL because of proxy
  if (process.env.NODE_ENV === 'development') {
    baseUrl = '';
  }

  const { data } = await axios.get(`${baseUrl}/products/${id}`);

  dispatch({
    type: 'CART_ADD_ITEM',
    payload: {
      product: data._id,
      name: data.name,
      image: data.image,
      price: data.price,
      countInStock: data.countInStock,
      qty
    }
  });

  localStorage.setItem(
    'cartItems',
    JSON.stringify(getState().cart.cartItems)
  );
  
  // Show success toast notification
  toast.success('Item added to cart!');
};

export const removeFromCart = (id) => (dispatch, getState) => {
  dispatch({
    type: 'CART_REMOVE_ITEM',
    payload: id
  });

  localStorage.setItem(
    'cartItems',
    JSON.stringify(getState().cart.cartItems)
  );
  
  // Show success toast notification
  toast.success('Item removed from cart!');
};

export const saveShippingAddress = (data) => (dispatch) => {
  dispatch({
    type: 'CART_SAVE_SHIPPING_ADDRESS',
    payload: data
  });

  localStorage.setItem('shippingAddress', JSON.stringify(data));
};

export const savePaymentMethod = (data) => (dispatch) => {
  dispatch({
    type: 'CART_SAVE_PAYMENT_METHOD',
    payload: data
  });

  localStorage.setItem('paymentMethod', JSON.stringify(data));
};