import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails, payOrder } from '../actions/orderActions';

const Order = () => {
  const { id } = useParams();

  const [sdkReady] = useState(false);

  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  useEffect(() => {
    if (!order || successPay || order._id !== id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, order, id, successPay]);

  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(id, paymentResult));
  };

  return loading ? (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  ) : error ? (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        {error}
      </div>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">Order {order._id}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6 mb-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-4">Shipping Information</h2>
            <div className="mb-4">
              <p className="text-primary-700 mb-2">
                <strong className="font-semibold">Name: </strong> {order.user.name}
              </p>
              <p className="text-primary-700 mb-2">
                <strong className="font-semibold">Email: </strong>
                <a href={`mailto:${order.user.email}`} className="text-primary-700 hover:underline">{order.user.email}</a>
              </p>
              <p className="text-primary-700 mb-2">
                <strong className="font-semibold">Address: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
            </div>
            <div className="mt-4">
              {order.isDelivered ? (
                <p className="text-success-700 font-semibold">
                  <i className="fas fa-check-circle mr-2"></i>
                  Delivered on {order.deliveredAt.substring(0, 10)}
                </p>
              ) : (
                <p className="text-error-700 font-semibold">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  Not Delivered
                </p>
              )}
            </div>
          </div>
          
          <div className="card p-6 mb-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-4">Payment Method</h2>
            <div className="mb-4">
              <p className="text-primary-700">
                <strong className="font-semibold">Method: </strong>
                {order.paymentMethod}
              </p>
            </div>
            <div className="mt-4">
              {order.isPaid ? (
                <p className="text-success-700 font-semibold">
                  <i className="fas fa-check-circle mr-2"></i>
                  Paid on {order.paidAt.substring(0, 10)}
                </p>
              ) : (
                <p className="text-error-700 font-semibold">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  Not Paid
                </p>
              )}
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-4">Order Items</h2>
            {order.orderItems.length === 0 ? (
              <p className="text-primary-700">Your order is empty</p>
            ) : (
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
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
                <span className="font-semibold">${order.itemsPrice}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-primary-700">Shipping</span>
                <span className="font-semibold">${order.shippingPrice}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-primary-700">Tax</span>
                <span className="font-semibold">${order.taxPrice}</span>
              </li>
              <li className="flex justify-between border-t border-primary-200 pt-3">
                <span className="text-lg font-bold text-primary-900">Total</span>
                <span className="text-lg font-bold text-primary-900">${order.totalPrice}</span>
              </li>
            </ul>
            {!order.isPaid && (
              <div>
                {loadingPay ? (
                  <div className="flex justify-center my-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : !sdkReady ? (
                  <div className="flex justify-center my-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : (
                  <div>
                    {/* Stripe payment button would go here */}
                    <button className="btn btn-primary w-full" onClick={successPaymentHandler}>
                      <i className="fas fa-credit-card mr-2"></i>
                      Pay Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;