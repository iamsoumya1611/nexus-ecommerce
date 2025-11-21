import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser, userActions } from '../contexts/UserContext';
import { useOrder, orderActions } from '../contexts/OrderContext';

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const { state: userState, dispatch: userDispatch } = useUser();
  const { details: userDetails, login: userLogin, updateProfile: userUpdateProfile } = userState;
  const { loading, error, user } = userDetails;
  const { userInfo } = userLogin;

  const { state: orderState, dispatch: orderDispatch } = useOrder();
  const { listMy: orderListMy } = orderState;
  const { loading: loadingOrders, error: errorOrders, orders } = orderListMy;

  useEffect(() => {
    if (!userInfo) {
      // Redirect to login if not logged in
    } else {
      if (!user || !user.name) {
        userActions.getUserDetails('profile')(userDispatch);
        orderActions.listMyOrders()(orderDispatch);
      } else {
        setName(user.name);
        setEmail(user.email);
      }
    }
  }, [userDispatch, orderDispatch, userInfo, user]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      userActions.updateUserProfile({ id: user._id, name, email, password })(userDispatch);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">User Profile</h2>
            {message && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{message}</div>}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {userUpdateProfile.success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Profile Updated Successfully!</div>}
            {loading && (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            )}
            <form onSubmit={submitHandler}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="form-input w-full"
                  id="name"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input w-full"
                  id="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="form-input w-full"
                  id="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-input w-full"
                  id="confirmPassword"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">My Orders</h2>
            {loadingOrders ? (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : errorOrders ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{errorOrders}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-primary-200">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">DATE</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">TOTAL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">PAID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">DELIVERED</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-primary-200">
                    {orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">{order._id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">{order.createdAt.substring(0, 10)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">${order.totalPrice}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">
                            {order.isPaid ? (
                              <span className="text-success-700">{order.paidAt.substring(0, 10)}</span>
                            ) : (
                              <i className="fas fa-times text-error-700"></i>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">
                            {order.isDelivered ? (
                              <span className="text-success-700">{order.deliveredAt.substring(0, 10)}</span>
                            ) : (
                              <i className="fas fa-times text-error-700"></i>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link to={`/order/${order._id}`} className="btn btn-light">
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-primary-700">
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;