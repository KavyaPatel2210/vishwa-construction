import axios from 'axios';

// Use the Render backend URL directly
// This avoids Vercel proxy timeouts (10s limit) when the free Render instance is waking up
const API_URL = import.meta.env.VITE_API_URL || 'https://vishwa-construction.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true
});

// Attach token to every request
const token = localStorage.getItem('vishwa_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor for auth errors
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vishwa_token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
