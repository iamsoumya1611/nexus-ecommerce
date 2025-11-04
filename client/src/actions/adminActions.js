import axios from 'axios';

// Set base URL for axios
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

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

    const { data } = await axios.get(`${API_BASE_URL}/admin/products`, config);

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

    await axios.delete(`${API_BASE_URL}/products/${id}`, config);

    dispatch({
      type: 'PRODUCT_DELETE_SUCCESS'
    });
  } catch (error) {
    dispatch({
      type: 'PRODUCT_DELETE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
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

    const { data } = await axios.post(`${API_BASE_URL}/products`, {}, config);

    dispatch({
      type: 'PRODUCT_CREATE_SUCCESS',
      payload: data
    });
  } catch (error) {
    dispatch({
      type: 'PRODUCT_CREATE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
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

    const { data } = await axios.get(`${API_BASE_URL}/admin/users`, config);

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

    const { data } = await axios.get(`${API_BASE_URL}/users`, config);

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

    await axios.delete(`${API_BASE_URL}/users/${id}`, config);

    dispatch({
      type: 'USER_DELETE_SUCCESS',
    });
  } catch (error) {
    dispatch({
      type: 'USER_DELETE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
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

    const { data } = await axios.put(`${API_BASE_URL}/users/${user._id}`, user, config);

    dispatch({
      type: 'USER_UPDATE_SUCCESS',
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: 'USER_UPDATE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const updateUserToAdmin = (id, isAdmin) => async (dispatch, getState) => {
  try {
    dispatch({ type: 'USER_UPDATE_ADMIN_REQUEST' });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    const { data } = await axios.put(`${API_BASE_URL}/admin/users/${id}`, { isAdmin }, config);

    dispatch({
      type: 'USER_UPDATE_ADMIN_SUCCESS',
      payload: data
    });
  } catch (error) {
    dispatch({
      type: 'USER_UPDATE_ADMIN_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
  }
};

// Order Actions
export const listAdminOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: 'ADMIN_ORDER_LIST_REQUEST' });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    const { data } = await axios.get(`${API_BASE_URL}/admin/orders`, config);

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
};

export const deliverOrder = (orderId) => async (dispatch, getState) => {
  try {
    dispatch({ type: 'ORDER_DELIVER_REQUEST' });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    const { data } = await axios.put(`${API_BASE_URL}/orders/${orderId}/deliver`, {}, config);

    dispatch({
      type: 'ORDER_DELIVER_SUCCESS',
      payload: data
    });
  } catch (error) {
    dispatch({
      type: 'ORDER_DELIVER_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
  }
};