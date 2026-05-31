import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { tokenManager } from '../utils/tokenManager';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const initAuth = useCallback(() => {
        try {
            const storedUser = tokenManager.getUser();
            if (storedUser && tokenManager.hasToken()) {
                setUser(storedUser);
            }
        } catch (e) {
            tokenManager.clear();
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authService.login(username, password);

            if (!data || !data.accessToken || !data.roleName) {
                throw new Error("Login response from server is invalid.");
            }

            const { accessToken, roleName } = data;
            const userData = { username, roleName };
            
            tokenManager.setToken(accessToken);
            tokenManager.setUser(userData);

            setUser(userData);

            // Điều hướng dựa trên roleName chính xác từ database
            if (roleName === 'Admin') {
                navigate('/admin');
            } else if (roleName === 'Thủ kho') {
                navigate('/thukho');
            } else if (roleName === 'User') {
                navigate('/banhang');
            } else {
                setError(`Vai trò không xác định: ${roleName}`);
                authService.logout();
                setUser(null);
                return false;
            }
            
            return true;

        } catch (err) {
            const errorMessage = err?.response?.data || err?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        navigate('/login');
    };

    const value = {
        user,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};