const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        
        // Ensure we're connecting to the correct database
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        
        // Parse the URI to ensure it includes the database name
        const uriParts = mongoUri.split('/');
        if (uriParts.length < 4 || !uriParts[3].includes('nexus-ecommerce')) {
            console.warn('Warning: MongoDB URI may not be pointing to nexus-ecommerce database');
            console.warn('Current URI:', mongoUri);
        }
        
        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        
        // Verify we're connected to the correct database
        if (conn.connection.name !== 'nexus-ecommerce') {
            console.warn('Warning: Connected to database:', conn.connection.name, 'instead of nexus-ecommerce');
        }
        
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;