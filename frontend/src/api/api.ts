import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: { "Content-Type": "application/json" }
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (err: any) => void; config: any }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else {
      if (p.config && token) p.config.headers.Authorization = `Bearer ${token}`;
      p.resolve(api(p.config));
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

// 1. Attach Access Token to Outgoing Requests
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Do NOT trigger token refresh or redirect if the failing request WAS the login request
    if (originalRequest.url.includes('/auth/login')) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh');

      if (!refresh || refresh === 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }

      try {
        const res = await axios.post('http://localhost:4000/api/refresh', { refresh });
        const newAccessToken = res.data.access;
        localStorage.setItem('token', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

// 2. Handle Expired Tokens & Refresh Logic Cleanly
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    // Check if error is 401   and request hasn't been retried yet
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request as retried
      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        // No refresh token available -> Clear session and redirect to login
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }

      try {
        // ⚠️ Use plain axios instance here to prevent interceptor loop on /api/refresh
        const res = await axios.post("http://localhost:4000/api/refresh", { refresh });


        const newAccessToken = res.data.access;
        localStorage.setItem("token", newAccessToken);

       // Update authorization header and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // Refresh token failed/expired -> Force Logout
        console.error("Session expired. Please log in again.", refreshErr);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);



// Chat history APIs
// export const saveChatHistory = (data) => api.post("/chat/save", data);
// export const loadChatHistory = (userId) => api.get(`/chat/${userId}`);
// export const newChatSession = (userId) => api.post("/chat/new-session", { userId });
// export const loadSessions = (userId) => api.get(`/chat/sessions/${userId}`);
// export const loadSessionMessages = (sessionId) => api.get(`/chat/session/${sessionId}`);

export default api;
