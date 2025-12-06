import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { ClipLoader } from 'react-spinners';
import LoadingSpinner from '../../components/LoadingSpinner';

const Dashboard = () => {
  const { getDashboardStats, dashboardStats, loading, error } = useAdmin();
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    getDashboardStats();
  }, [getDashboardStats]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-primary-700">Time Range:</span>
          <select 
            className="form-input"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <i className="fas fa-shopping-cart text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-primary-700">Total Sales</p>
              <h3 className="text-2xl font-bold text-primary-900">
                {dashboardStats?.totalSales ? formatCurrency(dashboardStats.totalSales) : '₹0'}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <i className="fas fa-users text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="text-primary-700">Customers</p>
              <h3 className="text-2xl font-bold text-primary-900">
                {dashboardStats?.customers ? formatNumber(dashboardStats.customers) : '0'}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <i className="fas fa-box text-purple-600 text-xl"></i>
            </div>
            <div>
              <p className="text-primary-700">Products</p>
              <h3 className="text-2xl font-bold text-primary-900">
                {dashboardStats?.products ? formatNumber(dashboardStats.products) : '0'}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <i className="fas fa-tags text-yellow-600 text-xl"></i>
            </div>
            <div>
              <p className="text-primary-700">Orders</p>
              <h3 className="text-2xl font-bold text-primary-900">
                {dashboardStats?.orders ? formatNumber(dashboardStats.orders) : '0'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-primary-900 mb-6">Revenue Overview</h2>
          <div className="h-80 flex items-center justify-center">
            <p className="text-primary-700">Chart visualization would go here</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-primary-900 mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardStats?.recentOrders?.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">#{order._id.substring(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">{order.user?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.isDelivered 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.isDelivered ? 'Delivered' : 'Processing'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;