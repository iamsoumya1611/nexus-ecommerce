import axios from 'axios';

// Set base URL for axios
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const listProducts = (keyword = '', pageNumber = '') => async (
  dispatch
) => {
  try {
    dispatch({ type: 'PRODUCT_LIST_REQUEST' });

    const { data } = await axios.get(
      `${API_BASE_URL}/products?keyword=${keyword}&pageNumber=${pageNumber}`
    );

    dispatch({
      type: 'PRODUCT_LIST_SUCCESS',
      payload: data
    });
  } catch (error) {
    dispatch({
      type: 'PRODUCT_LIST_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
  }
};

export const listProductDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: 'PRODUCT_DETAILS_REQUEST' });

    const { data } = await axios.get(`${API_BASE_URL}/products/${id}`);

    dispatch({
      type: 'PRODUCT_DETAILS_SUCCESS',
      payload: data
    });
  } catch (error) {
    dispatch({
      type: 'PRODUCT_DETAILS_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
  }
};

export const createProductReview = (productId, review) => async (
  dispatch,
  getState
) => {
  try {
    dispatch({
      type: 'PRODUCT_CREATE_REVIEW_REQUEST'
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

    await axios.post(`${API_BASE_URL}/products/${productId}/reviews`, review, config);

    dispatch({
      type: 'PRODUCT_CREATE_REVIEW_SUCCESS'
    });
  } catch (error) {
    dispatch({
      type: 'PRODUCT_CREATE_REVIEW_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
  }
};

export const updateProduct = (product) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'PRODUCT_UPDATE_REQUEST'
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
      `${API_BASE_URL}/products/${product._id}`,
      product,
      config
    );

    dispatch({
      type: 'PRODUCT_UPDATE_SUCCESS',
      payload: data
    });
  } catch (error) {
    dispatch({
      type: 'PRODUCT_UPDATE_FAIL',
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
    });
  }
};

// New action for creating products with additional attributes
export const createProduct = (product) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'PRODUCT_CREATE_REQUEST'
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

    const { data } = await axios.post(
      `${API_BASE_URL}/products`,
      product,
      config
    );

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

// New action for deleting products
export const deleteProduct = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'PRODUCT_DELETE_REQUEST'
    });

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