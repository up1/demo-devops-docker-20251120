// index.js
const express = require('express');
const { getProductById } = require('./product');
const { ExpressPrometheusMiddleware } = require('@matteodisabatino/express-prometheus-middleware')

const app = express();
const PORT = 3000;

// Prometheus middleware for metrics
const epm = new ExpressPrometheusMiddleware()
app.use(epm.handler);

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

  try {
    const product = await getProductById(productId);

    if (!product) {
      // Product not found = 404
      return res.status(404).json({
        message: `product id=${productId} not found in system`,
      });
    }

    // Success = 200
    return res.status(200).json(product);

  } catch (error) {
    console.error('Error fetching product:', error.message);
    
    // Check if it's a validation error
    if (error.message === 'Product ID must be a number.') {
      return res.status(400).json({ message: error.message });
    }
    
    // Error = 500
    return res.status(500).json({
      message: 'System error',
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Export app for testing
module.exports = app;

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}