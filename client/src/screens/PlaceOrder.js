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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">Place Order</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6 mb-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-4">Shipping Information</h2>
            <p className="text-primary-700">
              <strong className="font-semibold">Address: </strong>
              {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode},{' '}
              {shippingAddress.country}
            </p>
          </div>
          
          <div className="card p-6 mb-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-4">Payment Method</h2>
            <p className="text-primary-700">
              <strong className="font-semibold">Method: </strong>
              {paymentMethod}
            </p>
          </div>
          
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-4">Order Items</h2>
            {cartItems.length === 0 ? (
              <p className="text-primary-700">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center border-b border-primary-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-24 h-24 mr-4">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-grow">
                      <Link to={`/product/${item.product}`} className="text-lg font-semibold text-primary-900 hover:text-primary-700">
                        {item.name}
                      </Link>
                      <p className="text-primary-700 mt-2">
                        {item.qty} x ${item.price} = <strong className="font-semibold">${(item.qty * item.price).toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h5 className="text-xl font-bold text-primary-900 mb-4">Order Summary</h5>
            <ul className="space-y-3 mb-6">
              <li className="flex justify-between">
                <span className="text-primary-700">Items</span>
                <span className="font-semibold">${itemsPrice.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-primary-700">Shipping</span>
                <span className="font-semibold">${shippingPrice.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-primary-700">Tax</span>
                <span className="font-semibold">${taxPrice.toFixed(2)}</span>
              </li>
              <li className="flex justify-between border-t border-primary-200 pt-3">
                <span className="text-lg font-bold text-primary-900">Total</span>
                <span className="text-lg font-bold text-primary-900">${totalPrice}</span>
              </li>
            </ul>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {paymentMethod === 'Razorpay' ? (
              <button
                type="button"
                className="btn btn-primary w-full"
                disabled={cartItems.length === 0 || loading || paymentLoading}
                onClick={razorpayPaymentHandler}
              >
                {(loading || paymentLoading) ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : 'Pay with Razorpay'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary w-full"
                disabled={cartItems.length === 0 || loading}
                onClick={placeOrderHandler}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : 'Place Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;