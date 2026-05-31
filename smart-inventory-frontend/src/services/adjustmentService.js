import apiClient from './api';

const ENDPOINT = '/adjustments';

const adjustmentService = {
  // Get all adjustments (stock-taking)
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINT, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get adjustment by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new adjustment
  create: async (adjustmentData) => {
    try {
      const response = await apiClient.post(ENDPOINT, adjustmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update adjustment
  update: async (id, adjustmentData) => {
    try {
      const response = await apiClient.put(`${ENDPOINT}/${id}`, adjustmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve adjustment
  approve: async (id) => {
    try {
      const response = await apiClient.patch(`${ENDPOINT}/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reject adjustment
  reject: async (id, reason) => {
    try {
      const response = await apiClient.patch(`${ENDPOINT}/${id}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete adjustment
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default adjustmentService;
