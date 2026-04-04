import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// Add token and handle FormData content-type
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('pyq_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // If sending FormData, let the browser set Content-Type with boundary
    // Otherwise default to JSON
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    } else {
        config.headers['Content-Type'] = 'application/json';
    }

    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('pyq_token');
            localStorage.removeItem('pyq_user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
