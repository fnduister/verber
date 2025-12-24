import { Box, CircularProgress } from '@mui/material';
import React, { lazy, Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { GlobalMultiplayerListener } from './components/GlobalEvents/GlobalMultiplayerListener';
import { GlobalToast } from './components/GlobalToast/GlobalToast';
import AppLayout from './components/Layout/AppLayout';
import { fetchUserProfile } from './store/slices/authSlice';
import { AppDispatch, RootState } from './store/store';

// Lazy load components
const Home = lazy(() => import('./pages/Home/Home'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Study = lazy(() => import('./pages/Study/Study'));
const ConjugationTables = lazy(() => import('./pages/Study/ConjugationTables'));
const VerbPractice = lazy(() => import('./pages/Study/Practice'));
const Games = lazy(() => import('./pages/Games/Games'));
const SinglePlayer = lazy(() => import('./pages/Games/SinglePlayer'));
const Multiplayer = lazy(() => import('./pages/Games/Multiplayer'));
const GameRoom = lazy(() => import('./pages/Games/GameRoom'));
const Exercises = lazy(() => import('./pages/Exercises/Exercises'));
const Leaderboard = lazy(() => import('./pages/Leaderboard/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile/Profile'));

// Single player games
const FindError = lazy(() => import('./pages/Games/FindError/FindError'));
const Race = lazy(() => import('./pages/Games/Race/Race'));
const WriteMe = lazy(() => import('./pages/Games/WriteMe/WriteMe'));
const MatchMe = lazy(() => import('./pages/Games/MatchMe/MatchMe'));
const RandomVerb = lazy(() => import('./pages/Games/RandomVerb/RandomVerb'));
const Sentence = lazy(() => import('./pages/Games/Sentence/Sentence'));
const Participe = lazy(() => import('./pages/Games/Participe/Participe'));

// Multiplayer games
const FindErrorMultiplayer = lazy(() => import('./pages/Games/FindError/FindErrorMultiplayer'));

// Dev test component
const ConjugationTestComponent = lazy(() => import('./components/ConjugationTestComponent'));

// Loading fallback component
const LoadingFallback = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
    </Box>
);

// Protected Route wrapper component
interface ProtectedRouteProps {
    children: React.ReactElement;
    isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route wrapper (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated }) => {
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);

    // Restore user data if we have a token but no user info
    useEffect(() => {
        if (isAuthenticated && token && !user) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, isAuthenticated, token, user]);

    return (
        <div className="App">
            <GlobalToast />
            <GlobalMultiplayerListener />
            <AppLayout>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {/* Public routes - redirect to dashboard if authenticated */}
                        <Route path="/" element={<PublicRoute isAuthenticated={isAuthenticated}><Home /></PublicRoute>} />
                        <Route path="/login" element={<PublicRoute isAuthenticated={isAuthenticated}><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute isAuthenticated={isAuthenticated}><Register /></PublicRoute>} />

                        {/* Protected routes - Main sections */}
                        <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
                        <Route path="/exercises" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Exercises /></ProtectedRoute>} />
                        <Route path="/leaderboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Leaderboard /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Profile /></ProtectedRoute>} />

                        {/* Study routes */}
                        <Route path="/study" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Study /></ProtectedRoute>} />
                        <Route path="/study/conjugation" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ConjugationTables /></ProtectedRoute>} />
                        <Route path="/study/practice" element={<ProtectedRoute isAuthenticated={isAuthenticated}><VerbPractice /></ProtectedRoute>} />

                        {/* Games routes */}
                        <Route path="/games" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Games /></ProtectedRoute>} />
                        <Route path="/games/singleplayer" element={<ProtectedRoute isAuthenticated={isAuthenticated}><SinglePlayer /></ProtectedRoute>} />
                        <Route path="/games/multiplayer" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Multiplayer /></ProtectedRoute>} />

                        {/* Single player game routes */}
                        <Route path="/games/find-error" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FindError /></ProtectedRoute>} />
                        <Route path="/games/race" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Race /></ProtectedRoute>} />
                        <Route path="/games/write-me" element={<ProtectedRoute isAuthenticated={isAuthenticated}><WriteMe /></ProtectedRoute>} />
                        <Route path="/games/matching" element={<ProtectedRoute isAuthenticated={isAuthenticated}><MatchMe /></ProtectedRoute>} />
                        <Route path="/games/random-verb" element={<ProtectedRoute isAuthenticated={isAuthenticated}><RandomVerb /></ProtectedRoute>} />
                        <Route path="/games/sentence" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Sentence /></ProtectedRoute>} />
                        <Route path="/games/participe" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Participe /></ProtectedRoute>} />

                        {/* Multiplayer game routes */}
                        <Route path="/games/multiplayer/find-error/:gameId" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FindErrorMultiplayer /></ProtectedRoute>} />

                        {/* Legacy game room routes (kept for backward compatibility) */}
                        <Route path="/game-room/:gameId" element={<ProtectedRoute isAuthenticated={isAuthenticated}><GameRoom /></ProtectedRoute>} />
                        <Route path="/games/:gameId" element={<ProtectedRoute isAuthenticated={isAuthenticated}><GameRoom /></ProtectedRoute>} />

                        {/* Development test route */}
                        {process.env.NODE_ENV === 'development' && (
                            <Route path="/test" element={<ConjugationTestComponent />} />
                        )}

                        {/* Catch all route - redirect to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </AppLayout>
        </div>
    );
};

export default App;