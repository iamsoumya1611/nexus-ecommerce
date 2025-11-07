const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Use MONGODB_URI for production and DEV_MONGO_URI for development
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGO_URI
      : (process.env.DEV_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');

    logger.info('Attempting to connect to MongoDB with URI:', mongoURI);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

module.exports = connectDB;