import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Пока идёт загрузка пользователя — ничего не показываем
  if (loading) {
    return <div style={{ padding: 50, textAlign: 'center' }}>Загрузка...</div>;
  }

  // Если пользователь не авторизован
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Если роль не подходит
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;