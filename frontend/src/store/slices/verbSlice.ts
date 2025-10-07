import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AVAILABLE_TENSES, CACHE_DURATION } from '../../constants';
import api from '../../services/api';
import { Exercise, Verb, VerbState } from '../../types';

// Interfaces now imported from types/verb.types.ts

// Constants and helper functions now imported from separate files

const initialState: VerbState = {
    verbs: [],
    tenses: [],
    exercises: [],
    currentExercise: null,
    loading: false,
    error: null,
    lastFetched: null,
};



// Async thunk to fetch verbs
export const fetchVerbs = createAsyncThunk(
    'verb/fetchVerbs',
    async (_, { rejectWithValue }) => {
        try {
            // Check cache first
            const cachedVerbs = JSON.parse(localStorage.getItem('verbs') || '[]');
            const cachedTimestamp = localStorage.getItem('verbs_timestamp');
            console.log('VerbSlice - Cache check:', cachedVerbs.length, 'cached verbs');

            // if cached is valid and has more than 0 verbs, return it
            if (cachedVerbs.length > 0 && cachedTimestamp) {
                const timestamp = parseInt(cachedTimestamp, 10);
                const now = Date.now();

                if (now - timestamp < CACHE_DURATION) {
                    console.log('VerbSlice - Using cached verbs:', cachedVerbs.length, 'verbs');
                    return cachedVerbs;
                }
            }

            // Fetch from API
            console.log('VerbSlice - Fetching verbs from API...');
            const response = await api.get('/verbs');
            const verbs = response.data;
            console.log('VerbSlice - Fetched verbs:', verbs.length, 'verbs');
            console.log('VerbSlice - First few verbs:', verbs.slice(0, 3));

            // Cache the results
            localStorage.setItem('verbs', JSON.stringify(verbs));
            localStorage.setItem('verbs_timestamp', Date.now().toString());

            return verbs;
        } catch (error: any) {
            console.error('VerbSlice - Error fetching verbs:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch verbs');
        }
    }
);

// Async thunk to fetch tenses
export const fetchTenses = createAsyncThunk(
    'verb/fetchTenses',
    async (_, { rejectWithValue }) => {
        try {
            // Check cache first
            const cachedTenses = localStorage.getItem('tenses');
            const cachedTimestamp = localStorage.getItem('tenses_timestamp');

            if (cachedTenses && cachedTimestamp) {
                const timestamp = parseInt(cachedTimestamp, 10);
                const now = Date.now();

                if (now - timestamp < CACHE_DURATION) {
                    return JSON.parse(cachedTenses);
                }
            }

            // If no API endpoint for tenses, use hardcoded list matching database structure
            const tenses = [...AVAILABLE_TENSES];

            // Cache the results
            localStorage.setItem('tenses', JSON.stringify(tenses));
            localStorage.setItem('tenses_timestamp', Date.now().toString());

            return tenses;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenses');
        }
    }
);

const verbSlice = createSlice({
    name: 'verb',
    initialState,
    reducers: {
        setVerbs: (state, action: PayloadAction<Verb[]>) => {
            state.verbs = action.payload;
        },
        setTenses: (state, action: PayloadAction<string[]>) => {
            state.tenses = action.payload;
        },
        setExercises: (state, action: PayloadAction<Exercise[]>) => {
            state.exercises = action.payload;
        },
        setCurrentExercise: (state, action: PayloadAction<Exercise | null>) => {
            state.currentExercise = action.payload;
        },
        addVerb: (state, action: PayloadAction<Verb>) => {
            state.verbs.push(action.payload);
        },
        updateVerb: (state, action: PayloadAction<Verb>) => {
            const index = state.verbs.findIndex(verb => verb.id === action.payload.id);
            if (index !== -1) {
                state.verbs[index] = action.payload;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearCache: (state) => {
            localStorage.removeItem('verbs');
            localStorage.removeItem('verbs_timestamp');
            localStorage.removeItem('tenses');
            localStorage.removeItem('tenses_timestamp');
            state.verbs = [];
            state.tenses = [];
            state.lastFetched = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Verbs
            .addCase(fetchVerbs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerbs.fulfilled, (state, action) => {
                state.loading = false;
                state.verbs = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchVerbs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Tenses
            .addCase(fetchTenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenses.fulfilled, (state, action) => {
                state.loading = false;
                state.tenses = action.payload;
            })
            .addCase(fetchTenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setVerbs,
    setTenses,
    setExercises,
    setCurrentExercise,
    addVerb,
    updateVerb,
    setLoading,
    setError,
    clearCache,
} = verbSlice.actions;

export default verbSlice.reducer;