import api from './authAPI'; // Reusing the base axios instance

export const newsletterAPI = {
  subscribe: async (data) => {
    try {
      const response = await api.post('/newsletter/subscribe', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('A server error occurred.');
    }
  },
};
