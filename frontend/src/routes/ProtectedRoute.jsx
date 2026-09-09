// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoute({ children }) {
  const auth = useAuth(); 
  const { user, loading } = auth || { user: null, loading: false }; // Secure fallback object
  
  const location = useLocation();

  // Secondary check: verify if a valid token exists in storage
  const hasToken = () => {
    const token = localStorage.getItem('token');
    return Boolean(token && token !== 'undefined' && token !== 'null');
  };

  // 1. Hold redirect until AuthProvider finishes reading LocalStorage / Token
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1d21', color: '#fff' }}>
        <h3>Loading session...</h3>
      </div>
    );
  }

  // 2. Redirect ONLY if loading has finished AND no authenticated user exists
  if (!user && !hasToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Render wrapped children OR nested React Router <Outlet />
  return children ? children : <Outlet />;
}