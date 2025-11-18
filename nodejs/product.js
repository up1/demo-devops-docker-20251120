// product.js
const { getProductCache, setProductCache } = require('./redis_client');
const { getProductByIdDB } = require('./db');

/**
 * Validates if the product ID is a valid number
 * @param {string} productId - The product ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateProductId(productId) {
  return /^\d+$/.test(productId);
}

/**
 * Gets product by ID with caching logic
 * @param {string} productId - The product ID to fetch
 * @returns {Promise<Object>} - Product data or null if not found
 * @throws {Error} - If there's a system error
 */
async function getProductById(productId) {
  // Validate input
  if (!validateProductId(productId)) {
    throw new Error('Product ID must be a number.');
  }

  try {
    // Try to get from cache first
    let cachedProduct = null;
    
    try {
      cachedProduct = await getProductCache(productId);
    } catch (cacheError) {
      // Log cache error but continue to database
      console.warn(`Cache error for product ${productId}:`, cacheError.message);
    }
    
    if (cachedProduct) {
      return cachedProduct;
    }

    // If not in cache, get from database
    const dbProduct = await getProductByIdDB(productId);

    if (!dbProduct) {
      return null; // Product not found
    }

    // Try to save to cache for next time
    try {
      await setProductCache(dbProduct);
    } catch (cacheError) {
      // Log cache error but don't fail the request
      console.warn(`Cache set error for product ${productId}:`, cacheError.message);
    }

    return dbProduct;

  } catch (error) {
    // Re-throw with more context if it's our validation error
    if (error.message === 'Product ID must be a number.') {
      throw error;
    }
    
    // For other errors, wrap them as system errors
    throw new Error(`System error while fetching product: ${error.message}`);
  }
}

module.exports = {
  validateProductId,
  getProductById
};