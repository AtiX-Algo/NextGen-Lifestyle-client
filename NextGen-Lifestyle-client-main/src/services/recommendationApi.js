import { api } from './api';

export const recommendationApi = {
  // Get personalized recommendations for a user
  getPersonalizedRecommendations: (userId) => 
    api.get(`/recommendations/personalized/${userId || 'anonymous'}`).then(res => res.data),

  // Get similar items for a product
  getSimilarItems: (productId, userId) => 
    api.get(`/recommendations/similar/${productId}`, { params: userId ? { userId } : undefined }).then(res => res.data),

  // Get frequently bought together items
  getFrequentlyBoughtTogether: (productIds, userId) => 
    api.get('/recommendations/fbt', { params: { ids: (productIds || []).join(','), ...(userId ? { userId } : {}) } }).then(res => res.data),

  // Hide a recommendation for a user
  hideRecommendation: (userId, productId, reason) =>
    api.post(`/recommendations/hide`, { userId, productId, reason }).then(res => res.data),

  // Get trending/new arrivals (for new/not signed-in users)
  getTrendingProducts: (userId) => 
    api.get('/recommendations/trending', { params: userId ? { userId } : undefined }).then(res => res.data),

  getNewArrivals: (userId) =>
    api.get('/recommendations/new', { params: userId ? { userId } : undefined }).then(res => res.data),

  track: (payload) =>
    api.post('/recommendations/track', payload).then(res => res.data),
};
