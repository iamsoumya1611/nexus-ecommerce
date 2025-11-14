// Simple CORS test server
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5001;

// Enhanced CORS configuration for testing
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Test - Origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS Test - No origin, allowing');
      return callback(null, true);
    }
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://nexus-ecommerce-chi.vercel.app',
      'https://nexus-ecommerce-api.onrender.com'
    ];
    
    // Check if the origin is in our allowed list or if it's a Vercel subdomain
    if (allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
      console.log('CORS Test - Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('CORS Test - Origin blocked:', origin);
      console.log('CORS Test - Allowed origins:', allowedOrigins);
      callback(null, true); // Temporarily allow all for testing
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// Test route
app.post('/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`CORS Test Server running on port ${PORT}`);
  console.log('Test with: curl -X POST http://localhost:5001/test-cors -H "Origin: http://localhost:3000"');
});