import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { recommendationApi } from '../services/recommendationApi';

const RecommendationContext = createContext();

export function RecommendationProvider({ children, userId }) {
  const [recommendations, setRecommendations] = useState({
    personalized: [],
    similarItems: {},
    frequentlyBoughtTogether: {},
    trending: [],
    hiddenItems: new Set(),
    loading: false,
    error: null,
    userPreferences: {}
  });

  // Load user's hidden recommendations and preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const safeJsonParse = (value, fallback) => {
        try {
          return JSON.parse(value);
        } catch (e) {
          return fallback;
        }
      };

      const hiddenItems = safeJsonParse(
        localStorage.getItem(`hiddenRecommendations_${userId}`) || '[]',
        []
      );
      const userPreferences = safeJsonParse(
        localStorage.getItem(`userPreferences_${userId}`) || '{}',
        {}
      );
      
      setRecommendations(prev => ({
        ...prev,
        hiddenItems: new Set(Array.isArray(hiddenItems) ? hiddenItems : []),
        userPreferences: userPreferences && typeof userPreferences === 'object' ? userPreferences : {}
      }));
    }
  }, [userId]);

  // Save hidden items to localStorage
  const saveHiddenItems = useCallback((hiddenItems) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `hiddenRecommendations_${userId}`, 
        JSON.stringify(Array.from(hiddenItems))
      );
    }
  }, [userId]);

  // Save user preferences
  const saveUserPreferences = useCallback((preferences) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `userPreferences_${userId}`,
        JSON.stringify(preferences)
      );
    }
  }, [userId]);

  const fetchPersonalizedRecommendations = async () => {
    try {
      setRecommendations(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch recommendations based on user's activity
      const data = userId 
        ? await recommendationApi.getPersonalizedRecommendations(userId)
        : await recommendationApi.getTrendingProducts();
      
      // Filter out hidden items and items with low inventory
      const filtered = data
        .filter(item => !recommendations.hiddenItems.has(item._id))
        .filter(item => item.inventoryCount > 0); // Only show items in stock
      
      setRecommendations(prev => ({
        ...prev,
        personalized: filtered,
        loading: false
      }));
      return filtered;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations(prev => ({
        ...prev,
        error: 'Failed to load recommendations',
        loading: false
      }));
      return [];
    }
  };

  const getNewArrivals = async () => {
    try {
      setRecommendations(prev => ({ ...prev, loading: true, error: null }));
      const data = await recommendationApi.getNewArrivals(userId);
      const filtered = data
        .filter(item => !recommendations.hiddenItems.has(item._id))
        .filter(item => item.inventoryCount > 0);

      setRecommendations(prev => ({
        ...prev,
        loading: false
      }));

      return filtered;
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      setRecommendations(prev => ({
        ...prev,
        error: 'Failed to load new arrivals',
        loading: false
      }));
      return [];
    }
  };

  const fetchSimilarItems = async (productId) => {
    if (!productId) return [];
    
    try {
      setRecommendations(prev => ({ ...prev, loading: true, error: null }));
      
      // Check cache first
      if (recommendations.similarItems[productId]) {
        return recommendations.similarItems[productId];
      }
      
      const data = await recommendationApi.getSimilarItems(productId, userId);
      
      // Filter out hidden items and items with low inventory
      const filtered = data
        .filter(item => !recommendations.hiddenItems.has(item._id))
        .filter(item => item.inventoryCount > 0) // Only show items in stock
        .sort((a, b) => {
          // Sort by inventory level (higher first) then by relevance score
          if (a.inventoryCount !== b.inventoryCount) {
            return b.inventoryCount - a.inventoryCount;
          }
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        });
      
      setRecommendations(prev => ({
        ...prev,
        similarItems: {
          ...prev.similarItems,
          [productId]: filtered
        },
        loading: false
      }));
      
      return filtered;
    } catch (error) {
      console.error('Error fetching similar items:', error);
      setRecommendations(prev => ({
        ...prev,
        error: 'Failed to load similar items',
        loading: false
      }));
      return [];
    }
  };

  const fetchFrequentlyBoughtTogether = async (productIds) => {
    if (!productIds?.length) return [];
    
    const cacheKey = productIds.sort().join(',');
    
    try {
      if (recommendations.frequentlyBoughtTogether[cacheKey]) {
        return recommendations.frequentlyBoughtTogether[cacheKey];
      }
      
      const data = await recommendationApi.getFrequentlyBoughtTogether(productIds, userId);
      
      // Filter out hidden items and items with low inventory
      const filtered = data
        .filter(item => !recommendations.hiddenItems.has(item._id))
        .filter(item => item.inventoryCount > 0); // Only show items in stock
      
      setRecommendations(prev => ({
        ...prev,
        frequentlyBoughtTogether: {
          ...prev.frequentlyBoughtTogether,
          [cacheKey]: filtered
        },
        loading: false
      }));
      
      return filtered;
    } catch (error) {
      console.error('Error fetching frequently bought together items:', error);
      return [];
    }
  };

  const hideRecommendation = async (productId, reason) => {
    try {
      // Update local state immediately for better UX
      setRecommendations(prev => {
        const hiddenItems = new Set(prev.hiddenItems).add(productId);
        
        // Update user preferences based on the reason for hiding
        const userPreferences = { ...prev.userPreferences };
        if (reason) {
          userPreferences[reason] = userPreferences[reason] || 0;
          userPreferences[reason] += 1;
        }
        
        // Save to localStorage
        saveHiddenItems(hiddenItems);
        saveUserPreferences(userPreferences);
        
        // Update state
        return {
          ...prev,
          hiddenItems,
          userPreferences,
          personalized: prev.personalized.filter(item => item._id !== productId),
          similarItems: Object.fromEntries(
            Object.entries(prev.similarItems).map(([key, items]) => [
              key,
              items.filter(item => item._id !== productId)
            ])
          ),
          frequentlyBoughtTogether: Object.fromEntries(
            Object.entries(prev.frequentlyBoughtTogether).map(([key, items]) => [
              key,
              items.filter(item => item._id !== productId)
            ])
          )
        };
      });

      // Send to backend if user is logged in
      if (userId) {
        await recommendationApi.hideRecommendation(userId, productId, reason);
      }
    } catch (error) {
      console.error('Error hiding recommendation:', error);
      // Revert the UI if the API call fails
      setRecommendations(prev => ({
        ...prev,
        hiddenItems: new Set([...prev.hiddenItems].filter(id => id !== productId))
      }));
    }
  };

  const getTrendingProducts = async () => {
    try {
      setRecommendations(prev => ({ ...prev, loading: true, error: null }));
      const data = await recommendationApi.getTrendingProducts(userId);
      
      // Filter out hidden items and items with low inventory
      const filtered = data
        .filter(item => !recommendations.hiddenItems.has(item._id))
        .filter(item => item.inventoryCount > 0); // Only show items in stock
      
      setRecommendations(prev => ({
        ...prev,
        personalized: filtered,
        loading: false
      }));
      
      return filtered;
    } catch (error) {
      console.error('Error fetching trending products:', error);
      setRecommendations(prev => ({
        ...prev,
        error: 'Failed to load trending products',
        loading: false
      }));
      return [];
    }
  };

  const value = {
    ...recommendations,
    fetchPersonalizedRecommendations,
    fetchSimilarItems,
    fetchFrequentlyBoughtTogether,
    hideRecommendation,
    getTrendingProducts,
    getNewArrivals,
    userPreferences: recommendations.userPreferences
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
}

export const useRecommendations = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationProvider');
  }
  return context;
};
