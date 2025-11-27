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
    
    // Validate that id is a valid ObjectId string
    if (typeof id !== 'string' || id.length === 0) {
      throw new Error('User ID must be a non-empty string');
    }
    
    const token = jwt.sign({ id }, secret, {
      expiresIn: '30d',
    });
    return token;
  } catch (error) {
    throw new Error('Error generating authentication token');
  }
};

module.exports = { generateToken };