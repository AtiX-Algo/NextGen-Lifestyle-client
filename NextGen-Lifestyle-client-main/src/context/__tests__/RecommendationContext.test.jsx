import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { RecommendationProvider, useRecommendations } from '../RecommendationContext';
import { recommendationApi } from '../../services/recommendationApi';

// Mock the API module
jest.mock('../../services/recommendationApi');

describe('RecommendationContext', () => {
  const mockRecommendations = [
    { _id: '1', name: 'Test Product 1', price: 99.99 },
    { _id: '2', name: 'Test Product 2', price: 129.99 },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset localStorage mocks
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
    
    // Setup mock implementations
    recommendationApi.getSimilarItems.mockResolvedValue(mockRecommendations);
    recommendationApi.getFrequentlyBoughtTogether.mockResolvedValue(mockRecommendations);
    recommendationApi.getPersonalizedRecommendations.mockResolvedValue(mockRecommendations);
    recommendationApi.hideRecommendation.mockResolvedValue({ success: true });
    recommendationApi.getTrendingProducts.mockResolvedValue(mockRecommendations);
  });
  
  const wrapper = ({ children }) => (
    <RecommendationProvider userId="test-user">
      {children}
    </RecommendationProvider>
  );

  it('provides initial context values', () => {
    const { result } = renderHook(() => useRecommendations(), { wrapper });
    
    expect(result.current).toEqual(
      expect.objectContaining({
        loading: false,
        error: null,
        personalized: [],
        similarItems: {},
        frequentlyBoughtTogether: {},
        hiddenItems: expect.any(Set),
      })
    );
  });

  it('fetches similar items', async () => {
    const { result } = renderHook(() => useRecommendations(), { wrapper });
    
    await act(async () => {
      await result.current.fetchSimilarItems('test-product-id');
    });
    
    expect(recommendationApi.getSimilarItems).toHaveBeenCalledWith('test-product-id');
    expect(result.current.similarItems['test-product-id']).toHaveLength(2);
    expect(result.current.loading).toBe(false);
  });

  it('fetches frequently bought together items', async () => {
    const { result } = renderHook(() => useRecommendations(), { wrapper });
    const productIds = ['1', '2'];
    
    await act(async () => {
      await result.current.fetchFrequentlyBoughtTogether(productIds);
    });
    
    expect(recommendationApi.getFrequentlyBoughtTogether).toHaveBeenCalledWith(productIds);
    expect(result.current.frequentlyBoughtTogether[productIds.join(',')]).toHaveLength(2);
  });

  it('handles hiding a recommendation', async () => {
    const { result } = renderHook(() => useRecommendations(), { wrapper });
    
    // First, fetch some recommendations
    await act(async () => {
      await result.current.fetchPersonalizedRecommendations();
    });
    
    // Then hide one
    await act(async () => {
      await result.current.hideRecommendation('1');
    });
    
    expect(recommendationApi.hideRecommendation).toHaveBeenCalledWith('test-user', '1');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'hiddenRecommendations_test-user',
      JSON.stringify(['1'])
    );
    expect(result.current.hiddenItems.has('1')).toBe(true);
    
    // Verify the item is filtered out from recommendations
    expect(result.current.personalized).toHaveLength(1);
    expect(result.current.personalized[0]._id).toBe('2');
  });

  it('loads hidden items from localStorage', () => {
    const hiddenItems = ['1', '2'];
    localStorage.getItem.mockReturnValue(JSON.stringify(hiddenItems));
    
    const { result } = renderHook(() => useRecommendations(), { wrapper });
    
    expect(localStorage.getItem).toHaveBeenCalledWith('hiddenRecommendations_test-user');
    expect(result.current.hiddenItems.has('1')).toBe(true);
    expect(result.current.hiddenItems.has('2')).toBe(true);
  });

  it('handles API errors', async () => {
    const error = new Error('API Error');
    recommendationApi.getPersonalizedRecommendations.mockRejectedValueOnce(error);
    
    const { result } = renderHook(() => useRecommendations(), { wrapper });
    
    await act(async () => {
      await expect(result.current.fetchPersonalizedRecommendations()).rejects.toThrow('API Error');
    });
    
    expect(result.current.error).toBe('Failed to load recommendations');
    expect(result.current.loading).toBe(false);
    
    // Test error is cleared on next successful operation
    recommendationApi.getPersonalizedRecommendations.mockResolvedValueOnce([{ _id: '3', name: 'New Product' }]);
    
    await act(async () => {
      await result.current.fetchPersonalizedRecommendations();
    });
    
    expect(result.current.error).toBeNull();
    expect(result.current.personalized).toHaveLength(1);
    expect(result.current.personalized[0]._id).toBe('3');
  });
});
