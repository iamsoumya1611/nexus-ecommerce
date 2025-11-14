import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for axios
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const processPayment = (amount, currency, receipt) => async (dispatch, getState) => {
  try {
    dispatch({ type: 'PAYMENT_PROCESS_REQUEST' });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.post(
      `${baseUrl}/payment/process`,
      { amount, currency, receipt },
      config
    );

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

    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to process payment. Please try again.'
    );
    
    throw error;
  }
};

export const verifyPayment = (paymentData) => async (dispatch, getState) => {
  try {
    dispatch({ type: 'PAYMENT_VERIFY_REQUEST' });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.post(
      `${baseUrl}/payment/verify`,
      paymentData,
      config
    );

    dispatch({
      type: 'PAYMENT_VERIFY_SUCCESS',
      payload: data
    });

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
        : 'Failed to verify payment. Please try again.'
    );
    
    throw error;
  }
};