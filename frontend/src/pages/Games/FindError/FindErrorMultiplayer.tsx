import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
    Alert, Avatar, Box, Button, Chip, CircularProgress, Container, Divider, Grid, LinearProgress, Paper, Snackbar, Stack, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useMultiplayerWebSocket } from '../../../hooks/useMultiplayerWebSocket';
import {
    GameRound, multiplayerAPI,
    MultiplayerGame
} from '../../../services/multiplayerApi';
import { RootState } from '../../../store/store';

export interface FindErrorGameData {
    sentence?: string;
    error: string;
    visibleWords: string[];
    stepTense: string;
    correctAnswer: string;
    verb?: string;
    tense?: string;
}

const FindErrorMultiplayer: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [game, setGame] = useState<MultiplayerGame | null>(null);
    const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
    const [gameData, setGameData] = useState<FindErrorGameData | null>(null);
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFinalResults, setShowFinalResults] = useState(false);
    const [finalResults, setFinalResults] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
    const [answerResult, setAnswerResult] = useState<{word: string, correct: boolean} | null>(null);
    const [allPlayersAnswered, setAllPlayersAnswered] = useState(false);
    const [roundWinners, setRoundWinners] = useState<number[]>([]);
    const [roundScoreGains, setRoundScoreGains] = useState<{[userId: number]: number}>({});
    const [playersAnswered, setPlayersAnswered] = useState<Set<number>>(new Set());
    const [previousScores, setPreviousScores] = useState<{[userId: number]: number}>({});
    const isSubmittingRef = useRef(false);
    const timerStartedRef = useRef(false);
    const autoSubmittedRef = useRef(false);
    const isAutoSubmittingRef = useRef(false);
    const isPageVisible = useRef(true);
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

    // WebSocket connection - only connect after game is loaded
    const { isConnected } = useMultiplayerWebSocket({
        gameId: gameId!,
        enabled: !loading && !!game, // Only connect after game data is loaded
        onGameStarting: (data) => {
            console.log('Game starting countdown:', data);
            if (data.countdown !== undefined) {
                setGameStartCountdown(data.countdown);
                // Clear countdown when it reaches 0
                if (data.countdown === 0) {
                    setTimeout(() => setGameStartCountdown(null), 1000);
                }
            }
        },
        onTimerSync: (data) => {
            console.log('Timer sync:', data);
            // Optionally update timeLeft from server for synchronization
            if (data.time_left !== undefined) {
                setTimeLeft(data.time_left);
            }
        },
        onAnswerSubmitted: (data) => {
            console.log('Player answered:', data);
            // Mark this player as answered for all clients
            if (data.user_id) {
                setPlayersAnswered(prev => new Set(prev).add(data.user_id));
            }
        },
        onPlayerJoined: (data) => {
            console.log('Player joined:', data);
            // Support both payload shapes: {player: {...}} or raw player
            const joinedPlayer = (data as any).player ? (data as any).player : data;
            if (game && joinedPlayer && !game.players.find(p => p.user_id === joinedPlayer.user_id)) {
                setGame({
                    ...game,
                    players: [...game.players, joinedPlayer],
                });
            }
        },
        onPlayerLeft: (data) => {
            console.log('🔴 Player left:', data);
            
            // Find player name before removing
            const leftPlayer = game?.players.find(p => p.user_id === data.user_id);
            const playerName = data.username || leftPlayer?.user?.username || 'A player';
            
            // Show toast notification to remaining players
            if (leftPlayer && leftPlayer.user_id !== currentUser?.id) {
                setToastMessage(`${playerName} left the game`);
                setShowToast(true);
            }
            
            // Update game state to remove player
            setGame((prevGame) => {
                if (!prevGame) return null;
                return {
                    ...prevGame,
                    players: prevGame.players.filter(p => p.user_id !== data.user_id),
                };
            });
            
            // If game ended due to insufficient players, show final results
            if (data.game_ended) {
                console.log('🏁 Game ended - only one player left, showing final results');
                if (data.final_results) {
                    setFinalResults(data.final_results);
                } else {
                    // Fallback: create results from current game state
                    if (game) {
                        const results = {
                            game_id: game.id,
                            players: game.players
                                .filter(p => p.user_id !== data.user_id)
                                .sort((a, b) => b.score - a.score),
                        };
                        setFinalResults(results);
                    }
                }
                setShowFinalResults(true);
            }
        },
        onPlayerReady: (data) => {
            console.log('Player ready:', data);
            if (game) {
                setGame({
                    ...game,
                    players: game.players.map((p) =>
                        p.user_id === data.user_id ? { ...p, is_ready: data.is_ready } : p
                    ),
                });
            }
        },
        onRoundStart: (data) => {
            console.log('🔵 Round start - Full data:', data);
            // Normalize payload: accept {round: {...}} or raw round object
            const round = (data as any)?.round ?? (data as any);
            if (!round || !round.round_data) {
                console.error('Invalid or missing round_data in payload:', data);
                setError(t('games.multiplayer.failedToLoadGame'));
                return;
            }

            console.log('🔵 Resetting all round state...');
            // Update game status to 'in_progress' when first round starts
            if (game && game.status === 'waiting') {
                setGame({
                    ...game,
                    status: 'in_progress'
                });
            }

            // Reset all state for new round - ORDER MATTERS!
            // 1. Update data first
            setHasAnswered(false); // Enable selection
            setSelectedWord(null); // Clear selection
            setAnswerResult(null); // Clear answer feedback
            setAllPlayersAnswered(false); // Reset all answered flag
            setRoundWinners([]); // Clear round winners
            setRoundScoreGains({}); // Clear score gains
            setPlayersAnswered(new Set()); // Clear answered players
            // Save current scores as previous for next round comparison
            if (game) {
                const scores: {[userId: number]: number} = {};
                game.players.forEach(p => { scores[p.user_id] = p.score; });
                setPreviousScores(scores);
            }
            setCurrentRound(round); // Set new round
            setTimeLeft(game?.config.max_time || 30); // Reset timer
            
            // Reset all refs
            isSubmittingRef.current = false;
            timerStartedRef.current = false;
            autoSubmittedRef.current = false;
            isAutoSubmittingRef.current = false;
            
            // Transform round data to game data format
            const roundData = round.round_data;
            console.log('🔵 Setting game data from round:', roundData);
            console.log('🔵 State after reset - hasAnswered: false, selectedWord: null, timeLeft:', game?.config.max_time || 30);
            setGameData({
                error: roundData.error_word,
                visibleWords: roundData.options || [],
                stepTense: roundData.tense,
                correctAnswer: roundData.correct_word,
                verb: roundData.verb,
                tense: roundData.tense,
            });

            // 2. Show the game board LAST (after data is ready)
        },
        onRoundEnd: (data) => {
            console.log('Round end:', data);
            
            // Update player scores if players data is available
            if (game && (data as any).players && Array.isArray((data as any).players)) {
                // Calculate score gains for this round
                const scoreGains: {[userId: number]: number} = {};
                const updatedPlayers = game.players.map((p) => {
                    const updatedPlayer = (data as any).players.find((player: any) => player.user_id === p.user_id);
                    if (updatedPlayer) {
                        const previousScore = previousScores[p.user_id] || 0;
                        const gain = updatedPlayer.score - previousScore;
                        scoreGains[p.user_id] = gain;
                        return { ...p, score: updatedPlayer.score };
                    }
                    return p;
                });
                setGame({ ...game, players: updatedPlayers });
                setRoundScoreGains(scoreGains);
                
                // Determine round winners (players with highest score gain in THIS round)
                if ((data as any).round_winners && Array.isArray((data as any).round_winners)) {
                    setRoundWinners((data as any).round_winners);
                } else {
                    // Fallback: find player(s) with highest score gain this round
                    const gains = Object.values(scoreGains);
                    const maxGain = Math.max(...gains);
                    
                    if (maxGain > 0) {
                        // Someone won - find all players with max gain
                        const winners = Object.entries(scoreGains)
                            .filter(([_, gain]) => gain === maxGain)
                            .map(([userId, _]) => parseInt(userId));
                        setRoundWinners(winners);
                    } else if (gains.every(gain => gain === 0)) {
                        // No one scored - mark all as "winners" for special animation
                        setRoundWinners([-1]); // Special value to indicate "no winners"
                    } else {
                        setRoundWinners([]);
                    }
                }
            }
            
            // Mark that all players have answered
            setAllPlayersAnswered(true);
        },
        onGameFinished: (data) => {
            console.log('Game finished:', data);
            setFinalResults(data);
            setShowFinalResults(true);
            // Stop the timer
            setCurrentRound(null);
        },
        onError: (err) => {
            console.error('WebSocket error:', err);
            setError(t('games.multiplayer.connectionError'));
        },
    });

    // Track page visibility to detect tab switches
    useEffect(() => {
        const handleVisibilityChange = () => {
            isPageVisible.current = !document.hidden;
            console.log('📍 Page visibility changed:', isPageVisible.current ? 'visible' : 'hidden');
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Send heartbeat to server while on game page
    useEffect(() => {
        if (!gameId || !game || game.status !== 'in_progress') {
            return;
        }

        // Send initial heartbeat
        const sendHeartbeat = async () => {
            if (isPageVisible.current) {
                try {
                    await multiplayerAPI.sendHeartbeat(gameId);
                } catch (err) {
                    console.error('Failed to send heartbeat:', err);
                }
            }
        };

        // Send heartbeat every 5 seconds
        sendHeartbeat();
        heartbeatInterval.current = setInterval(sendHeartbeat, 5000);

        return () => {
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
                heartbeatInterval.current = null;
            }
        };
    }, [gameId, game?.status]);

    // Load game data & auto-join if not yet participant (rejoin supported)
    useEffect(() => {
        const initLobby = async () => {
            if (!gameId) {
                setError(t('games.multiplayer.gameNotFound'));
                setLoading(false);
                return;
            }
            try {
                console.log('Loading game data for gameId:', gameId);
                const fetched = await multiplayerAPI.getGame(gameId);
                console.log('Fetched game:', fetched);
                console.log('Current user ID:', currentUser?.id);
                console.log('Players in game:', fetched.players);
                
                // Ensure players array exists
                if (!fetched.players) {
                    fetched.players = [];
                }
                
                // Determine if current user already a player
                const alreadyPlayer = !!fetched.players.find(p => p.user_id === currentUser?.id);
                console.log('Already player?', alreadyPlayer);
                
                // If game waiting and user not in players and capacity available => auto join
                if (fetched.status === 'waiting' && !alreadyPlayer && fetched.players.length < fetched.max_players) {
                    console.log('Auto-joining game...');
                    try {
                        const newPlayer = await multiplayerAPI.joinGame(gameId);
                        console.log('Auto-join successful, new player:', newPlayer);
                        fetched.players.push(newPlayer);
                    } catch (joinErr) {
                        console.warn('Auto-join failed (maybe already in game):', joinErr);
                    }
                }
                setGame(fetched);
            } catch (err) {
                console.error('Error loading game:', err);
                setError(t('games.multiplayer.failedToLoadGame'));
            } finally {
                setLoading(false);
            }
        };
        initLobby();
    }, [gameId, currentUser?.id, t]);

    const handleManualJoin = async () => {
        if (!game || !gameId) return;
        if (game.status !== 'waiting') return;
        if (game.players.find(p => p.user_id === currentUser?.id)) return;
        try {
            const newPlayer = await multiplayerAPI.joinGame(gameId);
            setGame({ ...game, players: [...game.players, newPlayer] });
        } catch (err) {
            console.error('Join failed:', err);
            setError(t('games.multiplayer.failedToJoin'));
        }
    };

    // Timer countdown - calculate from server time to avoid tab sync issues
    useEffect(() => {
        if (!currentRound) {
            console.log('⏱️ Timer: No current round');
            return;
        }

        // Calculate time left based on server's round start time
        const calculateTimeLeft = () => {
            const roundStartTime = new Date(currentRound.started_at).getTime();
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - roundStartTime) / 1000);
            const maxTime = game?.config.max_time || 30;
            const remaining = Math.max(0, maxTime - elapsedSeconds);
            return remaining;
        };

        // Update timer every 100ms for accuracy
        const updateTimer = () => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            
            if (remaining <= 0) {
                console.log('⏱️ Timer: Time is up');
                return;
            }
        };

        if (!timerStartedRef.current) {
            console.log('⏱️ Timer: Starting for round', currentRound.round_number, 'started at', currentRound.started_at);
            timerStartedRef.current = true;
        }

        updateTimer(); // Initial update
        const timer = setInterval(updateTimer, 50); // Update every 50ms for smoother animation

        return () => clearInterval(timer);
    }, [currentRound, hasAnswered, game?.config.max_time]);

    const handleReady = async () => {
        if (!gameId || !game) return;

        try {
            const updatedPlayer = await multiplayerAPI.setReady(gameId, true);
            setGame({
                ...game,
                players: game.players.map((p) =>
                    p.user_id === currentUser?.id ? updatedPlayer : p
                ),
            });
        } catch (err) {
            console.error('Error setting ready:', err);
            setError(t('games.multiplayer.failedToSetReady'));
        }
    };

    const handleStartGame = async () => {
        if (!gameId || !game) return;

        try {
            await multiplayerAPI.startGame(gameId);
        } catch (err: any) {
            console.error('Error starting game:', err);
            setError(err.response?.data?.error || t('games.multiplayer.failedToStartGame'));
        }
    };

    const handleSelectWord = (word: string) => {
        console.log('🟢 handleSelectWord called with:', word);
        console.log('🟢 Current state - hasAnswered:', hasAnswered, 'selectedWord:', selectedWord, 'isSubmitting:', isSubmittingRef.current);
        
        if (hasAnswered) {
            console.log('🔴 Selection blocked - already answered');
            return;
        }
        if (isSubmittingRef.current) {
            console.log('🔴 Selection blocked - currently submitting');
            return;
        }
        
        setSelectedWord(word);
        console.log('🟢 selectedWord set to:', word);
    };

    const handleSubmitAnswer = async (answer: string, isCorrect: boolean) => {
        console.log('handleSubmitAnswer called with answer:', answer, 'isCorrect:', isCorrect);
        if (!gameId || !currentRound || hasAnswered || isSubmittingRef.current) {
            console.log('Submit blocked - gameId:', gameId, 'currentRound:', currentRound, 'hasAnswered:', hasAnswered, 'isSubmitting:', isSubmittingRef.current);
            return;
        }

        isSubmittingRef.current = true;
        setHasAnswered(true);
        
        // Set answer result for visual feedback
        setAnswerResult({ word: answer, correct: isCorrect });
        
        // Mark current player as answered
        if (currentUser?.id) {
            setPlayersAnswered(prev => new Set(prev).add(currentUser.id));
        }

        try {
            const maxTime = game?.config.max_time || 30;
            const timeSpent = maxTime - timeLeft;
            
            // Better scoring formula:
            // - Correct answer: base 100 points + time bonus (up to 100 more)
            // - Time bonus calculated as: (timeRemaining / maxTime) * 100
            // - Faster answers get more points
            // - Wrong answer: 0 points
            let points = 0;
            if (isCorrect) {
                const basePoints = 100;
                const timeBonus = Math.floor((timeLeft / maxTime) * 100);
                points = basePoints + timeBonus;
            }

            const payload = {
                answer,
                is_correct: isCorrect,
                points,
                time_spent: timeSpent * 1000,
            };
            console.log('Submitting answer payload:', payload);

            await multiplayerAPI.submitAnswer(gameId, currentRound.id, payload);
            console.log('Answer submitted successfully');
        } catch (err: any) {
            console.error('Error submitting answer:', err);
            console.error('Error response:', err?.response?.data);
            setError(err?.response?.data?.error || t('games.multiplayer.failedToSubmitAnswer'));
            // If this was an auto-submit, keep hasAnswered=true to avoid retry loops
            if (isAutoSubmittingRef.current) {
                setHasAnswered(true);
            } else {
                setHasAnswered(false); // Allow retry if manual submission failed
            }
            isSubmittingRef.current = false; // Reset flag on error
        } finally {
            isAutoSubmittingRef.current = false;
        }
    };

    // Auto-submit when time runs out
    useEffect(() => {
        // Only auto-submit if timer started and we haven't auto-submitted yet
        if (
            timeLeft === 0 &&
            currentRound &&
            !hasAnswered &&
            timerStartedRef.current &&
            !isSubmittingRef.current &&
            !autoSubmittedRef.current
        ) {
            autoSubmittedRef.current = true;
            isAutoSubmittingRef.current = true;
            const answerToSend = selectedWord ?? 'NO_ANSWER';
            console.log('Auto-submit triggered - selectedWord:', selectedWord, 'answerToSend:', answerToSend);
            handleSubmitAnswer(answerToSend, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, currentRound, hasAnswered]);

    // Keep round results visible until the next onRoundStart arrives
    // This avoids returning to the previous round's UI where the answer
    // appears already set and the timer isn't reset yet.

    const handleAnswerSubmit = () => {
        console.log('handleAnswerSubmit called - selectedWord:', selectedWord, 'gameData:', gameData);
        if (!selectedWord || !gameData) return;
        const isCorrect = selectedWord === gameData.correctAnswer;
        handleSubmitAnswer(selectedWord, isCorrect);
    };

    const handleLeaveGame = async () => {
        if (!gameId) return;

        try {
            await multiplayerAPI.leaveGame(gameId);
            navigate('/games/multiplayer');
        } catch (err) {
            console.error('Error leaving game:', err);
            navigate('/games/multiplayer');
        }
    };

    const handlePlayAgain = () => {
        navigate('/games/multiplayer');
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="80vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error || !game) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="80vh"
                gap={2}
            >
                <Alert severity="error">{error || t('games.multiplayer.gameNotFound')}</Alert>
                <Button variant="contained" onClick={() => navigate('/games/multiplayer')}>
                    {t('common.back')}
                </Button>
            </Box>
        );
    }

    // Waiting room phase
    if (game.status === 'waiting') {
        // Safety check for players array
        if (!game.players || !Array.isArray(game.players)) {
            console.error('Game players array is undefined or invalid:', game);
            setError(t('games.multiplayer.gameNotFound'));
            return null;
        }
        const currentPlayer = game.players.find((p) => p.user_id === currentUser?.id);
        const gameFull = game.players.length === game.max_players;
        const allReady = gameFull && game.players.every((p) => p.is_ready);
        const canJoin = !currentPlayer && game.players.length < game.max_players;
        const emptySlots = game.max_players - game.players.length;

        return (
            <Box sx={{ 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 4
            }}>
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Paper sx={{ p: 4, position: 'relative' }}>
                            {/* Countdown Overlay */}
                            {gameStartCountdown !== null && gameStartCountdown > 0 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 1000,
                                        borderRadius: 1,
                                    }}
                                >
                                    <motion.div
                                        key={gameStartCountdown}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 1.5, opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Typography
                                            variant="h1"
                                            sx={{
                                                fontSize: '10rem',
                                                fontWeight: 'bold',
                                                color: 'white',
                                                textShadow: '0 0 30px rgba(102, 126, 234, 0.8)',
                                            }}
                                        >
                                            {gameStartCountdown}
                                        </Typography>
                                    </motion.div>
                                </Box>
                            )}
                            
                            {/* Header with Back Button */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                <Button
                                    startIcon={<ArrowBackIcon />}
                                    onClick={() => navigate('/games/multiplayer')}
                                    variant="outlined"
                                    sx={{ mr: 2 }}
                                >
                                    {t('common.back')}
                                </Button>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                        {game.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('games.multiplayer.hostedBy', { name: game.host.username })}
                                    </Typography>
                                </Box>
                                <Chip 
                                    label={allReady ? t('games.multiplayer.allReady') : t('games.multiplayer.waitingForPlayers')}
                                    color={allReady ? 'success' : 'warning'}
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Box>

                            <Divider sx={{ mb: 4 }} />

                            {/* Game Info */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={3}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {t('games.multiplayer.maxPlayers')}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                            {game.players.length} / {game.max_players}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {t('games.difficulty.label')}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                            {t(`games.difficulty.${game.difficulty.toLowerCase()}`)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {t('gameRoom.numberOfQuestions')}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                            {game.max_steps}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {t('gameRoom.timePerQuestion')}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                            {game.config.max_time}s
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Game Configuration */}
                            {game.config && (game.config.verbs || game.config.tenses) && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        {t('games.multiplayer.gameConfiguration')}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {game.config.verbs && game.config.verbs.length > 0 && (
                                            <Grid item xs={12} md={6}>
                                                <Paper variant="outlined" sx={{ p: 2 }}>
                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                        {t('common.verbs')} ({game.config.verbs.length})
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                                        {game.config.verbs.slice(0, 10).map((verb, idx) => (
                                                            <Chip key={idx} label={verb} size="small" variant="outlined" />
                                                        ))}
                                                        {game.config.verbs.length > 10 && (
                                                            <Chip label={`+${game.config.verbs.length - 10}`} size="small" color="primary" />
                                                        )}
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        )}
                                        {game.config.tenses && game.config.tenses.length > 0 && (
                                            <Grid item xs={12} md={6}>
                                                <Paper variant="outlined" sx={{ p: 2 }}>
                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                        {t('common.tenses')} ({game.config.tenses.length})
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                                        {game.config.tenses.slice(0, 10).map((tense, idx) => (
                                                            <Chip key={idx} label={tense} size="small" variant="outlined" />
                                                        ))}
                                                        {game.config.tenses.length > 10 && (
                                                            <Chip label={`+${game.config.tenses.length - 10}`} size="small" color="secondary" />
                                                        )}
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            )}

                            {/* Players Grid */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                                    {t('games.multiplayer.players')}
                                </Typography>
                                <Grid container spacing={2}>
                                    {/* Actual Players */}
                                    {game.players.map((player, index) => (
                                        <Grid item xs={12} sm={6} md={game.max_players <= 4 ? 6 : 4} key={player.user_id}>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                            >
                                                <Paper 
                                                    elevation={3}
                                                    sx={{ 
                                                        p: 2,
                                                        background: player.is_ready 
                                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                            : 'white',
                                                        color: player.is_ready ? 'white' : 'inherit',
                                                        border: player.user_id === currentUser?.id ? '3px solid #f59e0b' : 'none',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {player.user_id === currentUser?.id && (
                                                        <Chip 
                                                            label={t('games.multiplayer.you')}
                                                            size="small"
                                                            sx={{ 
                                                                position: 'absolute',
                                                                top: 8,
                                                                right: 8,
                                                                backgroundColor: '#f59e0b',
                                                                color: 'white',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    )}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar 
                                                            src={player.user.avatar}
                                                            sx={{ 
                                                                width: 56, 
                                                                height: 56,
                                                                bgcolor: player.is_ready ? 'rgba(255,255,255,0.3)' : '#667eea',
                                                                fontSize: '1.5rem'
                                                            }}
                                                        >
                                                            {player.user.username[0].toUpperCase()}
                                                        </Avatar>
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                                                {player.user.username}
                                                                {player.is_host && (
                                                                    <Chip 
                                                                        label={t('games.multiplayer.host')}
                                                                        size="small"
                                                                        sx={{ 
                                                                            ml: 1,
                                                                            height: 20,
                                                                            backgroundColor: player.is_ready ? 'rgba(255,255,255,0.3)' : '#f59e0b',
                                                                            color: 'white'
                                                                        }}
                                                                    />
                                                                )}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                                {t('games.multiplayer.level', { level: player.user.level })}
                                                            </Typography>
                                                        </Box>
                                                        {player.is_ready ? (
                                                            <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                                                        ) : (
                                                            <RadioButtonUncheckedIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                                                        )}
                                                    </Box>
                                                </Paper>
                                            </motion.div>
                                        </Grid>
                                    ))}
                                    
                                    {/* Empty Slots with Animation */}
                                    {Array.from({ length: emptySlots }).map((_, index) => (
                                        <Grid item xs={12} sm={6} md={game.max_players <= 4 ? 6 : 4} key={`empty-${index}`}>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3, delay: (game.players.length + index) * 0.1 }}
                                            >
                                                <Paper 
                                                    variant="outlined"
                                                    sx={{ 
                                                        p: 2,
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        minHeight: 96,
                                                        border: '2px dashed',
                                                        borderColor: 'divider',
                                                        backgroundColor: 'rgba(0,0,0,0.02)',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    <motion.div
                                                        animate={{
                                                            opacity: [0.3, 0.6, 0.3],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                            delay: index * 0.3
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 16
                                                        }}
                                                    >
                                                        <Avatar 
                                                            sx={{ 
                                                                width: 56, 
                                                                height: 56,
                                                                bgcolor: 'action.disabled',
                                                            }}
                                                        >
                                                            ?
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body1" color="text.secondary">
                                                                {t('games.multiplayer.waitingForPlayer')}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.disabled">
                                                                {t('games.multiplayer.slot', { number: game.players.length + index + 1 })}
                                                            </Typography>
                                                        </Box>
                                                    </motion.div>
                                                    
                                                    {/* Animated gradient overlay */}
                                                    <motion.div
                                                        animate={{
                                                            x: ['-100%', '200%'],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "linear",
                                                            delay: index * 0.5
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
                                                            pointerEvents: 'none'
                                                        }}
                                                    />
                                                </Paper>
                                            </motion.div>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            {!isConnected && (
                                <Alert severity="warning" sx={{ mb: 3 }}>
                                    {t('games.multiplayer.connecting')}
                                </Alert>
                            )}

                            {/* Countdown in waiting room */}
                            {gameStartCountdown !== null && gameStartCountdown > 0 && (
                                <Box sx={{ mb: 3, textAlign: 'center' }}>
                                    <motion.div
                                        key={gameStartCountdown}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {gameStartCountdown}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary">
                                            {t('games.multiplayer.startingIn', 'Starting in...')}
                                        </Typography>
                                    </motion.div>
                                </Box>
                            )}

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                {canJoin && (
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleManualJoin}
                                        disabled={!isConnected}
                                        sx={{ 
                                            minWidth: 200,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                                            }
                                        }}
                                    >
                                        {t('games.multiplayer.joinGame')}
                                    </Button>
                                )}
                                {!canJoin && currentPlayer && !currentPlayer.is_ready && (
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleReady}
                                        disabled={!isConnected}
                                        sx={{ 
                                            minWidth: 200,
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                            }
                                        }}
                                    >
                                        {t('games.multiplayer.ready')}
                                    </Button>
                                )}
                                {/* Show Start Game button for host when at least 2 players ready (but not in 2-player games when full) */}
                                {currentPlayer?.is_host && !allReady && game.players.length >= 2 && !(game.max_players === 2 && game.players.length === 2) && (
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleStartGame}
                                        disabled={!isConnected || game.players.filter(p => p.is_ready).length < 2}
                                        sx={{ 
                                            minWidth: 200,
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                            },
                                            '&:disabled': {
                                                background: 'rgba(0, 0, 0, 0.12)',
                                            }
                                        }}
                                    >
                                        {game.players.filter(p => p.is_ready).length >= 2 
                                            ? t('games.multiplayer.startGame')
                                            : t('games.multiplayer.needMorePlayers')}
                                    </Button>
                                )}
                                {currentPlayer?.is_ready && !allReady && !currentPlayer?.is_host && (
                                    <Typography variant="body1" color="success.main">
                                        {t('games.multiplayer.waitingForOthers')}
                                    </Typography>
                                )}
                                {allReady && (
                                    <Typography variant="body1" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {t('games.multiplayer.allReady')}
                                    </Typography>
                                )}
                                <Button 
                                    variant="outlined" 
                                    size="large"
                                    onClick={handleLeaveGame}
                                    sx={{ minWidth: 150 }}
                                >
                                    {t('common.leave')}
                                </Button>
                            </Box>
                        </Paper>
                    </motion.div>
                </Container>
            </Box>
        );
    }

    // Final results phase
    if (showFinalResults && finalResults) {
        const sortedPlayers = [...(finalResults.players || [])].sort((a, b) => b.score - a.score);
        const topPlayer = sortedPlayers[0];
        
        return (
            <Box sx={{ 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 6,
                px: 2
            }}>
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper sx={{ 
                            p: 4, 
                            textAlign: 'center',
                            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                            borderRadius: 4,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}>
                            {/* Confetti effect */}
                            <Box sx={{ mb: 3 }}>
                                <motion.div
                                    animate={{
                                        rotate: [0, 360],
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 1
                                    }}
                                >
                                    <EmojiEventsIcon sx={{ fontSize: 100, color: '#FFD700', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
                                </motion.div>
                            </Box>
                            
                            <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#764ba2' }}>
                                {t('games.multiplayer.gameFinished')}
                            </Typography>
                            
                            {topPlayer && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Box sx={{ mb: 4, mt: 3 }}>
                                        <Typography variant="h5" color="text.secondary" gutterBottom>
                                            🎊 Winner 🎊
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
                                            <Avatar
                                                src={topPlayer.user?.avatar}
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    border: '4px solid #FFD700',
                                                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)'
                                                }}
                                            >
                                                {(topPlayer.user?.username || topPlayer.username)?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                    {topPlayer.user?.username || topPlayer.username}
                                                </Typography>
                                                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                                                    {topPlayer.score} points
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </motion.div>
                            )}

                            <Divider sx={{ my: 3 }} />
                            
                            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                                Final Standings
                            </Typography>

                            <Box sx={{ my: 3 }}>
                                {sortedPlayers.map((player: any, index: number) => {
                                    const rank = index + 1;
                                    const medals = ['🥇', '🥈', '🥉'];
                                    const medal = medals[index];
                                    
                                    return (
                                        <motion.div
                                            key={player.user_id}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + index * 0.15 }}
                                        >
                                            <Paper
                                                elevation={rank === 1 ? 8 : rank === 2 ? 6 : rank === 3 ? 4 : 2}
                                                sx={{
                                                    p: 3,
                                                    mb: 2,
                                                    background: rank === 1
                                                        ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                                                        : rank === 2
                                                        ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
                                                        : rank === 3
                                                        ? 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)'
                                                        : 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                                                    transform: rank === 1 ? 'scale(1.05)' : 'scale(1)',
                                                    transition: 'transform 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.02)',
                                                    }
                                                }}
                                            >
                                                <Grid container alignItems="center" spacing={2}>
                                                    <Grid item xs={2}>
                                                        <Typography variant="h3" sx={{ 
                                                            fontWeight: 'bold',
                                                            color: rank <= 3 ? 'white' : 'text.primary'
                                                        }}>
                                                            {medal || `#${rank}`}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <Avatar
                                                            src={player.user?.avatar}
                                                            sx={{
                                                                width: 56,
                                                                height: 56,
                                                                border: rank <= 3 ? '3px solid white' : '2px solid #ddd',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                                            }}
                                                        >
                                                            {(player.user?.username || player.username)?.[0]?.toUpperCase()}
                                                        </Avatar>
                                                    </Grid>
                                                    <Grid item xs={5}>
                                                        <Typography 
                                                            variant="h6" 
                                                            sx={{ 
                                                                fontWeight: rank === 1 ? 'bold' : 'normal',
                                                                color: rank <= 3 ? 'white' : 'text.primary'
                                                            }}
                                                        >
                                                            {player.user?.username || player.username}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography 
                                                                variant="h5" 
                                                                sx={{ 
                                                                    fontWeight: 'bold',
                                                                    color: rank <= 3 ? 'white' : 'primary.main'
                                                                }}
                                                            >
                                                                {player.score}
                                                            </Typography>
                                                            <Typography 
                                                                variant="caption" 
                                                                sx={{ 
                                                                    color: rank <= 3 ? 'rgba(255,255,255,0.9)' : 'text.secondary'
                                                                }}
                                                            >
                                                                points
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        </motion.div>
                                    );
                                })}
                            </Box>

                            <Divider sx={{ my: 4 }} />

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    onClick={handlePlayAgain}
                                    sx={{
                                        minWidth: 180,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        fontSize: '1.1rem',
                                        py: 1.5,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                                        }
                                    }}
                                >
                                    🔄 {t('games.multiplayer.playAgain')}
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="large"
                                    onClick={() => navigate('/games/multiplayer')}
                                    sx={{
                                        minWidth: 180,
                                        borderWidth: 2,
                                        fontSize: '1.1rem',
                                        py: 1.5,
                                        '&:hover': {
                                            borderWidth: 2,
                                        }
                                    }}
                                >
                                    🏠 {t('games.multiplayer.backToLobby', 'Back to Lobby')}
                                </Button>
                                <Button 
                                    variant="text"
                                    size="large"
                                    onClick={() => navigate('/games')}
                                    sx={{
                                        minWidth: 180,
                                        fontSize: '1.1rem',
                                        py: 1.5,
                                    }}
                                >
                                    {t('common.backToGames')}
                                </Button>
                            </Box>
                        </Paper>
                    </motion.div>
                </Container>
            </Box>
        );
    }

    // Active game phase
    if (!gameData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            {/* Header with scores */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    {game.players.map((player) => {
                        const noOneWon = roundWinners.includes(-1);
                        const everyoneWon = roundWinners.length > 0 && roundWinners.length === game.players.length && !noOneWon;
                        const isWinner = roundWinners.includes(player.user_id);
                        const hasAnswered = playersAnswered.has(player.user_id);
                        const scoreGain = roundScoreGains[player.user_id] || 0;
                        
                        // Determine animation type
                        let animation = {};
                        let animationRepeat = 0;
                        
                        if (noOneWon) {
                            // Sad shake animation for everyone
                            animation = {
                                x: [-5, 5, -5, 5, 0],
                                rotate: [-2, 2, -2, 2, 0],
                            };
                            animationRepeat = 2;
                        } else if (everyoneWon) {
                            // Happy bounce for everyone
                            animation = {
                                y: [0, -15, 0],
                                scale: [1, 1.1, 1],
                            };
                            animationRepeat = 3;
                        } else if (isWinner) {
                            // Winner celebration
                            animation = {
                                scale: [1, 1.15, 1],
                                rotate: [0, 5, -5, 0],
                            };
                            animationRepeat = 3;
                        }
                        
                        return (
                            <Grid item xs={12 / game.players.length} key={player.user_id}>
                                <motion.div
                                    animate={animation}
                                    transition={{
                                        duration: 0.6,
                                        repeat: animationRepeat,
                                    }}
                                >
                                    <Box textAlign="center">
                                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                            {/* Avatar with animations */}
                                            <motion.div
                                                animate={hasAnswered ? {
                                                    scale: [1, 0.9, 1],
                                                    opacity: [1, 0.7, 1],
                                                } : {}}
                                                transition={{
                                                    duration: 0.8,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <Avatar
                                                    src={player.user.avatar}
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        mx: 'auto',
                                                        mb: 1,
                                                        border: player.user_id === currentUser?.id
                                                            ? '3px solid'
                                                            : hasAnswered
                                                            ? '2px solid'
                                                            : 'none',
                                                        borderColor: player.user_id === currentUser?.id
                                                            ? 'primary.main'
                                                            : 'success.main',
                                                        boxShadow: (isWinner && !noOneWon) 
                                                            ? '0 0 25px rgba(255, 215, 0, 0.9)' 
                                                            : hasAnswered
                                                            ? '0 0 15px rgba(76, 175, 80, 0.6)'
                                                            : 'none',
                                                        opacity: hasAnswered ? 0.8 : 1,
                                                        filter: hasAnswered ? 'grayscale(30%)' : 'none',
                                                    }}
                                                >
                                                    {player.user.username[0].toUpperCase()}
                                                </Avatar>
                                            </motion.div>
                                            
                                            {/* Winner trophy - only show for actual winners, not when no one won */}
                                            {isWinner && !noOneWon && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: "spring", stiffness: 200 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        right: -8,
                                                    }}
                                                >
                                                    <Box sx={{ 
                                                        bgcolor: everyoneWon ? '#4caf50' : '#FFD700',
                                                        borderRadius: '50%',
                                                        width: 32,
                                                        height: 32,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                                    }}>
                                                        <EmojiEventsIcon sx={{ color: 'white', fontSize: 20 }} />
                                                    </Box>
                                                </motion.div>
                                            )}
                                            
                                            {/* Sad indicator when no one won */}
                                            {noOneWon && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 200 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        right: -8,
                                                    }}
                                                >
                                                    <Box sx={{ 
                                                        bgcolor: '#f44336',
                                                        borderRadius: '50%',
                                                        width: 32,
                                                        height: 32,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                                    }}>
                                                        <Typography sx={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                                                            ✗
                                                        </Typography>
                                                    </Box>
                                                </motion.div>
                                            )}
                                            
                                            {/* Waiting indicator */}
                                            {hasAnswered && !allPlayersAnswered && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: -5,
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                    }}
                                                >
                                                    <Chip
                                                        icon={<CheckCircleIcon />}
                                                        label="✓"
                                                        size="small"
                                                        sx={{ 
                                                            height: 20,
                                                            bgcolor: 'success.main',
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.7rem',
                                                            '& .MuiChip-icon': {
                                                                color: 'white',
                                                                fontSize: 14
                                                            }
                                                        }}
                                                    />
                                                </motion.div>
                                            )}
                                        </Box>
                                        
                                        <Typography variant="body2" noWrap sx={{ fontWeight: isWinner ? 'bold' : 'normal' }}>
                                            {player.user.username}
                                        </Typography>
                                        
                                        {/* Score with animation */}
                                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                            <Typography 
                                                variant="h6" 
                                                color="primary" 
                                                sx={{ 
                                                    fontWeight: isWinner ? 'bold' : 'normal',
                                                    fontSize: isWinner ? '1.5rem' : '1.25rem',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                {player.score}
                                            </Typography>
                                            
                                            {/* Score gain animation */}
                                            {scoreGain > 0 && (
                                                <motion.div
                                                    initial={{ y: 0, opacity: 1, scale: 0.5 }}
                                                    animate={{ y: -30, opacity: 0, scale: 1.2 }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    style={{
                                                        position: 'absolute',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        top: 0,
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: '#4caf50',
                                                            fontWeight: 'bold',
                                                            fontSize: '1.1rem',
                                                            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                        }}
                                                    >
                                                        +{scoreGain}
                                                    </Typography>
                                                </motion.div>
                                            )}
                                        </Box>
                                    </Box>
                                </motion.div>
                            </Grid>
                        );
                    })}
                </Grid>
                {allPlayersAnswered && !hasAnswered && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Chip
                            icon={<CheckCircleIcon />}
                            label={t('games.multiplayer.allPlayersAnswered', 'All players have answered!')}
                            color="success"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                )}
            </Paper>

            {/* Game content */}
            <Paper sx={{ p: 4 }}>
                {/* Round and Timer Info */}
                {currentRound && (
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="h5" gutterBottom>
                            {t('games.round')} {currentRound.round_number} / {game.max_steps}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {t('findError.findTheError')} ({gameData.stepTense})
                        </Typography>
                        
                        {/* Timer */}
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">
                                    {t('timeLeft')}: {timeLeft}s
                                </Typography>
                                <Typography variant="body2">
                                    {Math.min(100, ((timeLeft / (game.config.max_time || 30)) * 100)).toFixed(0)}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(100, (timeLeft / (game.config.max_time || 30)) * 100)}
                                color={timeLeft < 10 ? 'error' : 'primary'}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Box>
                    </Box>
                )}

                {/* Sentence Display */}
                {gameData.sentence && (
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ 
                            fontWeight: 'bold',
                            color: 'text.primary',
                            p: 3,
                            background: 'linear-gradient(145deg, #f0f4f8, #d6e4ed)',
                            borderRadius: 3,
                            border: '2px solid',
                            borderColor: 'primary.light'
                        }}>
                            {gameData.sentence}
                        </Typography>
                    </Box>
                )}

                {/* Instruction */}
                <Typography 
                    variant="h5" 
                    textAlign="center" 
                    sx={{ 
                        mb: 4,
                        fontWeight: 'bold',
                        color: 'text.primary'
                    }}
                >
                    {t('games.findError.instruction')}
                </Typography>

                {/* Answer Options */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="center"
                    alignItems="center"
                    sx={{ flexWrap: 'wrap', gap: 2, mb: 4 }}
                >
                    {gameData.visibleWords.map((word, index) => {
                        const isSelected = selectedWord === word;
                        const isAnsweredWord = answerResult?.word === word;
                        const isCorrect = isAnsweredWord && answerResult?.correct;
                        const isIncorrect = isAnsweredWord && !answerResult?.correct;
                        
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                whileHover={{ scale: !hasAnswered ? 1.05 : 1 }}
                                whileTap={{ scale: !hasAnswered ? 0.95 : 1 }}
                            >
                                <Button
                                    onClick={() => handleSelectWord(word)}
                                    color={isCorrect ? 'success' : isIncorrect ? 'error' : isSelected ? 'primary' : 'secondary'}
                                    variant="contained"
                                    disabled={hasAnswered}
                                    sx={{
                                        minWidth: 240,
                                        minHeight: 120,
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        background: isCorrect
                                            ? '#4caf50'
                                            : isIncorrect
                                            ? '#f44336'
                                            : isSelected
                                            ? 'linear-gradient(145deg, #2196f3, #1976d2)'
                                            : 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                                        boxShadow: !hasAnswered 
                                            ? '0 4px 20px rgba(0,0,0,0.1)'
                                            : isCorrect
                                            ? '0 4px 20px rgba(76,175,80,0.5)'
                                            : isIncorrect
                                            ? '0 4px 20px rgba(244,67,54,0.5)'
                                            : undefined,
                                        border: isCorrect
                                            ? '2px solid #4caf50'
                                            : isIncorrect
                                            ? '2px solid #f44336'
                                            : isSelected
                                            ? '2px solid #1976d2'
                                            : '2px solid #e0e0e0',
                                        color: (isCorrect || isIncorrect || isSelected) ? '#ffffff' : 'inherit',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: !hasAnswered ? 'translateY(-2px)' : 'none',
                                            boxShadow: !hasAnswered 
                                                ? '0 6px 25px rgba(0,0,0,0.15)'
                                                : undefined,
                                        },
                                        ...(isSelected && !isAnsweredWord && {
                                            transform: 'scale(0.98)',
                                            boxShadow: '0 0 25px rgba(33,150,243,0.5)'
                                        })
                                    }}
                                >
                                    <span>{word}</span>
                                </Button>
                            </motion.div>
                        );
                    })}
                </Stack>

                {/* Submit Button */}
                {!hasAnswered && selectedWord && (
                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleAnswerSubmit}
                            sx={{ minWidth: 200 }}
                        >
                            {t('common.submit')}
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Toast Notification for Player Left */}
            <Snackbar
                open={showToast}
                autoHideDuration={4000}
                onClose={() => setShowToast(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowToast(false)} severity="info" sx={{ width: '100%' }}>
                    {toastMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FindErrorMultiplayer;