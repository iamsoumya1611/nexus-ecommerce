const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const generateToken = (id) => {
  try {
    logger.info(`Generating token for user ID: ${id}`);
    
    // Ensure we have a proper secret key
    const secret = process.env.JWT_SECRET;
    logger.info(`JWT_SECRET present: ${!!secret}`);
    
    if (!secret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    // Validate the user ID
    if (!id) {
      logger.error('User ID is required to generate token');
      throw new Error('User ID is required to generate token');
    }
    
    // Validate that id is a valid ObjectId string
    if (typeof id !== 'string' || id.length === 0) {
      logger.error('User ID must be a non-empty string');
      throw new Error('User ID must be a non-empty string');
    }
    
    logger.info('Generating JWT token with secret and user ID');
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