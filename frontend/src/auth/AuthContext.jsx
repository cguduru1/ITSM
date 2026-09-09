
// src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from "../api/apiClient";
import { logout as apiLogout } from '../services/auth';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Check if JWT exp timestamp is in the past
function isTokenExpired(token) {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}

// Helper to set all token variations uniformly
function setLocalTokens(token) {
  localStorage.setItem("token", token);
  localStorage.setItem("accessToken", token);
  localStorage.setItem("access", token);
}

// Helper to remove all token variations uniformly
function clearLocalTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("access");
  localStorage.removeItem("user");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Session on Mount
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      // Fallback read for token key mismatch
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("access");

      // Validate token presence and expiration
      if (!token || token === "undefined" || token === "null" || isTokenExpired(token)) {
        clearLocalTokens();
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // Sync key aliases in case only one key was present
      setLocalTokens(token);

      // 1. Restore cached session to avoid UI flickering
      let initialUser = null;
      const savedUser = localStorage.getItem("user");
      
      if (savedUser && savedUser !== "undefined") { 
        try {
          initialUser = JSON.parse(savedUser);
        } catch (e) {
          /* ignore parse error */
        }
      }
      
      if (!initialUser) {
        const decoded = parseJwt(token);
        if (decoded) {
          initialUser = {
            id: decoded.id || decoded.sub,
            name: decoded.name || 'User',
            email: decoded.email || '',
            role: decoded.role || 'user',
            permissions: decoded.permissions || {}
          };
        }
      }

      if (mounted) setUser(initialUser);

      // 2. Refresh user data from server with non-blocking error handling
      try {
        const userData = await apiClient.get("/auth/me", { skipAuthRedirect: true });
        if (mounted && userData && !userData.error) {
          const freshUser = userData.user || userData;
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      } catch (err) {
        // 🔴 CRITICAL FIX: Only purge session if the server explicitly confirms token invalidity (401)
        if (err?.status === 401 || err?.response?.status === 401) {
          console.warn("Session token expired or rejected by server, logging out.");
          clearLocalTokens();
          if (mounted) setUser(null);
        } else {
          console.warn("Could not reach /api/auth/me, keeping local session active:", err.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    // Strip duplicate /api prefix so URL becomes base + /auth/login
    const data = await apiClient.post('/api/auth/login', credentials);
    const accessToken = data.token || data.accessToken || data.access || data.data?.token;

    if (accessToken) {
      setLocalTokens(accessToken);
      const userData = data.user || data.data?.user || parseJwt(accessToken) || { email: credentials.email };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }

    return data;
  };

  const logout = async () => {
    try {
      if (typeof apiLogout === "function") await apiLogout();
    } catch (e) {
      console.warn("apiLogout failed", e);
    } finally {
      clearLocalTokens();
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};