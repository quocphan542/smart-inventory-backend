import apiClient from './api';

const API_ENDPOINT = '/dashboard';

const dashboardService = {
    /**
     * Fetches the main dashboard statistics.
     * This endpoint is shared by Admin and Operator for now.
     * @returns {Promise<object>} A promise that resolves to the DashboardStatsDto object.
     */
    getDashboardStats: async () => {
        try {
            const response = await apiClient.get(`${API_ENDPOINT}/stats`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default dashboardService;
