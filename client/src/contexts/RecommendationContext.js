import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Initial states
const initialRecommendationListState = {
  recommendations: [],
  loading: false,
  error: null
};

const initialCategoryRecommendationState = {
  recommendations: [],
  loading: false,
  error: null
};

// Recommendation reducer
const recommendationReducer = (state, action) => {
  switch (action.type) {
    // Recommendation list actions
    case 'RECOMMENDATION_LIST_REQUEST':
      return {
        ...state,
        list: {
          ...state.list,
          loading: true,
          error: null
        }
      };
    
    case 'RECOMMENDATION_LIST_SUCCESS':
      return {
        ...state,
        list: {
          ...state.list,
          loading: false,
          recommendations: action.payload
        }
      };
    
    case 'RECOMMENDATION_LIST_FAIL':
      return {
        ...state,
        list: {
          ...state.list,
          loading: false,
          error: action.payload
        }
      };
    
    // Category recommendation actions
    case 'CATEGORY_RECOMMENDATION_REQUEST':
      return {
        ...state,
        category: {
          ...state.category,
          loading: true,
          error: null
        }
      };
    
    case 'CATEGORY_RECOMMENDATION_SUCCESS':
      return {
        ...state,
        category: {
          ...state.category,
          loading: false,
          recommendations: action.payload
        }
      };
    
    case 'CATEGORY_RECOMMENDATION_FAIL':
      return {
        ...state,
        category: {
          ...state.category,
          loading: false,
          error: action.payload
        }
      };
    
    default:
      return state;
  }
};

// Create context
const RecommendationContext = createContext();

// Provider component
export const RecommendationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(recommendationReducer, {
    list: initialRecommendationListState,
    category: initialCategoryRecommendationState
  });
  
  return (
    <RecommendationContext.Provider value={{ state, dispatch }}>
      {children}
    </RecommendationContext.Provider>
  );
};

// Custom hook to use recommendation context
export const useRecommendation = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error('useRecommendation must be used within a RecommendationProvider');
  }
  return context;
};

// Action creators
export const recommendationActions = {
  // List recommendations
  listRecommendations: () => async (dispatch) => {
    try {
      dispatch({ type: 'RECOMMENDATION_LIST_REQUEST' });

      // Get user info from localStorage
      const userInfoFromStorage = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfoFromStorage?.token}`
        },
        withCredentials: true
      };

      // Construct the URL correctly based on environment
      let finalUrl;
      if (process.env.NODE_ENV === 'development') {
        // In development, use relative paths for proxy
        finalUrl = '/recommendations';
      } else {
        // In production, use full URL
        finalUrl = `${API_BASE_URL.replace(/\/$/, '')}/recommendations`;
      }

      const { data } = await axios.get(finalUrl, config);

      dispatch({
        type: 'RECOMMENDATION_LIST_SUCCESS',
        payload: data
      });
    } catch (error) {
      // Handle 401 errors (unauthorized) - user not logged in
      if (error.response && error.response.status === 401) {
        // Don't show error toast for unauthorized access to recommendations
        // This is expected for non-logged-in users
        dispatch({
          type: 'RECOMMENDATION_LIST_FAIL',
          payload: 'Please log in to see personalized recommendations'
        });
        return;
      }
      
      dispatch({
        type: 'RECOMMENDATION_LIST_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      // Show error toast only for unexpected errors
      if (error.response && error.response.status !== 401) {
        toast.error(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to fetch recommendations'
        );
      }
    }
  },

  // Get category recommendations
  getCategoryRecommendations: (category) => async (dispatch) => {
    try {
      dispatch({ type: 'CATEGORY_RECOMMENDATION_REQUEST' });

      // Get user info from localStorage
      const userInfoFromStorage = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfoFromStorage?.token}`
        },
        withCredentials: true
      };

      // Construct the URL correctly based on environment
      let finalUrl;
      if (process.env.NODE_ENV === 'development') {
        // In development, use relative paths for proxy
        finalUrl = `/recommendations/category/${category}`;
      } else {
        // In production, use full URL
        finalUrl = `${API_BASE_URL.replace(/\/$/, '')}/recommendations/category/${category}`;
      }

      const { data } = await axios.get(finalUrl, config);

      dispatch({
        type: 'CATEGORY_RECOMMENDATION_SUCCESS',
        payload: data
      });
    } catch (error) {
      dispatch({
        type: 'CATEGORY_RECOMMENDATION_FAIL',
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
      });
      
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to fetch category recommendations'
      );
    }
  }
};