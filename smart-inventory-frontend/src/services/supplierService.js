import apiClient from './api';

const ENDPOINT = '/suppliers';

const supplierService = {
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

  create: async (supplierData) => {
    try {
      const response = await apiClient.post(ENDPOINT, supplierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  update: async (id, supplierData) => {
    try {
      const response = await apiClient.put(`${ENDPOINT}/${id}`, supplierData);
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

export default supplierService;