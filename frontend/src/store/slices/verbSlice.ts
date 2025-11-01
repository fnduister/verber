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
    'verbs/fetchVerbs',
    async (_, { rejectWithValue }) => {
        console.log('🚀 fetchVerbs called');

        // iOS debugging information
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        const userAgent = navigator.userAgent;

        console.log('🍎 iOS Debug Info:', { isIOS, isSafari, userAgent });

        // Check localStorage availability
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            console.log('✅ localStorage is available');
        } catch (e) {
            console.error('❌ localStorage is not available:', e);
        }

        // iOS-specific retry logic
        const maxRetries = (isIOS || isSafari) ? 3 : 1;
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}/${maxRetries} to fetch verbs`);

                const response = await api.get('/verbs');
                console.log('📊 Verbs API response:', {
                    status: response.status,
                    dataType: typeof response.data,
                    hasVerbs: !!response.data?.verbs,
                    verbsLength: response.data?.verbs?.length,
                    firstVerb: response.data?.verbs?.[0],
                    attempt,
                    isIOS,
                    isSafari
                });

                return response.data.verbs;

            } catch (error: any) {
                lastError = error;
                console.error(`💥 fetchVerbs error (attempt ${attempt}):`, {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    isNetworkError: !error.response,
                    isIOS,
                    isSafari,
                    userAgent
                });

                // Enhanced iOS-specific error messages
                if (isIOS || isSafari) {
                    if (!error.response) {
                        console.error('🍎 iOS Network Error - possible CORS or network connectivity issue');
                    } else if (error.response.status === 0) {
                        console.error('🍎 iOS Status 0 - likely CORS preflight failure');
                    }
                }

                // Wait before retry (iOS/Safari only)
                if (attempt < maxRetries && (isIOS || isSafari)) {
                    const delay = attempt * 1000; // 1s, 2s delays
                    console.log(`⏰ Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        console.error('🚫 All retry attempts failed');
        return rejectWithValue(lastError?.message || 'Failed to fetch verbs after retries');
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