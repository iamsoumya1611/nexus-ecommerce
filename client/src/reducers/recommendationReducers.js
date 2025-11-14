// Initial state for recommendation list
const initialRecommendationListState = { 
  recommendations: [],
  loading: false,
  error: null
};

// Reducer for recommendation list
export const recommendationListReducer = (state = initialRecommendationListState, action) => {
  switch (action.type) {
    case 'RECOMMENDATION_LIST_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    case 'RECOMMENDATION_LIST_SUCCESS':
      return { 
        ...state,
        loading: false, 
        recommendations: action.payload || [] 
      };
    
    case 'RECOMMENDATION_LIST_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    default:
      return state;
  }
};

// Initial state for category recommendations
const initialCategoryRecommendationState = { 
  recommendations: [],
  loading: false,
  error: null
};

// Reducer for category recommendations
export const categoryRecommendationReducer = (state = initialCategoryRecommendationState, action) => {
  switch (action.type) {
    case 'RECOMMENDATION_CATEGORY_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    case 'RECOMMENDATION_CATEGORY_SUCCESS':
      return { 
        ...state,
        loading: false, 
        recommendations: action.payload || [] 
      };
    
    case 'RECOMMENDATION_CATEGORY_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    default:
      return state;
  }
};