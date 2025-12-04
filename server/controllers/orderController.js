const Order = require('../models/Order');
const Cart = require('../models/Cart');
const asyncHandler = require('express-async-handler');
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

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

    if (orderItems && orderItems.length === 0) {
      logger.warn('Attempt to create order with no items', {
        userId: req.user._id
      });
      
      res.status(400);
      throw new Error('No order items');
    } else {
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
      
      // Clear cart after order creation
      await Cart.findOneAndDelete({ user: req.user._id });
      
      logger.info('Order created successfully', {
        orderId: createdOrder._id,
        userId: req.user._id,
        totalAmount: totalPrice,
        itemCount: orderItems.length
      });

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    logger.error('Error creating order', {
      error: error.message,
      userId: req.user._id,
      body: req.body
    });
    
    throw error;
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (order) {
      logger.info('Order fetched successfully', {
        orderId: order._id,
        userId: req.user._id
      });
      
      res.json(order);
    } else {
      logger.warn('Order not found', {
        orderId: req.params.id,
        userId: req.user._id
      });
      
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    logger.error('Error fetching order', {
      error: error.message,
      orderId: req.params.id,
      userId: req.user._id
    });
    
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('Order not found');
    }
    
    throw error;
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id || req.body.razorpay_payment_id || 'payment_id',
        status: req.body.status || 'completed',
        update_time: Date.now(),
        email_address: req.user.email,
      };

      const updatedOrder = await order.save();
      
      logger.info('Order marked as paid', {
        orderId: updatedOrder._id,
        userId: req.user._id,
        paymentId: order.paymentResult.id
      });

      res.json(updatedOrder);
    } else {
      logger.warn('Attempt to update payment for non-existent order', {
        orderId: req.params.id,
        userId: req.user._id
      });
      
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    logger.error('Error updating order payment status', {
      error: error.message,
      orderId: req.params.id,
      userId: req.user._id
    });
    
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('Order not found');
    }
    
    throw error;
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      
      logger.info('Order marked as delivered', {
        orderId: updatedOrder._id,
        updatedBy: req.user._id
      });

      res.json(updatedOrder);
    } else {
      logger.warn('Attempt to update delivery status for non-existent order', {
        orderId: req.params.id,
        userId: req.user._id
      });
      
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    logger.error('Error updating order delivery status', {
      error: error.message,
      orderId: req.params.id,
      userId: req.user._id
    });
    
    if (error.name === 'CastError') {
      res.status(404);
      throw new Error('Order not found');
    }
    
    throw error;
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    
    logger.info('User orders fetched successfully', {
      userId: req.user._id,
      orderCount: orders.length
    });
    
    res.json(orders);
  } catch (error) {
    logger.error('Error fetching user orders', {
      error: error.message,
      userId: req.user._id
    });
    
    throw error;
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    
    logger.info('All orders fetched successfully', {
      orderCount: orders.length
    });
    
    res.json(orders);
  } catch (error) {
    logger.error('Error fetching all orders', {
      error: error.message
    });
    
    throw error;
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