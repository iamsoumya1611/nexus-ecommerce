const mongoose = require('mongoose');
require('dotenv').config();

// Check if MONGO_URI is defined
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

console.log('MONGO_URI:', process.env.MONGO_URI);

// Parse the URI to check if it includes the database name
const uriParts = process.env.MONGO_URI.split('/');
if (uriParts.length >= 4) {
  console.log('Database name in URI:', uriParts[3].split('?')[0]);
} else {
  console.log('Could not determine database name from URI');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async (conn) => {
  console.log(`Connected to MongoDB: ${conn.connection.host}`);
  console.log(`Actual database name: ${conn.connection.name}`);
  
  // List all collections in the database
  const collections = await conn.connection.db.listCollections().toArray();
  console.log('Collections in database:', collections.map(c => c.name));
  
  // Check if User collection exists and count users
  const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    password: String
  }));
  
  try {
    const userCount = await User.countDocuments();
    console.log(`Number of users in ${conn.connection.name} database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find({}, 'name email').limit(5);
      console.log('Sample users:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email})`);
      });
    }
  } catch (error) {
    console.log('Error checking users:', error.message);
  }
  
  // Disconnect
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
  process.exit(0);
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
  process.exit(1);
});