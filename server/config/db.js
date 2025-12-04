const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        
        // Ensure we're connecting to the correct database
        const mongoUri = process.env.MONGO_URI;
        console.log('MONGO_URI:', mongoUri ? 'Defined' : 'Not defined');
        
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        
        console.log('Connecting to MongoDB with URI:', mongoUri.replace(/:\w+@/, ':***@')); // Hide password in logs
        
        // Check if the URI contains the database name
        if (mongoUri.includes('/nexus-ecommerce')) {
            console.log('URI correctly targets nexus-ecommerce database');
        } else {
            console.log('WARNING: URI does not target nexus-ecommerce database');
            console.log('Full URI:', mongoUri);
        }
        
        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            retryWrites: false,
            maxPoolSize: 10
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
};

module.exports = connectDB;