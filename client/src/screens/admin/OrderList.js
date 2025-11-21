import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin, adminActions } from '../../contexts/AdminContext';
import { useUser } from '../../contexts/UserContext';

const OrderList = () => {
  const { state: adminState, dispatch: adminDispatch } = useAdmin();
  const { orderList: adminOrderList } = adminState;
  const { loading, error, orders } = adminOrderList;

  const { state: userState } = useUser();
  const { login: userLogin } = userState;
  const { userInfo } = userLogin;

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      adminActions.listOrders()(adminDispatch);
    }
  }, [adminDispatch, userInfo]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">Orders</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          {error}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary-200">
              <thead className="bg-primary-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    USER
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    DATE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    TOTAL
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    PAID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    DELIVERED
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-primary-700 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-primary-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-primary-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      {order._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      {order.user && order.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      {order.createdAt.substring(0, 10)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      ${order.totalPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      {order.isPaid ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {order.paidAt.substring(0, 10)}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Not Paid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      {order.isDelivered ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {order.deliveredAt.substring(0, 10)}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Not Delivered
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/order/${order._id}`}
                        className="btn btn-light"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;