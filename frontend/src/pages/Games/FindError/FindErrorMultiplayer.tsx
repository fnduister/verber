import {
    Alert, Box, Button, CircularProgress,
    LinearProgress, Paper, Stack, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import InvitePopup from '../../../components/Invites/InvitePopup';
import MultiplayerGameResults from '../../../components/Multiplayer/MultiplayerGameResults';
import MultiplayerScoreBar from '../../../components/Multiplayer/MultiplayerScoreBar';
import WaitingRoom from '../../../components/Multiplayer/WaitingRoom';
import { useMultiplayerWebSocket } from '../../../hooks/useMultiplayerWebSocket';
import { Invite, inviteAPI, userAPI } from '../../../services/api';
import {
    GameRound, multiplayerAPI,
    MultiplayerGame
} from '../../../services/multiplayerApi';
import { toastService } from '../../../services/toastService';
import { RootState } from '../../../store/store';

export interface FindErrorGameData {
    sentence?: string;
    error: string;
    visibleWords: string[];
    stepTense: string;
    correctAnswer: string;
    verb?: string;
    tense?: string;
    correctWords?: string[];
}

type FinalResultsPlayer = {
    user_id: number;
    score: number;
    user: {
        username: string;
        avatar?: string;
        level: number;
    };
};

const FindErrorMultiplayer: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [game, setGame] = useState<MultiplayerGame | null>(null);
    const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
    const [gameData, setGameData] = useState<FindErrorGameData | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFinalResults, setShowFinalResults] = useState(false);
    const [finalResults, setFinalResults] = useState<unknown>(null);
    const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
    const [allPlayersAnswered, setAllPlayersAnswered] = useState(false);
    const [roundWinners, setRoundWinners] = useState<number[]>([]);
    const [roundScoreGains, setRoundScoreGains] = useState<{[userId: number]: number}>({});
    const [playersAnswered, setPlayersAnswered] = useState<Set<number>>(new Set());
    const [previousScores, setPreviousScores] = useState<{[userId: number]: number}>({});
    
    // Invite functionality state
    const [onlinePlayers, setOnlinePlayers] = useState<Array<{ id: number; username: string; avatar: string; level: number; is_online: boolean }>>([]);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [pendingInvites, setPendingInvites] = useState<Array<{ id: number; inviteId?: number; receiver: NonNullable<Invite['receiver']> }>>([]);
    const [currentInvite, setCurrentInvite] = useState<Invite | null>(null);
    const [invitePopupOpen, setInvitePopupOpen] = useState(false);
    
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
            if (data.countdown !== undefined) {
                setGameStartCountdown(data.countdown);
                // Clear countdown when it reaches 0
                if (data.countdown === 0) {
                    setTimeout(() => setGameStartCountdown(null), 1000);
                }
            }
        },
        onTimerSync: (data) => {
            // Optionally update timeLeft from server for synchronization
            if (data.time_left !== undefined) {
                setTimeLeft(data.time_left);
            }
        },
        onAnswerSubmitted: (data) => {
            // Mark this player as answered for all clients
            if (data.user_id) {
                setPlayersAnswered(prev => new Set(prev).add(data.user_id));
            }
        },
        onPlayerJoined: (data) => {
            // Support both payload shapes: {player: {...}} or raw player
            const joinedPlayer = (data as unknown as { player?: MultiplayerGame['players'][number] }).player ?? (data as unknown as MultiplayerGame['players'][number]);
            if (game && joinedPlayer && !game.players.find(p => p.user_id === joinedPlayer.user_id)) {
                setGame({
                    ...game,
                    players: [...game.players, joinedPlayer],
                });
            }
        },
        onPlayerLeft: (data) => {
            // Find player name before removing
            const leftPlayer = game?.players.find(p => p.user_id === data.user_id);
            const playerName = data.username || leftPlayer?.user?.username || 'A player';
            
            // Show toast notification to remaining players
            if (leftPlayer && leftPlayer.user_id !== currentUser?.id) {
                toastService.info(`${playerName} left the game`);
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
            // Normalize payload: accept {round: {...}} or raw round object
            const round = (data as unknown as { round?: GameRound }).round ?? (data as unknown as GameRound);
            if (!round || !round.round_data) {
                setError(t('games.multiplayer.failedToLoadGame'));
                return;
            }

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
            setSelectedWords(new Set()); // Clear selection
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
            // Update player scores if players data is available
            const roundEnd = data as unknown as { players?: Array<{ user_id: number; score: number }>; round_winners?: number[] };
            if (game && roundEnd.players && Array.isArray(roundEnd.players)) {
                // Calculate score gains for this round
                const scoreGains: {[userId: number]: number} = {};
                const updatedPlayers = game.players.map((p) => {
                    const updatedPlayer = roundEnd.players?.find((player) => player.user_id === p.user_id);
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
                if (roundEnd.round_winners && Array.isArray(roundEnd.round_winners)) {
                    setRoundWinners(roundEnd.round_winners);
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
            setFinalResults(data);
            setShowFinalResults(true);
            // Stop the timer
            setCurrentRound(null);
        },
        onInviteEvent: (type, data) => {
            const invite = data as Invite;
            const receiver = invite?.receiver;
            const receiverName = receiver?.username || 'player';

            if (type === 'invite_sent') {
                // Keep everyone’s waiting room in sync
                if (receiver) {
                    setPendingInvites((prev) => {
                        const existingIndex = prev.findIndex(
                            (p) => p?.inviteId === invite.id || p?.receiver?.id === receiver.id
                        );

                        if (existingIndex >= 0) {
                            // Merge websocket invite metadata into existing optimistic entry.
                            const updated = [...prev];
                            updated[existingIndex] = {
                                ...updated[existingIndex],
                                id: invite.id,
                                inviteId: invite.id,
                                receiver,
                            };
                            return updated;
                        }

                        return [
                            ...prev,
                            {
                                id: invite.id,
                                inviteId: invite.id,
                                receiver,
                            },
                        ];
                    });
                }
                const senderName = invite?.sender?.username;
                toastService.info(senderName ? `${senderName} invited ${receiverName}` : `Invite sent to ${receiverName}`);
                return;
            }

            if (type === 'invite_accepted') {
                setPendingInvites((prev) =>
                    prev.filter(
                        (p) =>
                            (p?.inviteId ?? p?.id) !== invite.id &&
                            (!receiver || p?.receiver?.id !== receiver.id)
                    )
                );
                toastService.success(`${receiverName} accepted the invite`);
                return;
            }

            if (type === 'invite_declined') {
                setPendingInvites((prev) =>
                    prev.filter(
                        (p) =>
                            (p?.inviteId ?? p?.id) !== invite.id &&
                            (!receiver || p?.receiver?.id !== receiver.id)
                    )
                );
                toastService.info(`${receiverName} declined the invite`);
                return;
            }

            if (type === 'invite_expired') {
                setPendingInvites((prev) =>
                    prev.filter(
                        (p) =>
                            (p?.inviteId ?? p?.id) !== invite.id &&
                            (!receiver || p?.receiver?.id !== receiver.id)
                    )
                );
                toastService.warning(`Invite to ${receiverName} expired`);
            }
        },
        onError: () => {
            setError(t('games.multiplayer.connectionError'));
        },
    });

    // Track page visibility to detect tab switches
    useEffect(() => {
        const handleVisibilityChange = () => {
            isPageVisible.current = !document.hidden;
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
                const fetched = await multiplayerAPI.getGame(gameId);
                
                // Ensure players array exists
                if (!fetched.players) {
                    fetched.players = [];
                }
                
                // Determine if current user already a player
                const alreadyPlayer = !!fetched.players.find(p => p.user_id === currentUser?.id);
                
                // If game waiting and user not in players and capacity available => auto join
                if (fetched.status === 'waiting' && !alreadyPlayer && fetched.players.length < fetched.max_players) {
                    try {
                        const newPlayer = await multiplayerAPI.joinGame(gameId);
                        fetched.players.push(newPlayer);
                    } catch (joinErr) {
                    }
                }
                setGame(fetched);
            } catch (err) {
                setError(t('games.multiplayer.failedToLoadGame'));
            } finally {
                setLoading(false);
            }
        };
        initLobby();
    }, [gameId, currentUser?.id, t]);

    // Timer countdown - calculate from server time to avoid tab sync issues
    useEffect(() => {
        if (!currentRound) {
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
                return;
            }
        };

        if (!timerStartedRef.current) {
            timerStartedRef.current = true;
        }

        updateTimer(); // Initial update
        const timer = setInterval(updateTimer, 50); // Update every 50ms for smoother animation

        return () => clearInterval(timer);
    }, [currentRound, hasAnswered, game?.config.max_time]);

    const handleSelectWord = (word: string) => {
        if (hasAnswered || isSubmittingRef.current) {
            return;
        }

        setSelectedWords(prev => {
            const updated = new Set(prev);
            if (updated.has(word)) {
                updated.delete(word);
            } else {
                updated.add(word);
            }
            return updated;
        });
    };

    const handleSubmitSelection = () => {
        if (!gameId || !currentRound || hasAnswered || isSubmittingRef.current || !gameData) {
            return;
        }
        void handleSubmitAnswer(Array.from(selectedWords));
    };

    const handleSubmitAnswer = async (selectedList: string[]) => {
        if (!gameId || !currentRound || hasAnswered || isSubmittingRef.current || !gameData) {
            return;
        }

        isSubmittingRef.current = true;
        setHasAnswered(true);

        // Mark current player as answered
        if (currentUser?.id) {
            setPlayersAnswered(prev => new Set(prev).add(currentUser.id));
        }

        try {
            const maxTime = game?.config.max_time || 30;
            const timeSpent = maxTime - timeLeft;

            // Count correct identifications:
            // - 1 point if error word is selected
            // - 1 point for each correct word (non-error) selected
            let correctCount = 0;
            if (selectedList.includes(gameData.correctAnswer)) {
                correctCount++; // Found the error
            }
            // Count correct words (non-error words)
            const correctWords = gameData.visibleWords.filter(w => w !== gameData.correctAnswer);
            correctCount += correctWords.filter(w => selectedList.includes(w)).length;

            // Scoring formula: points = correctCount * basePoints + timeBonus
            let points = 0;
            if (correctCount >= 1) {
                const basePoints = 100;
                const timeBonus = Math.floor((timeLeft / maxTime) * 100);
                points = basePoints * correctCount + timeBonus;
            }

            const payload = {
                answer: JSON.stringify(selectedList),
                is_correct: correctCount === gameData.visibleWords.length,
                points,
                time_spent: timeSpent * 1000,
            };
            await multiplayerAPI.submitAnswer(gameId, currentRound.id, payload);
        } catch (err: unknown) {
            const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(errMsg || t('games.multiplayer.failedToSubmitAnswer'));
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
            handleSubmitAnswer(Array.from(selectedWords));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, currentRound, hasAnswered]);

    // Keep round results visible until the next onRoundStart arrives
    // This avoids returning to the previous round's UI where the answer
    // appears already set and the timer isn't reset yet.

    const handleLeaveGame = async () => {
        if (!gameId) return;

        try {
            await multiplayerAPI.leaveGame(gameId);
            navigate('/games/multiplayer');
        } catch (err) {
            navigate('/games/multiplayer');
        }
    };

    // Fetch online players for invites
    useEffect(() => {
        if (game?.status !== 'waiting') return;

        const fetchOnlinePlayers = async () => {
            try {
                const response = await userAPI.getOnlineUsers();
                const gamePlayerIds = game.players.map((p) => p.user_id);
                const filtered = response.data.online.filter(
                    (p: { id: number }) => !gamePlayerIds.includes(p.id) && p.id !== currentUser?.id
                );
                setOnlinePlayers(
                    filtered.map((p: { id: number; username: string; avatar: string; level: number } & Partial<{ is_online: boolean }>) => ({
                        ...p,
                        is_online: p.is_online ?? true,
                    }))
                );
            } catch (error) {
            }
        };
        
        fetchOnlinePlayers();
        const interval = setInterval(fetchOnlinePlayers, 30000);
        return () => clearInterval(interval);
    }, [game?.status, game?.players, currentUser?.id]);

    // Invite handlers
    const handleSendInvite = async (playerId: number) => {
        if (!gameId) {
            return;
        }
        try {
            await inviteAPI.sendInvite(playerId, gameId);
            const player = onlinePlayers.find((p) => p.id === playerId);
            if (player) {
                setPendingInvites((prev) => {
                    const exists = prev.some((p) => p?.receiver?.id === playerId);
                    if (exists) {
                        return prev;
                    }

                    return [
                        ...prev,
                        {
                            id: Date.now(),
                            receiver: player,
                        },
                    ];
                });
                toastService.success(`Invite sent to ${player.username}!`);
            }
        } catch (error: unknown) {
            const errMsg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
            toastService.error(errMsg || 'Failed to send invite');
        }
    };

    const handleAcceptInvite = async (inviteId: number) => {
        try {
            await inviteAPI.acceptInvite(inviteId);
            setInvitePopupOpen(false);
            setCurrentInvite(null);
            toastService.success('Invite accepted! Joining game...');
        } catch (error: unknown) {
            const errMsg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
            toastService.error(errMsg || 'Failed to accept invite');
        }
    };

    const handleDeclineInvite = async (inviteId: number) => {
        try {
            await inviteAPI.declineInvite(inviteId);
            setInvitePopupOpen(false);
            setCurrentInvite(null);
            toastService.info('Invite declined');
        } catch (error: unknown) {
            toastService.error('Failed to decline invite');
        }
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
            setError(t('games.multiplayer.gameNotFound'));
            return null;
        }

        return (
            <>
                <WaitingRoom
                    game={game}
                    currentUserId={currentUser?.id}
                    gameStartCountdown={gameStartCountdown}
                    isConnected={isConnected}
                    onJoinGame={async () => {
                        if (!gameId) return;
                        try {
                            await multiplayerAPI.joinGame(gameId);
                        } catch (err) {
                        }
                    }}
                    onReady={async () => {
                        if (!gameId) return;
                        try {
                            await multiplayerAPI.setReady(gameId, true);
                        } catch (err) {
                        }
                    }}
                    onStartGame={async () => {
                        if (!gameId) return;
                        try {
                            await multiplayerAPI.startGame(gameId);
                        } catch (err) {
                        }
                    }}
                    onLeaveGame={handleLeaveGame}
                    inviteDialogOpen={inviteDialogOpen}
                    onInviteDialogClose={() => setInviteDialogOpen(false)}
                    onInviteDialogOpen={() => setInviteDialogOpen(true)}
                    onlinePlayers={onlinePlayers}
                    pendingInvites={pendingInvites}
                    onSendInvite={handleSendInvite}
                />
                
                <InvitePopup
                    invite={currentInvite}
                    open={invitePopupOpen}
                    onClose={() => setInvitePopupOpen(false)}
                    onAccept={handleAcceptInvite}
                    onDecline={handleDeclineInvite}
                />
            </>
        );
    }

    // Final results phase
    if (showFinalResults && finalResults) {
        const results = finalResults as { players?: FinalResultsPlayer[] };
        return <MultiplayerGameResults players={results.players || []} />;
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
            <MultiplayerScoreBar
                players={game.players}
                playersAnswered={playersAnswered}
                roundScoreGains={roundScoreGains}
                roundWinners={roundWinners}
                allPlayersAnswered={allPlayersAnswered}
            />

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
                        const isSelected = selectedWords.has(word);
                        
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
                                    color={isSelected ? 'primary' : 'secondary'}
                                    variant="contained"
                                    disabled={hasAnswered}
                                    sx={{
                                        minWidth: 240,
                                        minHeight: 120,
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        background: isSelected
                                            ? 'linear-gradient(145deg, #2196f3, #1976d2)'
                                            : 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                                        boxShadow: isSelected
                                            ? '0 0 25px rgba(33,150,243,0.5)'
                                            : '0 4px 20px rgba(0,0,0,0.1)',
                                        border: isSelected
                                            ? '2px solid #1976d2'
                                            : '2px solid #e0e0e0',
                                        color: isSelected ? '#ffffff' : 'inherit',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: !hasAnswered ? 'translateY(-2px)' : 'none',
                                            boxShadow: !hasAnswered 
                                                ? '0 6px 25px rgba(0,0,0,0.15)'
                                                : undefined,
                                        },
                                        ...(isSelected && {
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
                {!hasAnswered && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleSubmitSelection}
                            disabled={selectedWords.size === 0}
                            sx={{
                                minWidth: 200,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                py: 1.5
                            }}
                        >
                            Submit ({selectedWords.size})
                        </Button>
                    </Box>
                )}

            </Paper>

        </Box>
    );
};

export default FindErrorMultiplayer;