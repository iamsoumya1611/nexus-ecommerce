// Simple login test script
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const { generateToken } = require('./config/jwt');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(express.json());

// Test login endpoint
app.post('/test-login', async (req, res) => {
  try {
    console.log('Test login attempt with:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Connect to database
    await connectDB();
    
    // Find user
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('Comparing passwords...');
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
      
      if (isMatch) {
        const token = generateToken(user._id);
        console.log('Token generated:', token ? 'Yes' : 'No');
        
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: token
        });
      }
    }
    
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Test login error:', error);
    return res.status(500).json({ message: 'Internal server error during test' });
  }
});

// Test register endpoint
app.post('/test-register', async (req, res) => {
  try {
    console.log('Test register attempt with:', req.body);
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Connect to database
    await connectDB();
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const user = await User.create({ name, email, password });
    console.log('User created:', user ? 'Yes' : 'No');
    
    if (user) {
      const token = generateToken(user._id);
      console.log('Token generated:', token ? 'Yes' : 'No');
      
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: token
      });
    }
    
    return res.status(400).json({ message: 'Invalid user data' });
  } catch (error) {
    console.error('Test register error:', error);
    return res.status(500).json({ message: 'Internal server error during test' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Login test server running on port ${PORT}`);
  console.log('Test with:');
  console.log('  curl -X POST http://localhost:5001/test-login -H "Content-Type: application/json" -d \'{"email":"test@example.com","password":"password123"}\'');
  console.log('  curl -X POST http://localhost:5001/test-register -H "Content-Type: application/json" -d \'{"name":"Test User","email":"test@example.com","password":"password123"}\'');
});