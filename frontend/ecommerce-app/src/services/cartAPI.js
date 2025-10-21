import api from './authAPI';

export const cartAPI = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  addToCart: async (cartItem) => {
    const response = await api.post('/cart', cartItem);
    return response.data;
  },
  updateCartItem: async (itemId, quantity) => {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  },

  updateCartItemDetails: async (itemId, details) => {
    const response = await api.put(`/cart/${itemId}/details`, details);
    return response.data;
  },
  removeCartItem: async (itemId) => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },
};
