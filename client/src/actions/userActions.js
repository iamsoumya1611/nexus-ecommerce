import axios from 'axios';

// Set base URL for axios
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({
      type: 'USER_LOGIN_REQUEST'
    });

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const { data } = await axios.post(
      `${API_BASE_URL}/users/login`,
      { email, password },
      config
    );

    dispatch({
      type: 'USER_LOGIN_SUCCESS',
      payload: data
    });

    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: 'USER_LOGIN_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingAddress');
  localStorage.removeItem('paymentMethod');
  dispatch({ type: 'USER_LOGOUT' });
  dispatch({ type: 'USER_DETAILS_RESET' });
  dispatch({ type: 'ORDER_LIST_MY_RESET' });
  dispatch({ type: 'CART_CLEAR_ITEMS' });
};

export const register = (name, email, password) => async (dispatch) => {
  try {
    dispatch({
      type: 'USER_REGISTER_REQUEST'
    });

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const { data } = await axios.post(
      `${API_BASE_URL}/users/register`,
      { name, email, password },
      config
    );

    dispatch({
      type: 'USER_REGISTER_SUCCESS',
      payload: data
    });

    dispatch({
      type: 'USER_LOGIN_SUCCESS',
      payload: data
    });

    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: 'USER_REGISTER_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
  }
};

export const getUserDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'USER_DETAILS_REQUEST'
    });

    const {
      userLogin: { userInfo }
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    const { data } = await axios.get(`${API_BASE_URL}/users/${id}`, config);

    dispatch({
      type: 'USER_DETAILS_SUCCESS',
      payload: data
    });
  } catch (error) {
    dispatch({
      type: 'USER_DETAILS_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
  }
};

export const updateUserProfile = (user) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'USER_UPDATE_PROFILE_REQUEST'
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

    const { data } = await axios.put(`${API_BASE_URL}/users/profile`, user, config);

    dispatch({
      type: 'USER_UPDATE_PROFILE_SUCCESS',
      payload: data
    });

    dispatch({
      type: 'USER_LOGIN_SUCCESS',
      payload: data
    });

    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: 'USER_UPDATE_PROFILE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
  }
};