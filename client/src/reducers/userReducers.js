// USER REDUCERS
// Reducers specify how the application's state changes in response to actions sent to the store
// Each reducer function handles a specific part of the user-related state

// Initial state for user login
const initialUserLoginState = { 
  userInfo: null,
  loading: false,
  error: null
};

// Reducer for user login
// Handles actions related to user authentication
export const userLoginReducer = (state = initialUserLoginState, action) => {
  switch (action.type) {
    // Request action - when we start the login process
    case 'USER_LOGIN_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    // Success action - when login is successful
    case 'USER_LOGIN_SUCCESS':
      return { 
        ...state,
        loading: false, 
        userInfo: action.payload 
      };
    
    // Fail action - when login fails
    case 'USER_LOGIN_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    // Logout action - when user logs out
    case 'USER_LOGOUT':
      return initialUserLoginState;
    
    // Default case - return current state for unhandled actions
    default:
      return state;
  }
};

// Initial state for user registration
const initialUserRegisterState = { 
  userInfo: null,
  loading: false,
  error: null
};

// Reducer for user registration
// Handles actions related to user registration
export const userRegisterReducer = (state = initialUserRegisterState, action) => {
  switch (action.type) {
    // Request action - when we start the registration process
    case 'USER_REGISTER_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    // Success action - when registration is successful
    case 'USER_REGISTER_SUCCESS':
      return { 
        ...state,
        loading: false, 
        userInfo: action.payload 
      };
    
    // Fail action - when registration fails
    case 'USER_REGISTER_FAIL':
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

// Initial state for user details
const initialUserDetailsState = { 
  user: {},
  loading: false,
  error: null
};

// Reducer for user details
// Handles actions related to fetching user profile information
export const userDetailsReducer = (state = initialUserDetailsState, action) => {
  switch (action.type) {
    // Request action - when we start fetching user details
    case 'USER_DETAILS_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    // Success action - when we successfully fetch user details
    case 'USER_DETAILS_SUCCESS':
      return { 
        ...state,
        loading: false, 
        user: action.payload 
      };
    
    // Fail action - when there's an error fetching user details
    case 'USER_DETAILS_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    // Reset action - to reset the state (e.g., after logout)
    case 'USER_DETAILS_RESET':
      return initialUserDetailsState;
    
    // Default case - return current state for unhandled actions
    default:
      return state;
  }
};

// Initial state for user profile update
const initialUserUpdateProfileState = { 
  loading: false,
  success: false,
  error: null,
  userInfo: null
};

// Reducer for user profile update
// Handles actions related to updating user profile information
export const userUpdateProfileReducer = (state = initialUserUpdateProfileState, action) => {
  switch (action.type) {
    // Request action - when we start updating user profile
    case 'USER_UPDATE_PROFILE_REQUEST':
      return { 
        ...state,
        loading: true,
        success: false,
        error: null
      };
    
    // Success action - when profile update is successful
    case 'USER_UPDATE_PROFILE_SUCCESS':
      return { 
        ...state,
        loading: false, 
        success: true,
        userInfo: action.payload 
      };
    
    // Fail action - when profile update fails
    case 'USER_UPDATE_PROFILE_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    // Reset action - to reset the state (e.g., after showing success message)
    case 'USER_UPDATE_PROFILE_RESET':
      return initialUserUpdateProfileState;
    
    // Default case - return current state for unhandled actions
    default:
      return state;
  }
};