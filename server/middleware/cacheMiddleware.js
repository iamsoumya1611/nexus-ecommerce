const redis = require('redis');
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Redis client configuration
let redisClient;

// Initialize Redis client only if REDIS_URL is provided
if (process.env.REDIS_URL) {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis connection refused');
          return new Error('Redis server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('Too many attempts to connect to Redis');
          return undefined;
        }
        logger.warn(`Retrying Redis connection in ${Math.min(options.attempt * 100, 3000)}ms`);
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', { error: err.message });
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis Client Reconnecting');
    });

    redisClient.on('end', () => {
      logger.info('Redis Client Connection Ended');
    });

    redisClient.connect().catch(logger.error);
  } catch (error) {
    logger.error('Failed to initialize Redis client', { error: error.message });
  }
} else {
  logger.warn('REDIS_URL not provided. Caching will be disabled.');
}

// Cache middleware
const cache = (key, duration = 300) => {
  return async (req, res, next) => {
    // If Redis is not configured, skip caching
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = `${key}_${req.originalUrl}`;

      // Try to get data from cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        logger.info('Cache hit', { cacheKey });
        return res.json(JSON.parse(cachedData));
      }

      // Override res.send to cache the response
      const originalSend = res.send;
      res.send = function (body) {
        try {
          // Cache the response
          redisClient.setEx(cacheKey, duration, body).catch(logger.error);
          logger.info('Cache set', { cacheKey, duration });
        } catch (error) {
          logger.error('Error caching response', { error: error.message, cacheKey });
        }
        // Call the original send method
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', { error: error.message });
      next();
    }
  };
};

// Clear cache middleware
const clearCache = (keyPattern) => {
  return async (req, res, next) => {
    // If Redis is not configured, skip cache clearing
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    try {
      // Get all keys matching the pattern
      const keys = await redisClient.keys(`${keyPattern}*`);
      
      if (keys.length > 0) {
        // Delete all matching keys
        await redisClient.del(keys);
        logger.info('Cache cleared', { keys: keys.length, pattern: keyPattern });
      }
    } catch (error) {
      logger.error('Error clearing cache', { error: error.message, pattern: keyPattern });
    }

    next();
  };
};

module.exports = {
  cache,
  clearCache,
  redisClient
};