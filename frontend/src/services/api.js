import axios from 'axios';

// In Docker: Nginx proxies /api → http://backend:8080/api
// In dev:    Vite proxies /api → http://localhost:8080/api (see vite.config.js)
const API = axios.create({
    baseURL: '/api',
});

// Add a request interceptor to attach JWT token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
