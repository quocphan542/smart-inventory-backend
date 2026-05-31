import apiClient from './api';

const API_ENDPOINT = '/inbound-receipts'; // Assuming this is the API endpoint

const inboundService = {
    getAll: async () => {
        const response = await apiClient.get(API_ENDPOINT);
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`${API_ENDPOINT}/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post(API_ENDPOINT, data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`${API_ENDPOINT}/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`${API_ENDPOINT}/${id}`);
        return response.data;
    },
};

export default inboundService;
