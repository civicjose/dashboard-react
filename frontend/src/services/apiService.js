import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getDashboardData: (profile = 'all') => apiClient.get(`/dashboard?perfil=${profile}`),
  getIndicadores: (params) => apiClient.get('/indicadores', { params }),
  getTicketDetails: (ids) => apiClient.post('/dashboard/ticket-details', { ids }),
  getTecnicoDetails: (id) => apiClient.get(`/dashboard/tecnico/${id}`),
  getKpiReport: (params) => apiClient.get('/kpi', { params }),
};