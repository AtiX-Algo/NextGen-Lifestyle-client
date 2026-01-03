import { api } from './api';

export const recommendationApi = {
  // Get personalized recommendations for a user
  getPersonalizedRecommendations: (userId) => 
    api.get(`/recommendations/personalized/${userId || 'anonymous'}`).then(res => res.data),

  // Get similar items for a product
  getSimilarItems: (productId) => 
    api.get(`/recommendations/similar/${productId}`).then(res => res.data),

  // Get frequently bought together items
  getFrequentlyBoughtTogether: (productIds) => 
    api.post('/recommendations/frequently-bought-together', { productIds }).then(res => res.data),

  // Hide a recommendation for a user
  hideRecommendation: (userId, productId) =>
    api.post(`/recommendations/hide`, { userId, productId }).then(res => res.data),

  // Get trending/new arrivals (for new/not signed-in users)
  getTrendingProducts: () => 
    api.get('/recommendations/trending').then(res => res.data),
};
