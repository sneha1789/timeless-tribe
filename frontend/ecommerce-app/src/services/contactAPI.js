import api from './authAPI'; // We can reuse the base axios instance

export const contactAPI = {
  sendContactMessage: async (formData) => {
    try {
      // The endpoint matches the one we created in the backend
      const response = await api.post('/contact/send', formData);
      return response.data; // Should return { success: true, message: '...' }
    } catch (error) {
      // Re-throw the error to be caught by the component
      throw error.response?.data || new Error('A server error occurred.');
    }
  },
};
