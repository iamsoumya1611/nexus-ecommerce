const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  try {
    
    // Ensure we have a proper secret key
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    // Validate the user ID
    if (!id) {
      throw new Error('User ID is required to generate token');
    }
    
    // Convert ObjectId to string if it's an ObjectId object
    let userIdString = id;
    if (typeof id !== 'string') {
      if (id.toString && typeof id.toString === 'function') {
        userIdString = id.toString();
      } else {
        throw new Error('User ID must be a string or convertible to string');
      }
    }
    
    // Validate that id is a non-empty string
    if (userIdString.length === 0) {
      throw new Error('User ID must be a non-empty string');
    }
    
    const token = jwt.sign({ id: userIdString }, secret, {
      expiresIn: '30d',
    });
    return token;
  } catch (error) {
    // Re-throw the original error with more context
    throw new Error(`Error generating authentication token: ${error.message}`);
  }
};

module.exports = { generateToken };