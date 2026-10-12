import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' }
});

// Module-scoped (not global) so the JWT is only reachable through AuthContext.
let authToken = null;
let handleUnauthorized = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const setUnauthorizedHandler = (handler) => {
  handleUnauthorized = handler;
};

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 on a request that carried a token means it is invalid or expired.
    if (error.response?.status === 401 && error.config?.headers?.Authorization) handleUnauthorized?.();
    return Promise.reject(error);
  }
);

export default api;
