// USER REDUCERS
// Simplified reducers for user authentication and profile management

// Initial state for user login
const initialUserLoginState = { 
  userInfo: null,
  loading: false,
  error: null
};

// Reducer for user login
export const userLoginReducer = (state = initialUserLoginState, action) => {
  switch (action.type) {
    case 'USER_LOGIN_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    case 'USER_LOGIN_SUCCESS':
      return { 
        ...state,
        loading: false, 
        userInfo: action.payload 
      };
    
    case 'USER_LOGIN_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    case 'USER_LOGOUT':
      return initialUserLoginState;
    
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
export const userRegisterReducer = (state = initialUserRegisterState, action) => {
  switch (action.type) {
    case 'USER_REGISTER_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    case 'USER_REGISTER_SUCCESS':
      return { 
        ...state,
        loading: false, 
        userInfo: action.payload 
      };
    
    case 'USER_REGISTER_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
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
export const userDetailsReducer = (state = initialUserDetailsState, action) => {
  switch (action.type) {
    case 'USER_DETAILS_REQUEST':
      return { 
        ...state,
        loading: true,
        error: null
      };
    
    case 'USER_DETAILS_SUCCESS':
      return { 
        ...state,
        loading: false, 
        user: action.payload 
      };
    
    case 'USER_DETAILS_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    case 'USER_DETAILS_RESET':
      return initialUserDetailsState;
    
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
export const userUpdateProfileReducer = (state = initialUserUpdateProfileState, action) => {
  switch (action.type) {
    case 'USER_UPDATE_PROFILE_REQUEST':
      return { 
        ...state,
        loading: true,
        success: false,
        error: null
      };
    
    case 'USER_UPDATE_PROFILE_SUCCESS':
      return { 
        ...state,
        loading: false, 
        success: true,
        userInfo: action.payload 
      };
    
    case 'USER_UPDATE_PROFILE_FAIL':
      return { 
        ...state,
        loading: false, 
        error: action.payload 
      };
    
    case 'USER_UPDATE_PROFILE_RESET':
      return initialUserUpdateProfileState;
    
    default:
      return state;
  }
};