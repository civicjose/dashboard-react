import axios from 'axios';

// Esta línea lee la variable de tu archivo .env.
// Si no la encuentra (por ejemplo, si estás en tu máquina y no has creado el .env),
// usará localhost como plan B.
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Este interceptor añade el token a cada petición, está perfecto.
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Este interceptor maneja las sesiones expiradas, está perfecto.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/'; 
      return Promise.reject(new Error("Sesión expirada. Por favor, inicie sesión de nuevo."));
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getDashboardData: (profile = 'all') => apiClient.get(`/dashboard?perfil=${profile}`),
  getIndicadores: (params) => apiClient.get('/indicadores', { params }),
  getTecnicoDetalle: (id, desde, hasta) => apiClient.get(`/indicadores/tecnico/${id}`, { params: { desde, hasta } }),
};