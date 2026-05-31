import apiClient from './api'; // Import the configured axios instance

const API_ENDPOINT = '/dashboard';

/**
 * Service for fetching dashboard-related data.
 */
const dashboardService = {
    /**
     * Fetches the main statistics for the operator/warehouse keeper dashboard.
     * @returns {Promise<object>} A promise that resolves to the dashboard statistics object.
     */
    getOperatorStats: async () => {
        try {
            // We assume the backend has an endpoint like this for operator-specific stats
            const response = await apiClient.get(`${API_ENDPOINT}/operator-stats`);
            return response.data;
        } catch (error) {
            // The error will be handled by the component that calls this service
            throw error;
        }
    },

    /**
     * Fetches recent activity logs relevant to the operator.
     * @param {number} limit - The maximum number of logs to fetch.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of log objects.
     */
    getRecentActivity: async (limit = 5) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINT}/recent-activity?limit=${limit}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default dashboardService;
