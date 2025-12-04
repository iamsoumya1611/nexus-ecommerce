const mongoose = require('mongoose');
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const connectDB = async () => {
  try {
    // Log the connection URI (masked for security)
    logger.info('Attempting MongoDB connection');
    if (process.env.MONGO_URI) {
      const uriParts = process.env.MONGO_URI.split('@');
      if (uriParts.length > 1) {
        const maskedUri = `mongodb+srv://****:${uriParts[1].substring(0, 20)}...`;
        logger.info('Connection URI format', { maskedUri });
      }
    }

    // Add connection options for production based on MongoDB Atlas requirements
    // Note: Removed deprecated options that are not supported in newer MongoDB drivers
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+
      // Additional production options for MongoDB Atlas
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Limit connection pool size
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('MongoDB Connection Failed:', { 
      message: error.message,
      stack: error.stack
    });
    
    // Log the URI being used (masked for security)
    if (process.env.MONGO_URI) {
      logger.error('Connection URI provided', { 
        length: process.env.MONGO_URI.length 
      });
    } else {
      logger.error('No MONGO_URI provided in environment variables');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;