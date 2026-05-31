import apiClient from './api';

const ENDPOINT = '/units';

const unitService = {
  getAll: async () => {
    try {
      const response = await apiClient.get(ENDPOINT);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  create: async (unitData) => {
    try {
      const response = await apiClient.post(ENDPOINT, unitData);
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
  }
};

export default unitService;