import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import ConjugationTestComponent from './components/ConjugationTestComponent';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Exercises from './pages/Exercises/Exercises';
import FindError from './pages/Games/FindError/FindError';
import GameRoom from './pages/Games/GameRoom';
import MatchMe from './pages/Games/MatchMe/MatchMe';
import Race from './pages/Games/Race/Race';
import WriteMe from './pages/Games/WriteMe/WriteMe';
import Home from './pages/Home/Home';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Profile from './pages/Profile/Profile';
import { RootState } from './store/store';

const App: React.FC = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    return (
        <div className="App">
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
                    element={
                        isAuthenticated ? (
                            <Layout>
                                <Dashboard />
                            </Layout>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/game-room/:gameId"
                    element={
                        isAuthenticated ? (
                            <Layout>
                                <GameRoom />
                            </Layout>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/games/:gameId"
                    element={
                        isAuthenticated ? (
                            <Layout>
                                <GameRoom />
                            </Layout>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/games/find-error"
                    element={
                        isAuthenticated ? (
                            <Layout>
                                <FindError />
                            </Layout>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/games/race"
                    element={
                        isAuthenticated ? (
                            <Layout>
                                <Race />
                            </Layout>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/games/write-me"
                    element={
                        isAuthenticated ? (
                            <Layout>
                                <WriteMe />
                            </Layout>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/games/matching"
                    element={
                        isAuthenticated ? (
                            <Layout>
                                <MatchMe />
                            </Layout>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/exercises"
                    element={
                        isAuthenticated ? (
                            <Layout>
                                <Exercises />
                            </Layout>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/leaderboard"
                    element={
                        isAuthenticated ? (
                            <Layout>
                                <Leaderboard />
                            </Layout>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/profile"
                    element={
                        isAuthenticated ? (
                            <Layout>
                                <Profile />
                            </Layout>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />

                {/* Development test route */}
                <Route
                    path="/test"
                    element={<ConjugationTestComponent />}
                />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
};

export default App;