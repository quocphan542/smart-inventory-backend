import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Chuẩn hóa cả hai chuỗi trước khi so sánh
  const userRole = user?.roleName?.trim().toLowerCase();
  const roleRequired = requiredRole?.trim().toLowerCase();

  if (requiredRole && userRole !== roleRequired) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};