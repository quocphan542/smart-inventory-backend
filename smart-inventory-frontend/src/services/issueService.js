import apiClient from './api';

const ENDPOINT = '/issues';

const issueService = {
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINT, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  create: async (issueData) => {
    try {
      const response = await apiClient.post(ENDPOINT, issueData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  update: async (id, issueData) => {
    try {
      const response = await apiClient.put(`${ENDPOINT}/${id}`, issueData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  approve: async (id) => {
    try {
      const response = await apiClient.patch(`${ENDPOINT}/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

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

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default issueService;