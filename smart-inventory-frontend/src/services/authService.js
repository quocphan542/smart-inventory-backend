import apiClient from './api';
import { tokenManager } from '../utils/tokenManager';

const AUTH_ENDPOINT = '/auth';

const authService = {
    // Login user
    login: async (username, password) => {
        try {
            const response = await apiClient.post(`${AUTH_ENDPOINT}/login`, {
                username,
                password,
            });

            const { accessToken, tokenType } = response.data;

            // Save tokens
            tokenManager.setToken(accessToken);
            tokenManager.setTokenType(tokenType || 'Bearer'); // SỬA LẠI: Luôn lưu tokenType

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Register new user
    register: async (userData) => {
        // --- DEBUGGING LINE ---
        console.log("Data received by authService:", userData);
        try {
            const response = await apiClient.post(`${AUTH_ENDPOINT}/register`, userData);
            return response.data;
        } catch (error) {
            console.error("Error from apiClient in authService:", error);
            throw error.response?.data || error.message;
        }
    },

    // Logout user
    logout: () => {
        tokenManager.clear();
    },

    // Get current auth status
    isAuthenticated: () => {
        return tokenManager.hasToken();
    },

    // Get current user
    getCurrentUser: () => {
        return tokenManager.getUser();
    },
};

export default authService;