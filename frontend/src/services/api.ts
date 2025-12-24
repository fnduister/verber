import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

console.log('🔧 API Configuration:', {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    API_BASE_URL,
    allEnvVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
});

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

// User API
export const userAPI = {
    getRecentPlayers: (limit: number = 20) =>
        api.get(`/users/recent?limit=${limit}`),
    getOnlineUsers: () =>
        api.get('/users/online'),
    presencePing: () => api.post('/presence/ping'),
};

// Invite API
export interface Invite {
    id: number;
    sender_id: number;
    receiver_id: number;
    game_id: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    read_at?: string;
    created_at: string;
    updated_at: string;
    sender?: {
        id: number;
        username: string;
        avatar: string;
        level: number;
    };
    receiver?: {
        id: number;
        username: string;
        avatar: string;
        level: number;
    };
    game?: {
        game_id: string;
        title: string;
        game_type: string;
        max_players: number;
        status: string;
    };
}

export const inviteAPI = {
    sendInvite: (receiverId: number, gameId: string) =>
        api.post('/invites/send', { receiver_id: receiverId, game_id: gameId }),
    
    getInvites: (status?: string) =>
        api.get<{ invites: Invite[] }>(`/invites${status ? `?status=${status}` : ''}`),
    
    getSentInvites: () =>
        api.get<{ invites: Invite[] }>('/invites/sent'),
    
    getUnreadCount: () =>
        api.get<{ count: number }>('/invites/unread-count'),
    
    acceptInvite: (inviteId: number) =>
        api.post(`/invites/${inviteId}/accept`),
    
    declineInvite: (inviteId: number) =>
        api.post(`/invites/${inviteId}/decline`),
    
    markAsRead: (inviteId: number) =>
        api.post(`/invites/${inviteId}/read`),
};

// Dev-only Multiplayer utilities (only use in development)
export const devMultiplayerAPI = {
    createFakePlayer: (username: string) => api.post('/dev/fake-players/create', { username }),
    disconnectFakePlayer: (userId: number) => api.post('/dev/fake-players/disconnect', { user_id: userId }),
    joinGameAsFakePlayer: (params: { gameId: string; username?: string; userId?: number }) =>
        api.post('/dev/fake-players/join-game', {
            game_id: params.gameId,
            username: params.username,
            user_id: params.userId,
        }),
};