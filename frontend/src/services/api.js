import axios from 'axios';

// Creamos la instancia con la baseURL de tu backend local
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Asegurate de que el puerto coincida con tu backend
});

// Interceptor para agregar el token automáticamente a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;