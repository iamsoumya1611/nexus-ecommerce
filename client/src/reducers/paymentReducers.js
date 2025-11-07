// PAYMENT REDUCERS
// Reducers specify how the application's state changes in response to actions sent to the store

// Initial state for payment processing
const initialPaymentProcessState = { 
  loading: false,
  success: false,
  error: null,
  order: null
};

// Reducer for payment processing
export const paymentProcessReducer = (state = initialPaymentProcessState, action) => {
  switch (action.type) {
    case 'PAYMENT_PROCESS_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    case 'PAYMENT_PROCESS_SUCCESS':
      return { 
        ...state,
        loading: false, 
        success: true,
        order: action.payload.order
      };
    
    case 'PAYMENT_PROCESS_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    case 'USER_LOGOUT':
      return initialPaymentProcessState;
    
    default:
      return state;
  }
};

// Initial state for payment verification
const initialPaymentVerifyState = { 
  loading: false,
  success: false,
  error: null
};

// Reducer for payment verification
export const paymentVerifyReducer = (state = initialPaymentVerifyState, action) => {
  switch (action.type) {
    case 'PAYMENT_VERIFY_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    case 'PAYMENT_VERIFY_SUCCESS':
      return { 
        ...state,
        loading: false, 
        success: true
      };
    
    case 'PAYMENT_VERIFY_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    case 'USER_LOGOUT':
      return initialPaymentVerifyState;
    
    default:
      return state;
  }
};