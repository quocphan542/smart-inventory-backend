import apiClient from './api';

const ENDPOINT = '/users';

const userService = {
  // Get all users
  getAll: async () => {
    try {
      const response = await apiClient.get(ENDPOINT);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new user (This might be handled by a separate register endpoint)
  create: async (userData) => {
    try {
      const response = await apiClient.post(ENDPOINT, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user
  update: async (id, userData) => {
    try {
      const response = await apiClient.put(`${ENDPOINT}/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete user
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle user's active status
  toggleStatus: async (id) => {
    try {
      const response = await apiClient.put(`${ENDPOINT}/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change user's role
  changeRole: async (id, roleId) => {
    try {
      const response = await apiClient.put(`${ENDPOINT}/${id}/change-role`, { roleId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userService;