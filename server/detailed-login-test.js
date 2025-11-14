// Detailed login test to identify the exact issue
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const { generateToken } = require('./config/jwt');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

dotenv.config();

const app = express();
app.use(express.json());

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    logger.info('Testing database connection...');
    const conn = await connectDB();
    const healthData = {
      connected: !!conn,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
    logger.info('Database health:', healthData);
    res.json(healthData);
  } catch (error) {
    logger.error('Database connection test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test user lookup
app.post('/test-user-lookup', async (req, res) => {
  try {
    const { email } = req.body;
    logger.info(`Testing user lookup for email: ${email}`);
    
    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    const user = await User.findOne({ email });
    logger.info('User lookup result:', user ? 'Found' : 'Not found');
    
    if (user) {
      logger.info('User data structure:', {
        _id: user._id,
        name: user.name,
        email: user.email,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      });
    }
    
    res.json({
      found: !!user,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email
      } : null
    });
  } catch (error) {
    logger.error('User lookup test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test password comparison
app.post('/test-password-compare', async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`Testing password comparison for email: ${email}`);
    
    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.info('User found, testing password comparison...');
    logger.info('Entered password length:', password ? password.length : 0);
    logger.info('Stored password length:', user.password ? user.password.length : 0);
    
    const isMatch = await bcrypt.compare(password, user.password);
    logger.info('Password match result:', isMatch);
    
    res.json({ match: isMatch });
  } catch (error) {
    logger.error('Password comparison test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test token generation
app.post('/test-token-generation', async (req, res) => {
  try {
    const { userId } = req.body;
    logger.info(`Testing token generation for user ID: ${userId}`);
    
    const token = generateToken(userId);
    logger.info('Token generated:', token ? 'Yes' : 'No');
    
    res.json({ token });
  } catch (error) {
    logger.error('Token generation test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test full login flow
app.post('/test-full-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`Testing full login flow for email: ${email}`);
    
    // Step 1: Database connection
    if (mongoose.connection.readyState !== 1) {
      logger.info('Connecting to database...');
      await connectDB();
    }
    
    // Step 2: User lookup
    logger.info('Looking up user...');
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('User not found');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Step 3: Password comparison
    logger.info('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Password mismatch');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Step 4: Token generation
    logger.info('Generating token...');
    const token = generateToken(user._id);
    
    // Step 5: Send response
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: token
    };
    
    logger.info('Login successful, sending response');
    res.json(responseData);
  } catch (error) {
    logger.error('Full login test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  logger.info(`Detailed login test server running on port ${PORT}`);
  logger.info('Test endpoints:');
  logger.info('  GET  /test-db - Test database connection');
  logger.info('  POST /test-user-lookup - Test user lookup');
  logger.info('  POST /test-password-compare - Test password comparison');
  logger.info('  POST /test-token-generation - Test token generation');
  logger.info('  POST /test-full-login - Test full login flow');
});