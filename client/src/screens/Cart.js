import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addToCart, removeFromCart } from '../actions/cartActions';

const Cart = () => {
  const { id } = useParams();
  const qty = useParams().qty || 1;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  React.useEffect(() => {
    if (id) {
      dispatch(addToCart(id, Number(qty)));
    }
  }, [dispatch, id, qty]);

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=shipping');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-shopping-cart text-5xl text-primary-300 mb-4"></i>
          <h3 className="text-2xl font-semibold text-primary-900 mb-4">Your cart is empty</h3>
          <Link to="/" className="btn btn-primary inline-flex items-center">
            <i className="fas fa-shopping-bag mr-2"></i>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product} className="card p-4 flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-24 h-24 object-cover rounded-lg" 
                    />
                  </div>
                  <div className="flex-grow">
                    <Link to={`/product/${item.product}`} className="text-lg font-semibold text-primary-900 hover:text-primary-700">
                      {item.name}
                    </Link>
                    <div className="mt-2">
                      <strong className="price text-xl">${item.price}</strong>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center">
                      <div className="mr-4 mb-2 sm:mb-0">
                        <label htmlFor={`qty-${item.product}`} className="block text-sm font-medium text-primary-700 mb-1">
                          Qty
                        </label>
                        <select
                          id={`qty-${item.product}`}
                          className="form-input"
                          value={item.qty}
                          onChange={(e) => dispatch(addToCart(item.product, Number(e.target.value)))}
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger self-start"
                        onClick={() => removeFromCartHandler(item.product)}
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="card p-6 sticky top-24">
              <h5 className="text-xl font-bold text-primary-900 mb-4">Order Summary</h5>
              <ul className="space-y-3 mb-4">
                <li className="flex justify-between">
                  <span>Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
                  <span>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </li>
                <li className="flex justify-between">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </li>
                <li className="flex justify-between font-bold text-lg border-t border-primary-200 pt-2">
                  <span>Total</span>
                  <span>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                </li>
              </ul>
              <button
                type="button"
                className="btn btn-primary w-full"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed To Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;