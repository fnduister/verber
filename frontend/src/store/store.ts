import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import gameSlice from './slices/gameSlice';
import userSlice from './slices/userSlice';
import verbSlice from './slices/verbSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        game: gameSlice,
        user: userSlice,
        verb: verbSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;