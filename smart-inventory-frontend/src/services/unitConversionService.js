import apiClient from './api';

const ENDPOINT = '/unit-conversions';

const unitConversionService = {
  getAll: async () => {
    try {
      const response = await apiClient.get(ENDPOINT);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getByProductId: async (productId) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/product/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  create: async (conversionData) => {
    try {
      const response = await apiClient.post(ENDPOINT, conversionData);
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

export default unitConversionService;