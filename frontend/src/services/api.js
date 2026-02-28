/**
 * API Service
 * Central axios instance with automatic JWT injection and error handling.
 * All components import from here instead of using axios directly.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// ── Request interceptor: attach JWT token automatically ─────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('df_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 (session expired) globally ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear session and redirect to login
      localStorage.removeItem('df_token');
      localStorage.removeItem('df_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
