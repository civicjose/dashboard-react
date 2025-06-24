import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Interceptor de PETICIÓN (Request): Añade el token a las cabeceras.
// Este ya lo teníamos y está correcto.
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));


// CAMBIO: Añadimos un interceptor de RESPUESTA (Response) para manejar errores 401.
apiClient.interceptors.response.use(
  // Si la respuesta es exitosa (2xx), simplemente la devolvemos.
  (response) => response,
  
  // Si la respuesta da un error...
  (error) => {
    // Comprobamos si el error es porque la sesión ha expirado (error 401).
    if (error.response && error.response.status === 401) {
      // Si es así, limpiamos el token del almacenamiento local.
      localStorage.removeItem('token');
      // Y redirigimos al usuario a la página de login para que vuelva a entrar.
      window.location.href = '/'; 
      // Devolvemos un error para que la petición original no continúe.
      return Promise.reject(new Error("Sesión expirada. Por favor, inicie sesión de nuevo."));
    }
    
    // Si es cualquier otro error, simplemente lo devolvemos para que sea manejado localmente.
    return Promise.reject(error);
  }
);


export const apiService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getDashboardData: (profile = 'all') => apiClient.get(`/dashboard?perfil=${profile}`),
  getIndicadores: (params) => apiClient.get('/indicadores', { params }),
  // NUEVO: Función para obtener el detalle de un técnico
  getTecnicoDetalle: (id, desde, hasta) => apiClient.get(`/indicadores/tecnico/${id}`, { params: { desde, hasta } }),
};

