// Product Admin Reducers
export const adminProductListReducer = (state = { products: [] }, action) => {
  switch (action.type) {
    case 'ADMIN_PRODUCT_LIST_REQUEST':
      return { loading: true, products: [] };
    case 'ADMIN_PRODUCT_LIST_SUCCESS':
      return {
        loading: false,
        products: action.payload
      };
    case 'ADMIN_PRODUCT_LIST_FAIL':
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const productDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case 'PRODUCT_DELETE_REQUEST':
      return { loading: true };
    case 'PRODUCT_DELETE_SUCCESS':
      return { loading: false, success: true };
    case 'PRODUCT_DELETE_FAIL':
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const productCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case 'PRODUCT_CREATE_REQUEST':
      return { loading: true };
    case 'PRODUCT_CREATE_SUCCESS':
      return { loading: false, success: true, product: action.payload };
    case 'PRODUCT_CREATE_FAIL':
      return { loading: false, error: action.payload };
    case 'PRODUCT_CREATE_RESET':
      return {};
    default:
      return state;
  }
};

// User Admin Reducers
export const adminUserListReducer = (state = { users: [] }, action) => {
  switch (action.type) {
    case 'ADMIN_USER_LIST_REQUEST':
      return { loading: true, users: [] };
    case 'ADMIN_USER_LIST_SUCCESS':
      return {
        loading: false,
        users: action.payload
      };
    case 'ADMIN_USER_LIST_FAIL':
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const userDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case 'USER_DELETE_REQUEST':
      return { loading: true };
    case 'USER_DELETE_SUCCESS':
      return { loading: false, success: true };
    case 'USER_DELETE_FAIL':
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const userUpdateAdminReducer = (state = {}, action) => {
  switch (action.type) {
    case 'USER_UPDATE_ADMIN_REQUEST':
      return { loading: true };
    case 'USER_UPDATE_ADMIN_SUCCESS':
      return { loading: false, success: true };
    case 'USER_UPDATE_ADMIN_FAIL':
      return { loading: false, error: action.payload };
    case 'USER_UPDATE_ADMIN_RESET':
      return {};
    default:
      return state;
  }
};

// Order Admin Reducers
export const adminOrderListReducer = (state = { orders: [] }, action) => {
  switch (action.type) {
    case 'ADMIN_ORDER_LIST_REQUEST':
      return { loading: true, orders: [] };
    case 'ADMIN_ORDER_LIST_SUCCESS':
      return {
        loading: false,
        orders: action.payload
      };
    case 'ADMIN_ORDER_LIST_FAIL':
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const orderDeliverReducer = (state = {}, action) => {
  switch (action.type) {
    case 'ORDER_DELIVER_REQUEST':
      return { loading: true };
    case 'ORDER_DELIVER_SUCCESS':
      return { loading: false, success: true };
    case 'ORDER_DELIVER_FAIL':
      return { loading: false, error: action.payload };
    case 'ORDER_DELIVER_RESET':
      return {};
    default:
      return state;
  }
};