const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    // MongoDB connection options for better performance and reliability
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`Database Name: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('Database Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;