const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGO_URI
      : (process.env.DEV_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');

    logger.info('Attempting to connect to MongoDB');
    logger.info('Environment:', process.env.NODE_ENV);
    
    // Add connection options to handle connection issues
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Remove unsupported options and use only valid ones
      serverSelectionTimeoutMS: 30000, // Increase server selection timeout
      socketTimeoutMS: 45000, // Increase socket timeout
      retryWrites: true
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    logger.error('Stack trace:', error.stack);
    // Instead of exiting, we'll retry the connection
    logger.info('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Listen for connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected');
  // Try to reconnect
  setTimeout(connectDB, 5000);
});

// Handle application shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose disconnected through app termination');
  process.exit(0);
});

module.exports = connectDB;