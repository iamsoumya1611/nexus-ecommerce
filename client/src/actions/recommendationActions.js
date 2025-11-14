import axios from 'axios';
import { toast } from 'react-toastify';
import {
  RECOMMENDATION_LIST_REQUEST,
  RECOMMENDATION_LIST_SUCCESS,
  RECOMMENDATION_LIST_FAIL,
  RECOMMENDATION_CATEGORY_REQUEST,
  RECOMMENDATION_CATEGORY_SUCCESS,
  RECOMMENDATION_CATEGORY_FAIL
} from '../constants/recommendationConstants';

// Set base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// ACTION CREATORS
export const listRecommendations = () => async (dispatch, getState) => {
  try {
    dispatch({ type: RECOMMENDATION_LIST_REQUEST });

    const { userLogin: { userInfo } } = getState();

    // For logged-in users, use the personalized recommendation endpoint
    // For non-logged-in users, use the general popular products endpoint
    const config = userInfo ? {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    } : {};

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const url = userInfo 
      ? `${baseUrl}/recommendations`
      : `${baseUrl}/recommendations/category/popular`;

    const { data } = await axios.get(url, config);

    dispatch({
      type: RECOMMENDATION_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: RECOMMENDATION_LIST_FAIL,
      payload:
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to fetch recommendations',
    });
    toast.error('Failed to fetch recommendations');
  }
};

export const listCategoryRecommendations = (category) => async (dispatch) => {
  try {
    dispatch({ type: RECOMMENDATION_CATEGORY_REQUEST });

    // Construct the URL correctly based on environment
    let baseUrl = API_BASE_URL;
    // In development, we don't need the full URL because of proxy
    if (process.env.NODE_ENV === 'development') {
      baseUrl = '';
    }

    const { data } = await axios.get(`${baseUrl}/recommendations/category/${category}`);

    dispatch({
      type: RECOMMENDATION_CATEGORY_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: RECOMMENDATION_CATEGORY_FAIL,
      payload:
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to fetch category recommendations',
    });
    toast.error('Failed to fetch category recommendations');
  }
};