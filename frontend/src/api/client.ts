import axios from "axios";

const baseURL = import.meta.env.DEV ? "http://localhost:4000" : "https://api.example.com";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" }
});

// attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  return config;
});
