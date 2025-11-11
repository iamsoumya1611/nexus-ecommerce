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
    <p>Loading...</p>
  ) : error ? (
    <p>{error}</p>
  ) : (
    <div>
      <h1>Order {order._id}</h1>
      <div className="row">
        <div className="col-md-8">
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <p className="text-success">Delivered on {order.deliveredAt}</p>
              ) : (
                <p className="text-danger">Not Delivered</p>
              )}
            </li>
            <li className="list-group-item">
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <p className="text-success">Paid on {order.paidAt}</p>
              ) : (
                <p className="text-danger">Not Paid</p>
              )}
            </li>
            <li className="list-group-item">
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <p>Your order is empty</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {order.orderItems.map((item, index) => (
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
                    <div className="col">${order.itemsPrice}</div>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="row">
                    <div className="col">Shipping</div>
                    <div className="col">${order.shippingPrice}</div>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="row">
                    <div className="col">Tax</div>
                    <div className="col">${order.taxPrice}</div>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="row">
                    <div className="col">Total</div>
                    <div className="col">${order.totalPrice}</div>
                  </div>
                </li>
              </ul>
              {!order.isPaid && (
                <div>
                  {loadingPay && <p>Loading...</p>}
                  {!sdkReady ? (
                    <p>Loading...</p>
                  ) : (
                    <div>
                      {/* Stripe payment button would go here */}
                      <button className="btn btn-primary" onClick={successPaymentHandler}>
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
    </div>
  );
};

export default Order;