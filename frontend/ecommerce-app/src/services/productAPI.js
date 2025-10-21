import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productAPI = {
  // --- ADD THIS NEW FUNCTION ---
 searchProducts: async (params) => { // Changed from (query, page = 1) to (params)
    try {
      const response = await api.get('/products/search', {
        params: params, // Pass the whole params object directly
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search products' };
    }
  },
  // Get products by category
  getProductsByCategory: async (slug, filters = {}) => {
    try {
      const response = await api.get(`/products/category/${slug}`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch products' };
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch categories' };
    }
  },

  // Get single product
  getProduct: async (slug) => {
    try {
      const response = await api.get(`/products/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch product' };
    }
  },

  // Make sure your getSimilarProducts function looks exactly like this
  getSimilarProducts: async (categorySlug, excludeSlug) => {
    try {
      // This line creates the correct URL: /products/category/jewelry?exclude=...
      const response = await api.get(
        `/products/category/${categorySlug}?exclude=${excludeSlug}&limit=8`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching similar products:', error);
      throw error;
    }
  },

  getAvailableFilters: async (categorySlugs) => {
    try {
      const response = await api.get('/products/filters', {
        params: { categories: categorySlugs.join(',') },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch filters' };
    }
  },
};

// ADD THIS - Address API functions
export const addressAPI = {
  // Get user addresses
  getAddresses: async () => {
    try {
      const response = await api.get('/addresses');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch addresses' };
    }
  },

  // Add new address
  addAddress: async (addressData) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add address' };
    }
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await api.put(`/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update address' };
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete address' };
    }
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    try {
      const response = await api.patch(`/addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: 'Failed to set default address' }
      );
    }
  },
};

export const reviewAPI = {
  addReview: async (productId, reviewData) => {
    try {
      // OLD: /products/${productId}/reviews
      // NEW: /reviews/${productId}
      const response = await api.post(`/reviews/${productId}`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error submitting review' };
    }
  },

  // Get product reviews
  getProductReviews: async (productId) => {
    try {
      // OLD: /products/${productId}/reviews
      // NEW: /reviews/product/${productId}
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch reviews' };
    }
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    try {
      // OLD: /products/reviews/${reviewId}
      // NEW: /reviews/${reviewId}
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update review' };
    }
  },

  // Delete review
  deleteReview: async (reviewId) => {
    try {
      // OLD: /products/reviews/${reviewId}
      // NEW: /reviews/${reviewId}
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete review' };
    }
  },

  // Mark review as helpful
  markReviewHelpful: async (reviewId, helpful) => {
    try {
      // OLD: /products/reviews/${reviewId}/helpful
      // NEW: /reviews/${reviewId}/helpful
      const response = await api.patch(`/reviews/${reviewId}/helpful`, {
        helpful,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark review' };
    }
  },

  getTopReviews: async () => {
    try {
      const response = await api.get('/products/top-reviews');
      return response.data;
    } catch (error) {
      console.error('Error fetching top reviews:', error);
      throw error.response?.data || { message: 'Failed to fetch top reviews' };
    }
  },
  
};

export default api;
