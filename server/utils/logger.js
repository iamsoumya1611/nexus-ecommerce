const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (err) {
    console.log('Could not create logs directory:', err.message);
  }
}

// Create a logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nexus-ecommerce' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    // Only create file transports if logs directory exists
    ...(fs.existsSync(logsDir) ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      // Write all logs with level `info` and below to `combined.log`
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ] : []),
  ],
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Always add console transport in production for Render logs
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));
}

module.exports = logger;