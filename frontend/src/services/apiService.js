import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export const apiService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getDashboardData: (profile = 'all') => apiClient.get(`/dashboard?perfil=${profile}`),
  getIndicadores: (params) => apiClient.get('/indicadores', { params }),
};