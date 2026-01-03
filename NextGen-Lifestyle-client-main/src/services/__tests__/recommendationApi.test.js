import { recommendationApi } from '../recommendationApi';
import { api } from '../api';

// Mock the api module
jest.mock('../api');

describe('recommendationApi', () => {
  const mockResponse = (data) => Promise.resolve({ data });
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset the mock implementation for each test
    api.get.mockReset();
    api.post.mockReset();
  });

  describe('getPersonalizedRecommendations', () => {
    it('should call the API with the correct endpoint', async () => {
      const mockData = [{ id: 1, name: 'Test Product' }];
      api.get.mockResolvedValueOnce({ data: mockData });
      
      const userId = 'user123';
      const result = await recommendationApi.getPersonalizedRecommendations(userId);
      
      expect(api.get).toHaveBeenCalledWith('/recommendations/personalized/user123');
      expect(result).toEqual(mockData);
    });
    
    it('should handle anonymous users', async () => {
      const mockData = [{ id: 1, name: 'Test Product' }];
      api.get.mockResolvedValueOnce({ data: mockData });
      
      const result = await recommendationApi.getPersonalizedRecommendations();
      
      expect(api.get).toHaveBeenCalledWith('/recommendations/personalized/anonymous');
      expect(result).toEqual(mockData);
    });
  });

  describe('getSimilarItems', () => {
    it('should call the API with the correct product ID', async () => {
      const mockData = [{ id: 2, name: 'Similar Product' }];
      api.get.mockResolvedValueOnce({ data: mockData });
      
      const productId = 'prod123';
      const result = await recommendationApi.getSimilarItems(productId);
      
      expect(api.get).toHaveBeenCalledWith('/recommendations/similar/prod123');
      expect(result).toEqual(mockData);
    });
  });

  describe('getFrequentlyBoughtTogether', () => {
    it('should call the API with the correct product IDs', async () => {
      const mockData = [{ id: 3, name: 'Frequently Bought Together' }];
      api.post.mockResolvedValueOnce({ data: mockData });
      
      const productIds = ['prod1', 'prod2'];
      const result = await recommendationApi.getFrequentlyBoughtTogether(productIds);
      
      expect(api.post).toHaveBeenCalledWith('/recommendations/frequently-bought-together', { productIds });
      expect(result).toEqual(mockData);
    });
  });

  describe('hideRecommendation', () => {
    it('should call the API with the correct parameters', async () => {
      const mockData = { success: true };
      api.post.mockResolvedValueOnce({ data: mockData });
      
      const userId = 'user123';
      const productId = 'prod456';
      const result = await recommendationApi.hideRecommendation(userId, productId);
      
      expect(api.post).toHaveBeenCalledWith('/recommendations/hide', { userId, productId });
      expect(result).toEqual(mockData);
    });
  });

  describe('getTrendingProducts', () => {
    it('should call the trending products endpoint', async () => {
      const mockData = [{ id: 4, name: 'Trending Product' }];
      api.get.mockResolvedValueOnce({ data: mockData });
      
      const result = await recommendationApi.getTrendingProducts();
      
      expect(api.get).toHaveBeenCalledWith('/recommendations/trending');
      expect(result).toEqual(mockData);
    });
  });

  describe('error handling', () => {
    it('should throw an error when API call fails', async () => {
      const error = new Error('Network Error');
      api.get.mockRejectedValueOnce(error);
      
      await expect(recommendationApi.getPersonalizedRecommendations()).rejects.toThrow('Network Error');
    });
  });
});
