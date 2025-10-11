import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // Increased timeout for mobile devices
    headers: {
        'Content-Type': 'application/json',
        // iOS-specific headers
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    },
    // iOS Safari sometimes requires explicit credentials
    withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle token expiration and iOS-specific issues
api.interceptors.response.use(
    (response) => {
        console.log('API Response success:', response.config.url, response.status);
        return response;
    },
    async (error) => {
        console.error('API Response error:', error.config?.url, error.response?.status || error.message);

        const originalRequest = error.config;

        // iOS-specific network error handling
        if (!error.response && (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error'))) {
            console.warn('Network error detected - likely iOS/Safari issue');
            // Don't retry network errors immediately on iOS
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('token');
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    token: refreshToken,
                });

                const { token: newToken } = response.data;
                localStorage.setItem('token', newToken);

                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;