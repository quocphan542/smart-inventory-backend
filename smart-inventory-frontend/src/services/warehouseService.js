import apiClient from './api';

const ENDPOINT = '/warehouses';

const warehouseService = {
  getAll: async () => {
    try {
      const response = await apiClient.get(ENDPOINT);
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

  create: async (warehouseData) => {
    try {
      const response = await apiClient.post(ENDPOINT, warehouseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  update: async (id, warehouseData) => {
    try {
      const response = await apiClient.put(`${ENDPOINT}/${id}`, warehouseData);
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

export default warehouseService;