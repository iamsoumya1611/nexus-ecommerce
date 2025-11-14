const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = model;