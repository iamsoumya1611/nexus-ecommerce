import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for axios
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Product Actions
export const listAdminProducts = () => async (dispatch, getState) => {
  try {
    dispatch({ type: 'ADMIN_PRODUCT_LIST_REQUEST' });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.get(`${baseUrl}/admin/products`, config);

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
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to fetch products. Please try again.'
    );
  }
};

export const deleteProduct = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: 'PRODUCT_DELETE_REQUEST' });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    await axios.delete(`${baseUrl}/products/${id}`, config);

    dispatch({
      type: 'PRODUCT_DELETE_SUCCESS'
    });
    
    // Show success toast notification
    toast.success('Product deleted successfully!');
  } catch (error) {
    dispatch({
      type: 'PRODUCT_DELETE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to delete product. Please try again.'
    );
  }
};

export const createProduct = () => async (dispatch, getState) => {
  try {
    dispatch({ type: 'PRODUCT_CREATE_REQUEST' });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.post(`${baseUrl}/products`, {}, config);

    dispatch({
      type: 'PRODUCT_CREATE_SUCCESS',
      payload: data
    });
    
    // Show success toast notification
    toast.success('Product created successfully!');
  } catch (error) {
    dispatch({
      type: 'PRODUCT_CREATE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to create product. Please try again.'
    );
  }
};

// User Actions
export const listAdminUsers = () => async (dispatch, getState) => {
  try {
    dispatch({ type: 'ADMIN_USER_LIST_REQUEST' });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.get(`${baseUrl}/admin/users`, config);

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
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to fetch users. Please try again.'
    );
  }
};

export const listUsers = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'USER_LIST_REQUEST',
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.get(`${baseUrl}/users`, config);

    dispatch({
      type: 'USER_LIST_SUCCESS',
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: 'USER_LIST_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to fetch users. Please try again.'
    );
  }
};

export const deleteUser = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'USER_DELETE_REQUEST',
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    await axios.delete(`${baseUrl}/users/${id}`, config);

    dispatch({
      type: 'USER_DELETE_SUCCESS',
    });
    
    // Show success toast notification
    toast.success('User deleted successfully!');
  } catch (error) {
    dispatch({
      type: 'USER_DELETE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to delete user. Please try again.'
    );
  }
};

export const updateUser = (user) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'USER_UPDATE_REQUEST',
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.put(`${baseUrl}/users/${user._id}`, user, config);

    dispatch({
      type: 'USER_UPDATE_SUCCESS',
    });

    dispatch({
      type: 'USER_DETAILS_SUCCESS',
      payload: data,
    });
    
    // Show success toast notification
    toast.success('User updated successfully!');
  } catch (error) {
    dispatch({
      type: 'USER_UPDATE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to update user. Please try again.'
    );
  }
};

// Order Actions
export const listAdminOrders = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'ADMIN_ORDER_LIST_REQUEST',
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.get(`${baseUrl}/orders`, config);

    dispatch({
      type: 'ADMIN_ORDER_LIST_SUCCESS',
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: 'ADMIN_ORDER_LIST_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to fetch orders. Please try again.'
    );
  }
};

export const listOrders = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'ORDER_LIST_REQUEST',
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.get(`${baseUrl}/orders`, config);

    dispatch({
      type: 'ORDER_LIST_SUCCESS',
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: 'ORDER_LIST_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to fetch orders. Please try again.'
    );
  }
};

export const deliverOrder = (order) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'ORDER_DELIVER_REQUEST',
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.put(`${baseUrl}/orders/${order._id}/deliver`, {}, config);

    dispatch({
      type: 'ORDER_DELIVER_SUCCESS',
      payload: data,
    });
    
    // Show success toast notification
    toast.success('Order marked as delivered!');
  } catch (error) {
    dispatch({
      type: 'ORDER_DELIVER_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    
    // Show error toast notification
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to mark order as delivered. Please try again.'
    );
  }
};