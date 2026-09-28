import axios from 'axios';
import { clearToken, getToken } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 on a request that carried a token means it is invalid or expired.
    if (error.response?.status === 401 && error.config?.headers?.Authorization) clearToken();
    return Promise.reject(error);
  }
);

export default api;
