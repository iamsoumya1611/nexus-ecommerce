const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    console.log('Admin fetching dashboard statistics:', { adminId: req.user._id });
    
    // Get counts concurrently
    const [
      usersCount,
      productsCount,
      ordersCount,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    const stats = {
      users: usersCount,
      products: productsCount,
      orders: ordersCount,
      totalRevenue: totalRevenue[0]?.total || 0
    };

    console.log('Admin dashboard statistics fetched:', stats);
    
    res.json(successResponse(stats, 'Dashboard statistics fetched successfully'));
  } catch (error) {
    console.error('Error fetching dashboard statistics:', {
      error: error.message,
      adminId: req.user._id
    });
    
    res.status(500).json(errorResponse(error, 'Failed to fetch dashboard statistics'));
  }
});

// @desc    Get sales report
// @route   GET /api/admin/dashboard/sales-report
// @access  Private/Admin
const getSalesReport = asyncHandler(async (req, res) => {
  try {
    console.log('Admin fetching sales report:', { adminId: req.user._id });
    
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get daily sales data
    const salesData = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startDate } } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          quantity: { $sum: "$orderItems.qty" },
          revenue: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          name: "$productInfo.name",
          image: "$productInfo.image",
          quantity: 1,
          revenue: 1
        }
      }
    ]);

    const report = {
      period: `${days} days`,
      salesData,
      topProducts
    };

    console.log('Sales report generated:', { 
      adminId: req.user._id,
      days,
      dataPoints: salesData.length,
      topProducts: topProducts.length
    });
    
    res.json(successResponse(report, 'Sales report generated successfully'));
  } catch (error) {
    console.error('Error generating sales report:', {
      error: error.message,
      adminId: req.user._id
    });
    
    res.status(500).json(errorResponse(error, 'Failed to generate sales report'));
  }
});

// @desc    Get user analytics
// @route   GET /api/admin/dashboard/users
// @access  Private/Admin
const getUserAnalytics = asyncHandler(async (req, res) => {
  try {
    console.log('Admin fetching user analytics:', { adminId: req.user._id });
    
    // Get user registration trends
    const userTrends = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get user role distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: "$isAdmin",
          count: { $sum: 1 }
        }
      }
    ]);

    const analytics = {
      userTrends,
      roleDistribution: {
        regularUsers: roleDistribution.find(item => item._id === false)?.count || 0,
        adminUsers: roleDistribution.find(item => item._id === true)?.count || 0
      },
      totalUsers: await User.countDocuments()
    };

    console.log('User analytics generated:', { 
      adminId: req.user._id,
      totalUsers: analytics.totalUsers
    });
    
    res.json(successResponse(analytics, 'User analytics generated successfully'));
  } catch (error) {
    console.error('Error generating user analytics:', {
      error: error.message,
      adminId: req.user._id
    });
    
    res.status(500).json(errorResponse(error, 'Failed to generate user analytics'));
  }
});

module.exports = {
  getDashboardStats,
  getSalesReport,
  getUserAnalytics
};