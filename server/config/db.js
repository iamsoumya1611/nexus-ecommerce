const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGO_URI
      : (process.env.DEV_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');

    logger.info('Attempting to connect to MongoDB');
    logger.info('Environment:', process.env.NODE_ENV);
    logger.info('MongoURI present:', !!mongoURI);
    
    // Mask the mongoURI for security but show its structure
    if (mongoURI) {
      const maskedURI = mongoURI.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/, '$1****:****@');
      logger.info('MongoURI structure:', maskedURI);
    }

    // Add connection options to handle connection issues
    const conn = await mongoose.connect(mongoURI, {
      // Remove unsupported options and use only valid ones
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      retryWrites: true,
      maxPoolSize: 10, // Limit connection pool size
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`MongoDB Database Name: ${conn.connection.name}`);
    
    // Listen for connection events
    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected');
      
      // In development, try to reconnect
      if (process.env.NODE_ENV !== 'production') {
        logger.info('Attempting to reconnect to MongoDB in 5 seconds...');
        setTimeout(connectDB, 5000);
      }
    });
    
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    logger.error('Stack trace:', error.stack);
    
    // In production, we should not retry indefinitely as it may cause issues
    if (process.env.NODE_ENV === 'production') {
      logger.error('Production environment: Not retrying MongoDB connection');
      throw error;
    } else {
      // In development, retry the connection
      logger.info('Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    }
  }
};

// Add a health check function
const checkDBHealth = () => {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    isConnected: mongoose.connection.readyState === 1
  };
};

// Add additional logging for debugging
mongoose.set('debug', process.env.NODE_ENV !== 'production');

module.exports = connectDB;
module.exports.checkDBHealth = checkDBHealth;