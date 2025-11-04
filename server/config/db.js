const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MONGODB_URI for production and DEV_MONGO_URI for development
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGO_URI
      : (process.env.DEV_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;