import axios from 'axios';
import { useRouter } from 'next/navigation';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

api.interceptors.request.use(
  (config) => {
    // Vérifier si nous sommes dans un environnement avec localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['x-auth-token'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Supprimer le token invalide
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Rediriger vers la page de connexion
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const publicApi = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

export const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BACKEND_URL}/${imagePath}`;
};

export default api;
