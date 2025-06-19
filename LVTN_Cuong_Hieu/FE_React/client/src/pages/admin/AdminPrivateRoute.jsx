import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminPrivateRoute = ({ children, isAuthenticated }) => {
  // Check both props and localStorage for double security
  const token = localStorage.getItem('adminToken');
  const adminLoggedIn = localStorage.getItem('adminLoggedIn');
  
  const isAuthorized = isAuthenticated && token && adminLoggedIn === 'true';
  
  if (!isAuthorized) {
    // Clean up any invalid tokens
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoggedIn');
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

export default AdminPrivateRoute;