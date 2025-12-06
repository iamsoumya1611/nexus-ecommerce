const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  badRequestResponse,
  forbiddenResponse
} = require('../utils/apiResponse');

// Add the ObjectId validator
const { isValidObjectId } = require('../utils/objectIdValidator');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    // Validate required fields
    if (!orderItems || orderItems.length === 0) {
      console.warn('No order items provided:', { userId: req.user._id });
      return res.status(400).json(badRequestResponse('No order items'));
    }

    // Validate each order item
    for (const item of orderItems) {
      if (!item.product || !item.qty || !item.price) {
        console.warn('Invalid order item data:', { 
          userId: req.user._id, 
          item 
        });
        return res.status(400).json(badRequestResponse('Invalid order item data'));
      }
    }

    // Create order
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    
    console.log('Order created successfully:', {
      orderId: createdOrder._id,
      userId: req.user._id,
      total: totalPrice
    });

    res.status(201).json(successResponse(createdOrder, 'Order created successfully', 201));
  } catch (error) {
    console.error('Error creating order:', {
      error: error.message,
      stack: error.stack,
      userId: req.user._id,
      body: req.body
    });
    
    return res.status(500).json(errorResponse(error, 'Failed to create order'));
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  try {
    // Validate ObjectId format using utility
    if (!isValidObjectId(req.params.id)) {
      console.warn('Invalid order ID format:', {
        orderId: req.params.id,
        userId: req.user._id
      });
      
      return res.status(400).json(badRequestResponse('Invalid order ID format'));
    }
    
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image price')
      .lean();

    if (order) {
      // Check if user is authorized to view this order
      if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        console.warn('Unauthorized access to order:', {
          orderId: order._id,
          userId: req.user._id
        });
        
        return res.status(403).json(forbiddenResponse('Not authorized to view this order'));
      }
      
      console.log('Order fetched successfully:', {
        orderId: order._id,
        userId: req.user._id
      });
      
      res.json(successResponse(order, 'Order fetched successfully'));
    } else {
      console.warn('Order not found:', {
        orderId: req.params.id,
        userId: req.user._id
      });
      
      res.status(404).json(notFoundResponse('Order'));
    }
  } catch (error) {
    console.error('Error fetching order:', {
      error: error.message,
      orderId: req.params.id,
      userId: req.user._id
    });
    
    if (error.name === 'CastError') {
      res.status(404).json(notFoundResponse('Order'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to fetch order'));
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    // Validate ObjectId format using utility
    if (!isValidObjectId(req.params.id)) {
      console.warn('Invalid order ID format for payment update:', {
        orderId: req.params.id,
        userId: req.user._id
      });
      
      return res.status(400).json(badRequestResponse('Invalid order ID format'));
    }
    
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer?.email_address,
      };

      const updatedOrder = await order.save();
      
      console.log('Order marked as paid:', {
        orderId: updatedOrder._id,
        updatedBy: req.user._id
      });

      res.json(successResponse(updatedOrder, 'Order marked as paid'));
    } else {
      console.warn('Attempt to update payment status for non-existent order:', {
        orderId: req.params.id,
        userId: req.user._id
      });
      
      res.status(404).json(notFoundResponse('Order'));
    }
  } catch (error) {
    console.error('Error updating order payment status:', {
      error: error.message,
      orderId: req.params.id,
      userId: req.user._id
    });
    
    if (error.name === 'CastError') {
      res.status(404).json(notFoundResponse('Order'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to update order payment status'));
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  try {
    // Validate ObjectId format using utility
    if (!isValidObjectId(req.params.id)) {
      console.warn('Invalid order ID format for delivery update:', {
        orderId: req.params.id,
        userId: req.user._id
      });
      
      return res.status(400).json(badRequestResponse('Invalid order ID format'));
    }
    
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      
      console.log('Order marked as delivered:', {
        orderId: updatedOrder._id,
        updatedBy: req.user._id
      });

      res.json(successResponse(updatedOrder, 'Order marked as delivered'));
    } else {
      console.warn('Attempt to update delivery status for non-existent order:', {
        orderId: req.params.id,
        userId: req.user._id
      });
      
      res.status(404).json(notFoundResponse('Order'));
    }
  } catch (error) {
    console.error('Error updating order delivery status:', {
      error: error.message,
      orderId: req.params.id,
      userId: req.user._id
    });
    
    if (error.name === 'CastError') {
      res.status(404).json(notFoundResponse('Order'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to update order delivery status'));
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    
    console.log('User orders fetched successfully:', {
      userId: req.user._id,
      orderCount: orders.length
    });
    
    res.json(successResponse(orders, 'User orders fetched successfully'));
  } catch (error) {
    console.error('Error fetching user orders:', {
      error: error.message,
      userId: req.user._id
    });
    
    res.status(500).json(errorResponse(error, 'Failed to fetch user orders'));
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    
    console.log('All orders fetched successfully:', {
      orderCount: orders.length
    });
    
    res.json(successResponse(orders, 'All orders fetched successfully'));
  } catch (error) {
    console.error('Error fetching all orders:', {
      error: error.message
    });
    
    res.status(500).json(errorResponse(error, 'Failed to fetch orders'));
  }
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
};