// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute status ->', { user, loading });

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}