import apiClient from './api';

const ENDPOINT = '/warehouse-locations';

const warehouseLocationService = {
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

  getByWarehouseId: async (warehouseId) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/warehouse/${warehouseId}`); // Sửa lại URL
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  create: async (locationData) => {
    try {
      const response = await apiClient.post(ENDPOINT, locationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  update: async (id, locationData) => {
    try {
      const response = await apiClient.put(`${ENDPOINT}/${id}`, locationData);
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

export default warehouseLocationService;