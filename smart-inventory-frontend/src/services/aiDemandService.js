import apiClient from './api';

const ENDPOINT = '/ai-demand-forecast';

const aiDemandService = {
  // Get all forecasts
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINT, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get forecast by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get forecasts by product
  getByProduct: async (productId, params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINT, {
        params: { productId, ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get recent forecasts
  getRecent: async (days = 30) => {
    try {
      const response = await apiClient.get(ENDPOINT, {
        params: { days },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default aiDemandService;
