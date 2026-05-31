import apiClient from './api';

const ENDPOINT = '/customers';

const customerService = {
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

  create: async (customerData) => {
    try {
      const response = await apiClient.post(ENDPOINT, customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  update: async (id, customerData) => {
    try {
      const response = await apiClient.put(`${ENDPOINT}/${id}`, customerData);
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

  toggleStatus: async (id) => {
    try {
      const response = await apiClient.put(`${ENDPOINT}/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default customerService;