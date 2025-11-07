// PRODUCT REDUCERS
// Reducers specify how the application's state changes in response to actions sent to the store
// Each reducer function handles a specific part of the application state

// Initial state for product list
const initialProductListState = { 
  products: [],
  loading: false,
  error: null,
  pages: 1,
  page: 1
};

// Reducer for product list
// Handles actions related to fetching lists of products
export const productListReducer = (state = initialProductListState, action) => {
  switch (action.type) {
    // Request action - when we start fetching products
    case 'PRODUCT_LIST_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    // Success action - when we successfully fetch products
    case 'PRODUCT_LIST_SUCCESS':
      return {
        ...state,
        loading: false,
        products: Array.isArray(action.payload.products) ? action.payload.products : [],
        pages: action.payload.pages || 1,
        page: action.payload.page || 1
      };
    
    // Fail action - when there's an error fetching products
    case 'PRODUCT_LIST_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    // Default case - return current state for unhandled actions
    default:
      return state;
  }
};

// Initial state for product details
const initialProductDetailsState = { 
  product: { reviews: [] },
  loading: false,
  error: null
};

// Reducer for product details
// Handles actions related to fetching details of a single product
export const productDetailsReducer = (state = initialProductDetailsState, action) => {
  switch (action.type) {
    // Request action - when we start fetching product details
    case 'PRODUCT_DETAILS_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    // Success action - when we successfully fetch product details
    case 'PRODUCT_DETAILS_SUCCESS':
      return { 
        ...state,
        loading: false, 
        product: action.payload || {} 
      };
    
    // Fail action - when there's an error fetching product details
    case 'PRODUCT_DETAILS_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    // Default case - return current state for unhandled actions
    default:
      return state;
  }
};

// Initial state for product review creation
const initialProductCreateReviewState = { 
  loading: false,
  success: false,
  error: null
};

// Reducer for product review creation
// Handles actions related to creating product reviews
export const productCreateReviewReducer = (state = initialProductCreateReviewState, action) => {
  switch (action.type) {
    // Request action - when we start creating a review
    case 'PRODUCT_CREATE_REVIEW_REQUEST':
      return { 
        ...state,
        loading: true,
        success: false,
        error: null
      };
    
    // Success action - when we successfully create a review
    case 'PRODUCT_CREATE_REVIEW_SUCCESS':
      return { 
        ...state,
        loading: false, 
        success: true 
      };
    
    // Fail action - when there's an error creating a review
    case 'PRODUCT_CREATE_REVIEW_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    // Reset action - to reset the state (e.g., after showing success message)
    case 'PRODUCT_CREATE_REVIEW_RESET':
      return initialProductCreateReviewState;
    
    // Default case - return current state for unhandled actions
    default:
      return state;
  }
};

// Initial state for product update
const initialProductUpdateState = { 
  product: {},
  loading: false,
  success: false,
  error: null
};

// Reducer for product update
// Handles actions related to updating products
export const productUpdateReducer = (state = initialProductUpdateState, action) => {
  switch (action.type) {
    // Request action - when we start updating a product
    case 'PRODUCT_UPDATE_REQUEST':
      return { 
        ...state,
        loading: true,
        success: false,
        error: null
      };
    
    // Success action - when we successfully update a product
    case 'PRODUCT_UPDATE_SUCCESS':
      return { 
        ...state,
        loading: false, 
        success: true,
        product: action.payload || {} 
      };
    
    // Fail action - when there's an error updating a product
    case 'PRODUCT_UPDATE_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    // Reset action - to reset the state (e.g., after showing success message)
    case 'PRODUCT_UPDATE_RESET':
      return initialProductUpdateState;
    
    // Default case - return current state for unhandled actions
    default:
      return state;
  }
};

// Initial state for product creation
const initialProductCreateState = { 
  loading: false,
  success: false,
  error: null,
  product: {}
};

// Reducer for product creation
// Handles actions related to creating new products
export const productCreateReducer = (state = initialProductCreateState, action) => {
  switch (action.type) {
    // Request action - when we start creating a product
    case 'PRODUCT_CREATE_REQUEST':
      return { 
        ...state,
        loading: true,
        success: false,
        error: null
      };
    
    // Success action - when we successfully create a product
    case 'PRODUCT_CREATE_SUCCESS':
      return { 
        ...state,
        loading: false, 
        success: true,
        product: action.payload || {} 
      };
    
    // Fail action - when there's an error creating a product
    case 'PRODUCT_CREATE_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    // Reset action - to reset the state (e.g., after showing success message)
    case 'PRODUCT_CREATE_RESET':
      return initialProductCreateState;
    
    // Default case - return current state for unhandled actions
    default:
      return state;
  }
};

// Initial state for product deletion
const initialProductDeleteState = { 
  loading: false,
  success: false,
  error: null
};

// Reducer for product deletion
// Handles actions related to deleting products
export const productDeleteReducer = (state = initialProductDeleteState, action) => {
  switch (action.type) {
    // Request action - when we start deleting a product
    case 'PRODUCT_DELETE_REQUEST':
      return { 
        ...state,
        loading: true,
        success: false,
        error: null
      };
    
    // Success action - when we successfully delete a product
    case 'PRODUCT_DELETE_SUCCESS':
      return { 
        ...state,
        loading: false, 
        success: true 
      };
    
    // Fail action - when there's an error deleting a product
    case 'PRODUCT_DELETE_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    // Reset action - to reset the state (e.g., after showing success message)
    case 'PRODUCT_DELETE_RESET':
      return initialProductDeleteState;
    
    // Default case - return current state for unhandled actions
    default:
      return state;
  }
};