// redis_client.js
const Redis = require("ioredis");

// Cache configuration
const REDIS_TTL = 3600; // Cache expiration time in seconds (1 hour)

/**
 * Creates a Redis client with the provided configuration
 * @param {Object} config - Redis connection configuration
 * @returns {Redis} Redis client instance
 */
function createRedisClient(config = {}) {
  const redisConfig = {
    host: config.host || process.env.REDIS_HOST || "localhost",
    port: config.port || process.env.REDIS_PORT || 6379,
    retryDelayOnFailover: config.retryDelayOnFailover || 100,
    maxRetriesPerRequest: config.maxRetriesPerRequest || 3,
    lazyConnect: config.lazyConnect || false,
    ...config
  };

  const client = new Redis(redisConfig);
  
  client.on("error", (err) => {
    console.error("Redis Client Error:", err.message);
  });

  client.on("connect", () => {
    console.log("Redis client connected");
  });

  return client;
}

// Default Redis client instance
let defaultRedisClient = null;

/**
 * Gets the default Redis client, creating it if it doesn't exist
 * @returns {Redis} Redis client instance
 */
function getRedisClient() {
  if (!defaultRedisClient) {
    defaultRedisClient = createRedisClient();
  }
  return defaultRedisClient;
}

/**
 * Sets a custom Redis client (useful for testing)
 * @param {Redis} client - Redis client instance
 */
function setRedisClient(client) {
  defaultRedisClient = client;
}

/**
 * Closes the Redis connection
 * @returns {Promise<void>}
 */
async function closeRedisConnection() {
  if (defaultRedisClient) {
    await defaultRedisClient.quit();
    defaultRedisClient = null;
  }
}

/**
 * Gets a product from Redis by ID.
 * @param {string} productId - The ID of the product.
 * @param {Redis} client - Optional Redis client (for testing)
 * @returns {Promise<Object|null>} The product object or null if not found.
 */
const getProductCache = async (productId, client = null) => {
  const redisClient = client || getRedisClient();
  
  try {
    const key = `product_${productId}`;
    const data = await redisClient.get(key);
    
    if (data) {
      console.log(`Cache Hit for product ${productId}`);
      return JSON.parse(data);
    }
    
    console.log(`Cache Miss for product ${productId}`);
    return null;
  } catch (error) {
    console.error("Redis GET error:", error.message);
    // Treat error as a cache miss to continue to database
    throw new Error(`Redis GET failed: ${error.message}`);
  }
};

/**
 * Sets a product into Redis.
 * @param {Object} product - The product data to cache.
 * @param {Redis} client - Optional Redis client (for testing)
 * @param {number} ttl - Optional TTL override
 * @returns {Promise<void>}
 */
const setProductCache = async (product, client = null, ttl = REDIS_TTL) => {
  const redisClient = client || getRedisClient();
  
  try {
    if (!product || !product.id) {
      throw new Error("Invalid product data: missing id");
    }

    const key = `product_${product.id}`;
    const value = JSON.stringify(product);
    
    await redisClient.set(key, value, "EX", ttl);
    console.log(`Successfully cached product ${product.id}`);
  } catch (error) {
    console.error("Redis SET error:", error.message);
    // Re-throw error to let calling code handle it
    throw new Error(`Redis SET failed: ${error.message}`);
  }
};

/**
 * Deletes a product from Redis cache
 * @param {string} productId - The ID of the product to delete
 * @param {Redis} client - Optional Redis client (for testing)
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
const deleteProductCache = async (productId, client = null) => {
  const redisClient = client || getRedisClient();
  
  try {
    const key = `product_${productId}`;
    const result = await redisClient.del(key);
    
    if (result === 1) {
      console.log(`Successfully deleted cached product ${productId}`);
      return true;
    }
    
    console.log(`Product ${productId} not found in cache`);
    return false;
  } catch (error) {
    console.error("Redis DELETE error:", error.message);
    throw new Error(`Redis DELETE failed: ${error.message}`);
  }
};

/**
 * Checks if Redis client is connected
 * @param {Redis} client - Optional Redis client (for testing)
 * @returns {Promise<boolean>} True if connected
 */
const isRedisConnected = async (client = null) => {
  const redisClient = client || getRedisClient();
  
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error("Redis PING error:", error.message);
    return false;
  }
};

module.exports = {
  // Core functions
  getProductCache,
  setProductCache,
  deleteProductCache,
  
  // Connection management
  createRedisClient,
  getRedisClient,
  setRedisClient,
  closeRedisConnection,
  isRedisConnected,
  
  // Constants
  REDIS_TTL
};
