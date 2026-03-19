import axios from 'axios';

const API = axios.create({
  baseURL: 'https://zwigato-backend-h8y2.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('zwigato_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('zwigato_token');
      localStorage.removeItem('zwigato_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default API;
