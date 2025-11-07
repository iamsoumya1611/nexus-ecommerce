import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../actions/orderActions';
import { processPayment } from '../actions/paymentActions';

const PlaceOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingAddress, paymentMethod } = cart;

  // Calculate prices
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

  const orderCreate = useSelector((state) => state.orderCreate);
  const { order, success, error } = orderCreate;

  const paymentProcess = useSelector((state) => state.paymentProcess);
  const { loading: paymentLoading } = paymentProcess;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (success) {
      navigate(`/order/${order._id}`);
    }
  }, [navigate, success, order]);

  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      
      // Create order first
      const orderData = {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice
      };
      
      dispatch(createOrder(orderData));
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  };

  const razorpayPaymentHandler = async () => {
    try {
      setLoading(true);
      
      // Process payment through Razorpay
      const paymentData = await dispatch(processPayment(
        Math.round(parseFloat(totalPrice) * 100) / 100, // Convert to proper format
        'INR',
        `order_${Date.now()}`
      ));
      
      if (paymentData && paymentData.success) {
        // Load Razorpay SDK
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        script.onload = () => {
          const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
            amount: paymentData.order.amount,
            currency: paymentData.order.currency,
            name: 'Nexus E-commerce',
            description: 'Test Transaction',
            order_id: paymentData.order.id,
            handler: async function (response) {
              // Payment successful, create order
              placeOrderHandler();
            },
            prefill: {
              name: shippingAddress.firstName + ' ' + shippingAddress.lastName,
              email: 'customer@example.com',
              contact: '9999999999'
            },
            theme: {
              color: '#3399cc'
            }
          };
          
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-md-8">
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <h2>Shipping</h2>
              <p>
                <strong>Address: </strong>
                {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode},{' '}
                {shippingAddress.country}
              </p>
            </li>
            <li className="list-group-item">
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {paymentMethod}
              </p>
            </li>
            <li className="list-group-item">
              <h2>Order Items</h2>
              {cartItems.length === 0 ? (
                <p>Your cart is empty</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {cartItems.map((item, index) => (
                    <li key={index} className="list-group-item">
                      <div className="row">
                        <div className="col-md-2">
                          <img src={item.image} alt={item.name} className="img-fluid" />
                        </div>
                        <div className="col-md-4">
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </div>
                        <div className="col-md-6">
                          {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Order Summary</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <div className="row">
                    <div className="col">Items</div>
                    <div className="col">${itemsPrice.toFixed(2)}</div>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="row">
                    <div className="col">Shipping</div>
                    <div className="col">${shippingPrice.toFixed(2)}</div>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="row">
                    <div className="col">Tax</div>
                    <div className="col">${taxPrice.toFixed(2)}</div>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="row">
                    <div className="col">Total</div>
                    <div className="col">${totalPrice}</div>
                  </div>
                </li>
              </ul>
              {error && <p className="text-danger">{error}</p>}
              {paymentMethod === 'Razorpay' ? (
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  disabled={cartItems.length === 0 || loading || paymentLoading}
                  onClick={razorpayPaymentHandler}
                >
                  {(loading || paymentLoading) ? 'Processing...' : 'Pay with Razorpay'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  disabled={cartItems.length === 0 || loading}
                  onClick={placeOrderHandler}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;