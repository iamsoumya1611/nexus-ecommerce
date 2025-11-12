const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const generateToken = (id) => {
  try {
    // Ensure we have a proper secret key
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    // Validate the user ID
    if (!id) {
      logger.error('User ID is required to generate token');
      throw new Error('User ID is required to generate token');
    }
    
    logger.info('Generating token for user ID:', id);
    const token = jwt.sign({ id }, secret, {
      expiresIn: '30d',
    });
    logger.info('Token generated successfully');
    return token;
  } catch (error) {
    logger.error('Error generating JWT token:', {
      message: error.message,
      stack: error.stack,
      userId: id
    });
    throw new Error('Error generating authentication token');
  }
};

module.exports = { generateToken };