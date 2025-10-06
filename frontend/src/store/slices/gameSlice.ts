import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Game {
    id: number;
    code: string;
    title: string;
    game_type: string;
    status: string;
    max_players: number;
    duration: number;
    difficulty: number;
    created_by_id: number;
    participants: any[];
    scores: any[];
}

export interface VerbGroup {
    title: string;
    verbs: string[];
}

export interface TenseGroup {
    title: string;
    tenses: string[];
}

export interface OngoingGameInfo {
    maxStep: number;
    maxTime: number;
    isOn: boolean;
}

interface GameState {
    currentGame: Game | null;
    activeGames: Game[];
    gameHistory: Game[];
    loading: boolean;
    error: string | null;
    
    // Game Room State
    currentVerbs: string[];
    currentTenses: string[];
    currentCustomVerbGroups: VerbGroup[];
    currentCustomTenseGroups: TenseGroup[];
    ongoingGameInfo: OngoingGameInfo;
}

const initialState: GameState = {
    currentGame: null,
    activeGames: [],
    gameHistory: [],
    loading: false,
    error: null,
    
    // Game Room Initial State
    currentVerbs: [],
    currentTenses: [],
    currentCustomVerbGroups: [],
    currentCustomTenseGroups: [],
    ongoingGameInfo: {
        maxStep: 5,
        maxTime: 10,
        isOn: false,
    },
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setCurrentGame: (state, action: PayloadAction<Game>) => {
            state.currentGame = action.payload;
        },
        clearCurrentGame: (state) => {
            state.currentGame = null;
        },
        setActiveGames: (state, action: PayloadAction<Game[]>) => {
            state.activeGames = action.payload;
        },
        addGame: (state, action: PayloadAction<Game>) => {
            state.activeGames.push(action.payload);
        },
        updateGame: (state, action: PayloadAction<Game>) => {
            const index = state.activeGames.findIndex(game => game.id === action.payload.id);
            if (index !== -1) {
                state.activeGames[index] = action.payload;
            }
            if (state.currentGame?.id === action.payload.id) {
                state.currentGame = action.payload;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        
        // Game Room Reducers
        setCurrentVerbs: (state, action: PayloadAction<string[]>) => {
            state.currentVerbs = action.payload;
        },
        setCurrentTenses: (state, action: PayloadAction<string[]>) => {
            state.currentTenses = action.payload;
        },
        addCurrentVerb: (state, action: PayloadAction<string>) => {
            if (!state.currentVerbs.includes(action.payload)) {
                state.currentVerbs.push(action.payload);
            }
        },
        removeCurrentVerb: (state, action: PayloadAction<string>) => {
            state.currentVerbs = state.currentVerbs.filter(verb => verb !== action.payload);
        },
        addCurrentTense: (state, action: PayloadAction<string>) => {
            if (!state.currentTenses.includes(action.payload)) {
                state.currentTenses.push(action.payload);
            }
        },
        removeCurrentTense: (state, action: PayloadAction<string>) => {
            state.currentTenses = state.currentTenses.filter(tense => tense !== action.payload);
        },
        setCurrentCustomVerbGroups: (state, action: PayloadAction<VerbGroup[]>) => {
            state.currentCustomVerbGroups = action.payload;
        },
        addCustomVerbGroup: (state, action: PayloadAction<VerbGroup>) => {
            state.currentCustomVerbGroups.push(action.payload);
        },
        removeCustomVerbGroup: (state, action: PayloadAction<string>) => {
            state.currentCustomVerbGroups = state.currentCustomVerbGroups.filter(
                group => group.title !== action.payload
            );
        },
        setCurrentCustomTenseGroups: (state, action: PayloadAction<TenseGroup[]>) => {
            state.currentCustomTenseGroups = action.payload;
        },
        addCustomTenseGroup: (state, action: PayloadAction<TenseGroup>) => {
            state.currentCustomTenseGroups.push(action.payload);
        },
        removeCustomTenseGroup: (state, action: PayloadAction<string>) => {
            state.currentCustomTenseGroups = state.currentCustomTenseGroups.filter(
                group => group.title !== action.payload
            );
        },
        setOngoingGameInfo: (state, action: PayloadAction<Partial<OngoingGameInfo>>) => {
            state.ongoingGameInfo = { ...state.ongoingGameInfo, ...action.payload };
        },
    },
});

export const {
    setCurrentGame,
    clearCurrentGame,
    setActiveGames,
    addGame,
    updateGame,
    setLoading,
    setError,
    setCurrentVerbs,
    setCurrentTenses,
    addCurrentVerb,
    removeCurrentVerb,
    addCurrentTense,
    removeCurrentTense,
    setCurrentCustomVerbGroups,
    addCustomVerbGroup,
    removeCustomVerbGroup,
    setCurrentCustomTenseGroups,
    addCustomTenseGroup,
    removeCustomTenseGroup,
    setOngoingGameInfo,
} = gameSlice.actions;

export default gameSlice.reducer;