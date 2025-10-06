import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProgress {
    id: number;
    user_id: number;
    verb_id: number;
    mastery: number;
    times_correct: number;
    times_wrong: number;
    last_practiced: string;
}

export interface UserStats {
    user_id: number;
    total_games: number;
    games_won: number;
    total_exercises: number;
    average_accuracy: number;
    total_time_spent: number;
    verbs_mastered: number;
    current_streak: number;
    longest_streak: number;
    favorite_category: string;
}

interface UserState {
    progress: UserProgress[];
    stats: UserStats | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    progress: [],
    stats: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setProgress: (state, action: PayloadAction<UserProgress[]>) => {
            state.progress = action.payload;
        },
        setStats: (state, action: PayloadAction<UserStats>) => {
            state.stats = action.payload;
        },
        updateProgress: (state, action: PayloadAction<UserProgress>) => {
            const index = state.progress.findIndex(p => p.verb_id === action.payload.verb_id);
            if (index !== -1) {
                state.progress[index] = action.payload;
            } else {
                state.progress.push(action.payload);
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setProgress,
    setStats,
    updateProgress,
    setLoading,
    setError,
} = userSlice.actions;

export default userSlice.reducer;