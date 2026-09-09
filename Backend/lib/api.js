// lib/api.js
import axios from 'axios';

const BASE_URL = import.meta.env?.VITE_API_URL || process.env?.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== "undefined" && token !== "null") {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes('/api/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/api/refresh`, {}, { withCredentials: true });
        const newToken = data.access || data.token || data.accessToken;

        if (newToken) {
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Clear token ONLY when the refresh attempt fails completely
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;