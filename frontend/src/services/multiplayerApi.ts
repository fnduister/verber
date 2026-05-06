import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface MultiplayerGame {
    id: string;
    game_type: string;
    title: string;
    host_id: number;
    host: {
        id: number;
        username: string;
        avatar?: string;
    };
    max_players: number;
    difficulty: string;
    duration: number;
    status: 'waiting' | 'starting' | 'in_progress' | 'finished' | 'cancelled';
    current_step: number;
    max_steps: number;
    created_at: string;
    config: {
        verbs: string[];
        tenses: string[];
        max_time: number;
        verb_groups?: string[];
        tense_groups?: string[];
    };
    players: MultiplayerGamePlayer[];
}

export interface MultiplayerGamePlayer {
    id: number;
    game_id: string;
    user_id: number;
    user: {
        id: number;
        username: string;
        avatar?: string;
        level: number;
    };
    score: number;
    is_ready: boolean;
    is_host: boolean;
    joined_at: string;
}

export interface GameRound {
    id: number;
    game_id: string;
    round_number: number;
    round_data: {
        sentence: string;
        error_position: number;
        error_word: string;
        correct_word: string;
        verb: string;
        tense: string;
        pronoun?: string;
        pronoun_index?: number;
        displayed_word?: string;
        correct_tense?: string;
        visible_tenses?: string[];
        pronouns?: string[];
        correct_answers?: string[];
        expected_count?: number;
        options?: string[];
        match_items?: Array<{
            id: string;
            tense: string;
            verb: string;
            conjugation: string;
            pronoun: string;
            pronoun_index: number;
        }>;
        matches?: Record<string, string>;
    };
    started_at: string;
    finished_at?: string;
}

export interface CreateGameRequest {
    game_type: string;
    title?: string;
    max_players: number;
    max_steps: number;
    difficulty: string;
    duration: number;
    config: {
        verbs: string[];
        tenses: string[];
        max_time: number;
        verb_groups?: string[];
        tense_groups?: string[];
    };
}

export interface SubmitAnswerRequest {
    answer: string;
    is_correct: boolean;
    points: number;
    time_spent: number; // milliseconds
}

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Create axios instance with auth
const apiClient = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Multiplayer API request:', {
        url: config.url,
        method: config.method,
        hasAuth: !!token,
        tokenPreview: token?.substring(0, 20) + '...'
    });
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Multiplayer API: Unauthorized (401) - Token may be expired');
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export const multiplayerAPI = {
    // Create a new multiplayer game
    createGame: async (gameData: CreateGameRequest): Promise<MultiplayerGame> => {
        const response = await apiClient.post('/multiplayer/games/create', gameData);
        return response.data.game;
    },

    // Get waiting rooms
    getWaitingRooms: async (): Promise<MultiplayerGame[]> => {
        const response = await apiClient.get('/multiplayer/games/waiting');
        return response.data.games;
    },

    // Get a specific game
    getGame: async (gameId: string): Promise<MultiplayerGame> => {
        const response = await apiClient.get(`/multiplayer/games/${gameId}`);
        return response.data.game;
    },

    // Join a game
    joinGame: async (gameId: string): Promise<MultiplayerGamePlayer> => {
        const response = await apiClient.post(`/multiplayer/games/${gameId}/join`);
        return response.data.player;
    },

    // Leave a game
    leaveGame: async (gameId: string): Promise<void> => {
        await apiClient.post(`/multiplayer/games/${gameId}/leave`);
    },

    // Set ready status
    setReady: async (gameId: string, isReady: boolean): Promise<MultiplayerGamePlayer> => {
        const response = await apiClient.post(`/multiplayer/games/${gameId}/ready`, {
            is_ready: isReady,
        });
        return response.data.player;
    },

    // Start game manually (host only)
    startGame: async (gameId: string): Promise<void> => {
        await apiClient.post(`/multiplayer/games/${gameId}/start`);
    },

    // Start a round
    startRound: async (gameId: string, roundNumber: number, roundData: any): Promise<GameRound> => {
        const response = await apiClient.post(`/multiplayer/games/${gameId}/rounds`, {
            round_number: roundNumber,
            round_data: roundData,
        });
        return response.data.round;
    },

    // Get latest round for recovery when round_start event is missed
    getLatestRound: async (gameId: string): Promise<GameRound> => {
        const response = await apiClient.get(`/multiplayer/games/${gameId}/rounds/latest`);
        return response.data.round;
    },

    // Submit answer
    submitAnswer: async (
        gameId: string,
        roundId: number,
        answerData: SubmitAnswerRequest
    ): Promise<void> => {
        await apiClient.post(
            `/multiplayer/games/${gameId}/rounds/${roundId}/answers`,
            answerData
        );
    },

    // Finish game
    finishGame: async (gameId: string): Promise<MultiplayerGamePlayer[]> => {
        const response = await apiClient.post(`/multiplayer/games/${gameId}/finish`);
        return response.data.players;
    },

    // Get WebSocket URL for a game
    getWebSocketUrl: (gameId: string): string => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const baseUrl = API_URL.replace('http://', '').replace('https://', '').replace('/api', '');
        const token = getAuthToken();
        return `${wsProtocol}//${baseUrl}/api/multiplayer/games/${gameId}/ws?token=${token}`;
    },

    // Send heartbeat to track active presence
    sendHeartbeat: async (gameId: string): Promise<void> => {
        await apiClient.post(`/multiplayer/games/${gameId}/heartbeat`);
    },
};
