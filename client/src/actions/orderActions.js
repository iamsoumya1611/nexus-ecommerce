import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for axios
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const createOrder = (order) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'ORDER_CREATE_REQUEST'
    });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    const { data } = await axios.post(`${API_BASE_URL}/orders`, order, config);

    dispatch({
      type: 'ORDER_CREATE_SUCCESS',
      payload: data
    });
    
    // Show success toast notification
    toast.success('Order placed successfully!');
  } catch (error) {
    dispatch({
      type: 'ORDER_CREATE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to place order. Please try again.'
    );
  }
};

export const getOrderDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'ORDER_DETAILS_REQUEST'
    });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    const { data } = await axios.get(`${API_BASE_URL}/orders/${id}`, config);

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
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to fetch order details. Please try again.'
    );
  }
};

export const payOrder = (orderId, paymentResult) => async (
  dispatch,
  getState
) => {
  try {
    dispatch({
      type: 'ORDER_PAY_REQUEST'
    });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    const { data } = await axios.put(
      `${API_BASE_URL}/orders/${orderId}/pay`,
      paymentResult,
      config
    );

    dispatch({
      type: 'ORDER_PAY_SUCCESS',
      payload: data
    });
    
    // Show success toast notification
    toast.success('Payment processed successfully!');
  } catch (error) {
    dispatch({
      type: 'ORDER_PAY_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to process payment. Please try again.'
    );
  }
};

export const listMyOrders = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'ORDER_LIST_MY_REQUEST'
    });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    const { data } = await axios.get(`${API_BASE_URL}/orders/myorders`, config);

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
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to fetch orders. Please try again.'
    );
  }
};