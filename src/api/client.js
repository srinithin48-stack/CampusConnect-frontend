import axios from 'axios';

const api = axios.create({
  baseURL: 'https://campusconnect-backend-32k8.onrender.com',
  headers: { 'Content-Type': 'application/json' }
});

export default api;
