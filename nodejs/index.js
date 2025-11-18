// index.js
const express = require('express');
const { getProductCache, setProductCache } = require('./redis_client');
const { getProductByIdDB } = require('./db');

const app = express();
const PORT = 3000;

/**
 * GET /products/:id - Get product details by ID with Redis caching.
 *
 * Business Flow:
 * 1. Send request to GET /products/:id with number only
 * 2. Get data from redis server
 * 3. Get data from database if cache miss
 * 4. return result to client/user
 */
app.get('/products/:id', async (req, res) => {
  const productId = req.params.id;

  // 1. Validate input
  if (!/^\d+$/.test(productId)) {
    return res.status(400).json({ message: 'Product ID must be a number.' });
  }

  try {
    // --- Caching Attempt (Step 2) ---
    const cachedProduct = await getProductCache(productId);

    if (cachedProduct) {
      // 2.1 Found = return data to client
      // 4. return result to client/user
      return res.status(200).json(cachedProduct);
    }

    // --- Database Fetch (Step 3) ---
    const dbProduct = await getProductByIdDB(productId);

    if (!dbProduct) {
      // Product not found = 404
      return res.status(404).json({
        message: `product id=${productId} not found in system`,
      });
    }

    // --- Cache Update (Step 3.2) ---
    // Save the DB result back into Redis for next time.
    await setProductCache(dbProduct);

    // 4. return result to client/user
    // Success = 200
    return res.status(200).json(dbProduct);

  } catch (error) {
    console.error('Error fetching product:', error.message);
    // Error = 500
    return res.status(500).json({
      message: 'System error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});