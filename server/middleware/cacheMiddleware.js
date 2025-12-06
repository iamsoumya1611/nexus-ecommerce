const redis = require('redis');

// Redis client configuration
let redisClient;

// Initialize Redis client only if REDIS_URL is provided
if (process.env.REDIS_URL) {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 30) {
            console.error('Too many Redis reconnection attempts');
            return new Error('Too many Redis reconnection attempts');
          }
          // Exponential backoff: 100ms, 200ms, 400ms, ... up to 30 seconds
          return Math.min(retries * 100, 30000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', { error: err.message });
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis Client Reconnecting');
    });

    redisClient.on('end', () => {
      console.log('Redis Client Connection Ended');
    });

    redisClient.connect().catch(err => {
      console.error('Failed to connect to Redis:', { error: err.message });
    });
  } catch (error) {
    console.error('Failed to initialize Redis client:', { error: error.message });
  }
}

// Cache middleware
const cache = (key, duration = 300) => {
  return async (req, res, next) => {
    // If Redis is not configured, skip caching
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    try {
      // Generate cache key with method and URL for better specificity
      const cacheKey = `${req.method}_${key}_${req.originalUrl}_${JSON.stringify(req.query)}`;

      // Try to get data from cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log('Cache hit:', { cacheKey });
        // Try to parse JSON, fallback to sending raw data
        try {
          const parsedData = JSON.parse(cachedData);
          return res.json(parsedData);
        } catch (parseError) {
          // If parsing fails, send raw data
          console.warn('Failed to parse cached JSON, sending raw data:', { 
            cacheKey, 
            error: parseError.message 
          });
          return res.send(cachedData);
        }
      }

      // Override res.send to cache the response
      const originalSend = res.send;
      res.send = function (body) {
        try {
          // Only cache successful responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Cache the response as JSON for better serialization
            redisClient.setEx(cacheKey, duration, typeof body === 'string' ? body : JSON.stringify(body)).catch(console.error);
            console.log('Cache set:', { cacheKey, duration, statusCode: res.statusCode });
          } else {
            console.debug('Skipping cache for non-success status code:', { 
              cacheKey, 
              statusCode: res.statusCode 
            });
          }
        } catch (error) {
          console.error('Error caching response:', { error: error.message, cacheKey });
        }
        // Call the original send method
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', { error: error.message });
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
        console.log('Cache cleared:', { keys: keys.length, pattern: keyPattern });
      }
    } catch (error) {
      console.error('Error clearing cache:', { error: error.message, pattern: keyPattern });
    }

    next();
  };
};

// Manual cache clear function
const clearCacheByKey = async (key) => {
  if (!redisClient || !redisClient.isOpen) {
    return false;
  }

  try {
    await redisClient.del(key);
    console.log('Cache entry manually cleared:', { key });
    return true;
  } catch (error) {
    console.error('Error manually clearing cache:', { error: error.message, key });
    return false;
  }
};

// Flush entire cache (use with caution)
const flushCache = async () => {
  if (!redisClient || !redisClient.isOpen) {
    return false;
  }

  try {
    await redisClient.flushAll();
    console.log('Entire cache flushed');
    return true;
  } catch (error) {
    console.error('Error flushing cache:', { error: error.message });
    return false;
  }
};

module.exports = {
  cache,
  clearCache,
  clearCacheByKey,
  flushCache,
  redisClient
};