import apiClient from './api';

const ENDPOINT = '/inventory-stocks';

const inventoryStockService = {
  // Get all inventory stocks
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINT, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get stock by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get stocks by warehouse
  getByWarehouse: async (warehouseId, params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINT, {
        params: { warehouseId, ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get stocks by product
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

  // Get stocks by location
  getByLocation: async (locationId, params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINT, {
        params: { locationId, ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default inventoryStockService;
