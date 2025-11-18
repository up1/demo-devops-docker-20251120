// __tests__/product.unit.test.js
const { validateProductId, getProductById } = require('../product');

// Mock the dependencies
jest.mock('../redis_client');
jest.mock('../db');

const { getProductCache, setProductCache } = require('../redis_client');
const { getProductByIdDB } = require('../db');

describe('Product Module Unit Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('validateProductId', () => {
    it('should return true for valid numeric strings', () => {
      expect(validateProductId('123')).toBe(true);
      expect(validateProductId('1')).toBe(true);
      expect(validateProductId('999999')).toBe(true);
    });

    it('should return false for non-numeric strings', () => {
      expect(validateProductId('abc')).toBe(false);
      expect(validateProductId('12a')).toBe(false);
      expect(validateProductId('a123')).toBe(false);
      expect(validateProductId('')).toBe(false);
    });

    it('should return false for special characters', () => {
      expect(validateProductId('@#$')).toBe(false);
      expect(validateProductId('12.3')).toBe(false);
      expect(validateProductId('-123')).toBe(false);
      expect(validateProductId('+123')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(validateProductId(null)).toBe(false);
      expect(validateProductId(undefined)).toBe(false);
    });
  });

  describe('getProductById', () => {
    it('should throw error for invalid product ID', async () => {
      await expect(getProductById('abc')).rejects.toThrow('Product ID must be a number.');
      expect(getProductCache).not.toHaveBeenCalled();
      expect(getProductByIdDB).not.toHaveBeenCalled();
    });

    it('should return cached product when available', async () => {
      // Arrange
      const mockCachedProduct = { id: 1, name: 'Cached Product', price: 50 };
      getProductCache.mockResolvedValue(mockCachedProduct);

      // Act
      const result = await getProductById('1');

      // Assert
      expect(result).toEqual(mockCachedProduct);
      expect(getProductCache).toHaveBeenCalledWith('1');
      expect(getProductByIdDB).not.toHaveBeenCalled();
      expect(setProductCache).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache when not in cache', async () => {
      // Arrange
      const mockDbProduct = { id: 1, name: 'DB Product', price: 100 };
      getProductCache.mockResolvedValue(null);
      getProductByIdDB.mockResolvedValue(mockDbProduct);
      setProductCache.mockResolvedValue();

      // Act
      const result = await getProductById('1');

      // Assert
      expect(result).toEqual(mockDbProduct);
      expect(getProductCache).toHaveBeenCalledWith('1');
      expect(getProductByIdDB).toHaveBeenCalledWith('1');
      expect(setProductCache).toHaveBeenCalledWith(mockDbProduct);
    });

    it('should return null when product not found in database', async () => {
      // Arrange
      getProductCache.mockResolvedValue(null);
      getProductByIdDB.mockResolvedValue(null);

      // Act
      const result = await getProductById('999');

      // Assert
      expect(result).toBeNull();
      expect(getProductCache).toHaveBeenCalledWith('999');
      expect(getProductByIdDB).toHaveBeenCalledWith('999');
      expect(setProductCache).not.toHaveBeenCalled();
    });

    it('should handle cache errors and still fetch from database', async () => {
      // Arrange
      const mockDbProduct = { id: 1, name: 'DB Product', price: 100 };
      getProductCache.mockRejectedValue(new Error('Redis connection failed'));
      getProductByIdDB.mockResolvedValue(mockDbProduct);
      setProductCache.mockResolvedValue();

      // Act
      const result = await getProductById('1');

      // Assert
      expect(result).toEqual(mockDbProduct);
      expect(getProductCache).toHaveBeenCalledWith('1');
      expect(getProductByIdDB).toHaveBeenCalledWith('1');
      expect(setProductCache).toHaveBeenCalledWith(mockDbProduct);
    });

    it('should handle database errors', async () => {
      // Arrange
      getProductCache.mockResolvedValue(null);
      getProductByIdDB.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(getProductById('1')).rejects.toThrow('System error while fetching product');
      expect(getProductCache).toHaveBeenCalledWith('1');
      expect(getProductByIdDB).toHaveBeenCalledWith('1');
    });

    it('should handle cache set errors gracefully', async () => {
      // Arrange
      const mockDbProduct = { id: 1, name: 'DB Product', price: 100 };
      getProductCache.mockResolvedValue(null);
      getProductByIdDB.mockResolvedValue(mockDbProduct);
      setProductCache.mockRejectedValue(new Error('Redis set failed'));

      // Act
      const result = await getProductById('1');

      // Assert
      expect(result).toEqual(mockDbProduct);
      expect(setProductCache).toHaveBeenCalledWith(mockDbProduct);
    });
  });
});