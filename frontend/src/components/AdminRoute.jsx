import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // или спиннер
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;