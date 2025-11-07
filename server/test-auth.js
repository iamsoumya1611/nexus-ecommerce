const mongoose = require('mongoose');
const User = require('./models/User');
const { generateToken } = require('./config/jwt');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

// Database connection
const connectDB = require('./config/db');

const testAuth = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Database connected successfully');
    
    // Test user registration
    console.log('Testing user registration...');
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    await user.save();
    console.log('User registered successfully');
    
    // Test password hashing
    const isMatch = await user.matchPassword('password123');
    console.log('Password match result:', isMatch);
    
    // Test JWT token generation
    const token = generateToken(user._id);
    console.log('Token generated:', token);
    
    // Test user login
    console.log('Testing user login...');
    const foundUser = await User.findOne({ email: 'test@example.com' });
    if (foundUser && await foundUser.matchPassword('password123')) {
      console.log('User login successful');
    } else {
      console.log('User login failed');
    }
    
    // Clean up test user
    await User.deleteOne({ email: 'test@example.com' });
    console.log('Test user cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testAuth();