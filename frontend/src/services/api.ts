import axios from 'axios';

// Configuração base da API
export const api = axios.create({
  baseURL: 'http://localhost:3334/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@clinica:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('@clinica:token');
      localStorage.removeItem('@clinica:user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 