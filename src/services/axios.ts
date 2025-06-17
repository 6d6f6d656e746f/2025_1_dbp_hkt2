import axios from 'axios';

export const BACKEND_URL = "http://198.211.105.95:8080";

const axiosInstance = axios.create({
  baseURL: BACKEND_URL
});

// Add a request interceptor to include the token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
