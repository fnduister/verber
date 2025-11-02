import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import ConjugationTestComponent from './components/ConjugationTestComponent';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Exercises from './pages/Exercises/Exercises';
import FindError from './pages/Games/FindError/FindError';
import GameRoom from './pages/Games/GameRoom';
import Games from './pages/Games/Games';
import MatchMe from './pages/Games/MatchMe/MatchMe';
import Participe from './pages/Games/Participe/Participe';
import Race from './pages/Games/Race/Race';
import RandomVerb from './pages/Games/RandomVerb/RandomVerb';
import Sentence from './pages/Games/Sentence/Sentence';
import WriteMe from './pages/Games/WriteMe/WriteMe';
import Home from './pages/Home/Home';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Profile from './pages/Profile/Profile';
import ConjugationTables from './pages/Study/ConjugationTables';
import Study from './pages/Study/Study';
import VerbPractice from './pages/Study/VerbPractice';
import { fetchUserProfile } from './store/slices/authSlice';
import { AppDispatch, RootState } from './store/store';

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
            <AppLayout>
                <Routes>
                    {/* Public routes */}
                    <Route 
                        path="/" 
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} 
                    />
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
                    />
                    <Route
                        path="/register"
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
                    />

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/study"
                        element={isAuthenticated ? <Study /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/study/conjugation"
                        element={isAuthenticated ? <ConjugationTables /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/study/practice"
                        element={isAuthenticated ? <VerbPractice /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/games"
                        element={isAuthenticated ? <Games /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/game-room/:gameId"
                        element={isAuthenticated ? <GameRoom /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/games/:gameId"
                        element={isAuthenticated ? <GameRoom /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/games/find-error"
                        element={isAuthenticated ? <FindError /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/games/race"
                        element={isAuthenticated ? <Race /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/games/write-me"
                        element={isAuthenticated ? <WriteMe /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/games/matching"
                        element={isAuthenticated ? <MatchMe /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/games/random-verb"
                        element={isAuthenticated ? <RandomVerb /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/games/sentence"
                        element={isAuthenticated ? <Sentence /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/games/participe"
                        element={isAuthenticated ? <Participe /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/exercises"
                        element={isAuthenticated ? <Exercises /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/leaderboard"
                        element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/profile"
                        element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
                    />

                    {/* Development test route */}
                    <Route
                        path="/test"
                        element={<ConjugationTestComponent />}
                    />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AppLayout>
        </div>
    );
};

export default App;