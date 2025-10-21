import api from './authAPI';

export const shopAPI = {
 getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  
  getOffers: async () => {
    const response = await api.get('/offers');
    return response.data;
  },
  
  // For home page - offers WITH images
  getOffersWithImages: async () => {
    const response = await api.get('/offers/with-images');
    return response.data;
  },
  
  // For checkout & product detail - offers WITHOUT images
  getOffersWithoutImages: async () => {
    const response = await api.get('/offers/without-images');
    return response.data;
  },
  
  applyCoupon: async (couponCode, cartTotal) => {
    const response = await api.post('/coupons/apply', {
      couponCode,
      cartTotal,
    });
    return response.data;
  },
   getTopRatedReviews: async (limit = 3) => {
    try {
      const response = await api.get(`/reviews/top?limit=${limit}`);
      // THE FIX: The data IS the array of reviews. We don't need to access a .reviews property.
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top reviews:', error);
      throw error;
    }
  },

  getFeaturedCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },
};
