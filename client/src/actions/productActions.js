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
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to fetch products'
    });
  }
};

export const listProductDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: 'PRODUCT_DETAILS_REQUEST' });

    // Validate product ID
    if (!id) {
      throw new Error('Product ID is required');
    }

    const { data } = await axios.get(`${API_BASE_URL}/products/${id}`);

    dispatch({
      type: 'PRODUCT_DETAILS_SUCCESS',
      payload: data
    });
  } catch (error) {
    dispatch({
      type: 'PRODUCT_DETAILS_FAIL',
      payload:
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to fetch product details'
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

    // Check if user is logged in
    if (!userInfo) {
      throw new Error('You must be logged in to submit a review');
    }

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
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to create review'
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

    // Check if user is logged in
    if (!userInfo) {
      throw new Error('You must be logged in to update a product');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Validate product data
    if (!product || !product._id) {
      throw new Error('Invalid product data');
    }

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
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to update product'
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

    // Check if user is logged in
    if (!userInfo) {
      throw new Error('You must be logged in to create a product');
    }

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
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to create product'
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

    // Check if user is logged in
    if (!userInfo) {
      throw new Error('You must be logged in to delete a product');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    // Validate product ID
    if (!id) {
      throw new Error('Product ID is required');
    }

    await axios.delete(`${API_BASE_URL}/products/${id}`, config);

    dispatch({
      type: 'PRODUCT_DELETE_SUCCESS'
    });
  } catch (error) {
    dispatch({
      type: 'PRODUCT_DELETE_FAIL',
      payload:
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to delete product'
    });
  }
};