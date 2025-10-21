// src/services/orderAPI.js
import api from './authAPI'; // Assuming your base authenticated axios instance is here

export const orderAPI = {
  /**
   * Fetches the orders for the currently logged-in user.
   */
  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/myorders');
      return response.data; // Expects an array of orders
    } catch (error) {
      console.error('Failed to fetch orders:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to load your orders.');
    }
  },

  /**
   * Fetches the details of a specific order by its ID.
   * @param {string} orderId - The ID of the order to fetch.
   */
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data; // Expects a single order object
    } catch (error) {
      console.error(`Failed to fetch order ${orderId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to load order details.');
    }
  },

  /**
   * Sends a request to cancel a specific order.
   * @param {string} orderId - The ID of the order to cancel.
   * @param {string} [reason=''] - Optional reason for cancellation.
   */
  cancelOrder: async (orderId, reason = '') => {
    try {
      // Assuming your backend expects a PUT/PATCH request to /orders/:id/cancel
      // Adjust the method (PUT/PATCH) and endpoint as per your backend route
      const response = await api.put(`/orders/${orderId}/cancel`, { reason });
      return response.data; // Expects { success: true, message: '...', order: updatedOrder }
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to cancel the order.');
    }
  },
};