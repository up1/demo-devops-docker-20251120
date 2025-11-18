// redis_client.js
const e = require("express");
const Redis = require("ioredis");

// Replace with your Redis connection details
const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost", // default Redis host
  port: process.env.REDIS_PORT || 6379, // default Redis port
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// A function to get and set cache data
const REDIS_TTL = 3600; // Cache expiration time in seconds (1 hour)

/**
 * Gets a product from Redis by ID.
 * @param {string} productId - The ID of the product.
 * @returns {Promise<Object|null>} The product object or null if not found.
 */
const getProductCache = async (productId) => {
  try {
    const key = `product_${productId}`;
    const data = await redisClient.get(key);
    if (data) {
      // 2.1 Found = return data to client (in main route)
      console.log(`Cache Hit for product ${productId}`);
      return JSON.parse(data);
    }
    // 2.2 Not found go to step 3
    console.log(`Cache Miss for product ${productId}`);
    return null;
  } catch (error) {
    console.error("Redis GET error:", error);
    // Treat error as a cache miss to continue to database
    return null;
  }
};

/**
 * Sets a product into Redis.
 * @param {Object} product - The product data to cache.
 */
const setProductCache = async (product) => {
  try {
    // 3.2 save data into redis with key="product_" + :id, value=[JSON data]
    const key = `product_${product.id}`;
    
    await redisClient.set(key, JSON.stringify(product), "EX", REDIS_TTL);
    console.log(`Successfully cached product ${product.id}`);
  } catch (error) {
    console.error("Redis SET error:", error);
    // Log error but don't stop the main request flow
  }
};

module.exports = { getProductCache, setProductCache };
