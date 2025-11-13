import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for axios
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

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

    const { data } = await axios.post(
      `${API_BASE_URL}/payment/process`,
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

    const { data } = await axios.post(
      `${API_BASE_URL}/payment/verify`,
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