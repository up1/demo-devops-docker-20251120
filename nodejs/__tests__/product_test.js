// __tests__/product_test.js
const request = require('supertest');
const app = require('../index');

// Mock the product module
jest.mock('../product');
const { getProductById } = require('../product');

describe('Product API Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /products/:id', () => {
    it('should return 200 and product data when product exists', async () => {
      // Arrange
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        description: 'Test Description'
      };
      getProductById.mockResolvedValue(mockProduct);

      // Act
      const response = await request(app)
        .get('/products/1')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockProduct);
      expect(getProductById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when product does not exist', async () => {
      // Arrange
      getProductById.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .get('/products/999')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        message: 'product id=999 not found in system'
      });
      expect(getProductById).toHaveBeenCalledWith('999');
    });

    it('should return 400 when product ID is invalid', async () => {
      // Arrange
      getProductById.mockRejectedValue(new Error('Product ID must be a number.'));

      // Act
      const response = await request(app)
        .get('/products/abc')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        message: 'Product ID must be a number.'
      });
      expect(getProductById).toHaveBeenCalledWith('abc');
    });

    it('should return 500 when system error occurs', async () => {
      // Arrange
      getProductById.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .get('/products/1')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        message: 'System error'
      });
      expect(getProductById).toHaveBeenCalledWith('1');
    });

    it('should handle special characters in product ID', async () => {
      // Arrange
      getProductById.mockRejectedValue(new Error('Product ID must be a number.'));

      // Act
      const response = await request(app)
        .get('/products/@#$')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        message: 'Product ID must be a number.'
      });
    });

    it('should handle empty product ID', async () => {
      // Arrange
      getProductById.mockRejectedValue(new Error('Product ID must be a number.'));

      // Act
      const response = await request(app)
        .get('/products/')
        .expect(404); // Express returns 404 for empty route param

      // Assert
      // This will hit a different route or return 404 from Express routing
    });
  });

  describe('GET /health', () => {
    it('should return 200 OK for health check', async () => {
      // Act
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Assert
      expect(response.text).toBe('OK');
    });
  });

  describe('Error handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      getProductById.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const response = await request(app)
        .get('/products/1')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        message: 'System error'
      });
    });
  });

  describe('Product ID validation scenarios', () => {
    it('should accept valid numeric product IDs', async () => {
      // Arrange
      const mockProduct = { id: 123, name: 'Valid Product' };
      getProductById.mockResolvedValue(mockProduct);

      // Act
      const response = await request(app)
        .get('/products/123')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockProduct);
      expect(getProductById).toHaveBeenCalledWith('123');
    });

    it('should reject negative numbers', async () => {
      // Arrange
      getProductById.mockRejectedValue(new Error('Product ID must be a number.'));

      // Act
      await request(app)
        .get('/products/-1')
        .expect(400);

      // Assert
      expect(getProductById).toHaveBeenCalledWith('-1');
    });

    it('should reject decimal numbers', async () => {
      // Arrange
      getProductById.mockRejectedValue(new Error('Product ID must be a number.'));

      // Act
      await request(app)
        .get('/products/1.5')
        .expect(400);

      // Assert
      expect(getProductById).toHaveBeenCalledWith('1.5');
    });
  });
});
