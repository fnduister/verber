import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    LinearProgress,
    Paper,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import InvitePopup from '../../../components/Invites/InvitePopup';
import MultiplayerGameResults from '../../../components/Multiplayer/MultiplayerGameResults';
import MultiplayerScoreBar from '../../../components/Multiplayer/MultiplayerScoreBar';
import WaitingRoom from '../../../components/Multiplayer/WaitingRoom';
import { TENSE_KEY_TO_DISPLAY_NAMES } from '../../../constants';
import { useMultiplayerWebSocket } from '../../../hooks/useMultiplayerWebSocket';
import { Invite, inviteAPI, userAPI } from '../../../services/api';
import { GameRound, multiplayerAPI, MultiplayerGame } from '../../../services/multiplayerApi';
import { toastService } from '../../../services/toastService';
import { RootState } from '../../../store/store';

type FinalResultsPlayer = {
    user_id: number;
    score: number;
    user: {
        username: string;
        avatar?: string;
        level: number;
    };
};

type MatchRoundItem = {
    id: string;
    tense: string;
    verb: string;
    conjugation: string;
    pronoun: string;
    pronoun_index: number;
};

const ItemTypes = {
    CONJUGATION: 'conjugation',
};

type DraggedConjugation = {
    id: string;
};

const DraggableConjugation: React.FC<{
    item: MatchRoundItem;
    isDisabled: boolean;
    isUsed: boolean;
    isMatched?: boolean;
    isCorrect?: boolean;
    index?: number;
}> = ({ item, isDisabled, isUsed, isMatched = false, isCorrect = false, index = 0 }) => {
    const previousUsedRef = useRef(isUsed);
    const [settleScale, setSettleScale] = useState(1);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.CONJUGATION,
        item: { id: item.id } as DraggedConjugation,
        canDrag: !isDisabled,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [isDisabled, item.id]);

    useEffect(() => {
        if (previousUsedRef.current === isUsed) {
            return;
        }

        // Snap in slightly when dropped/assigned, and subtle pop when returned to pool.
        setSettleScale(isUsed ? 1.06 : 0.97);
        const timeout = setTimeout(() => setSettleScale(1), 140);
        previousUsedRef.current = isUsed;

        return () => clearTimeout(timeout);
    }, [isUsed]);

    return (
        <Box ref={drag} sx={{ display: 'inline-block', touchAction: 'none' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={!isDisabled ? { y: -2, scale: 1.01 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                animate={{
                    opacity: isDragging ? 0.35 : (isUsed ? 0.75 : 1),
                    scale: isDragging ? 1.03 : settleScale,
                    y: isDragging ? -5 : 0,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 30,
                    mass: 0.6,
                    delay: 0.7 + (index * 0.08),
                }}
            >
                <Chip
                    label={`${item.pronoun} ${item.conjugation}`}
                    color={isMatched ? (isCorrect ? 'success' : 'error') : 'default'}
                    sx={{
                        p: 2,
                        height: 'auto',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: !isDisabled ? 'grab' : 'default',
                        opacity: isDragging ? 0.3 : (isUsed ? 0.4 : 1),
                        backgroundColor: isDragging
                            ? '#ff9800'
                            : isUsed
                            ? '#f5f5f5'
                            : isMatched
                            ? undefined
                            : '#667eea',
                        color: isDragging ? 'white' : (isUsed ? '#888' : (isMatched ? undefined : 'white')),
                        border: '2px solid',
                        borderColor: isDragging ? '#ff9800' : (isUsed ? '#e0e0e0' : (isMatched ? undefined : '#667eea')),
                        transition: 'all 0.18s ease',
                        transform: isDragging ? 'rotate(-5deg) scale(1.05)' : 'none',
                        boxShadow: isDragging ? '0 8px 24px rgba(255,152,0,0.4)' : undefined,
                        '& .MuiChip-label': {
                            padding: '8px 16px',
                        },
                        '&:hover': {
                            backgroundColor: (!isUsed && !isDisabled && !isDragging && !isMatched) ? '#5a67d8' : undefined,
                            transform: (!isDisabled && !isDragging) ? 'translateY(-2px)' : (isDragging ? 'rotate(-5deg) scale(1.05)' : 'none'),
                            boxShadow: (!isDisabled && !isDragging) ? '0 4px 20px rgba(0,0,0,0.15)' : (isDragging ? '0 8px 24px rgba(255,152,0,0.4)' : undefined),
                        },
                        '&:active': {
                            cursor: !isDisabled ? 'grabbing' : 'default',
                        }
                    }}
                />
            </motion.div>
        </Box>
    );
};

const TenseDropZone: React.FC<{
    tenseId: string;
    disabled: boolean;
    onDrop: (tenseId: string, itemId: string) => void;
    children: React.ReactNode;
}> = ({ tenseId, disabled, onDrop, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.CONJUGATION,
        canDrop: () => !disabled,
        drop: (item: DraggedConjugation) => {
            if (!disabled) {
                onDrop(tenseId, item.id);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [disabled, onDrop, tenseId]);

    const isActive = isOver && canDrop;

    return (
        <Paper
            ref={drop}
            sx={{
                p: 2,
                minHeight: 180,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: isActive ? '#667eea' : '#e2e8f0',
                backgroundColor: isActive ? 'rgba(102, 126, 234, 0.1)' : 'white',
                boxShadow: isActive ? '0 8px 24px rgba(102, 126, 234, 0.3)' : undefined,
                transition: 'all 0.3s ease',
                transform: isActive ? 'scale(1.02)' : 'none',
            }}
        >
            {children}
        </Paper>
    );
};

const PoolDropZone: React.FC<{
    disabled: boolean;
    onDropToPool: (itemId: string) => void;
    children: React.ReactNode;
}> = ({ disabled, onDropToPool, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.CONJUGATION,
        canDrop: () => !disabled,
        drop: (item: DraggedConjugation) => {
            if (!disabled) {
                onDropToPool(item.id);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [disabled, onDropToPool]);

    const isActive = isOver && canDrop;

    return (
        <Box
            ref={drop}
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                padding: 2,
                border: '2px dashed #e2e8f0',
                borderRadius: 2,
                backgroundColor: isActive ? 'rgba(102, 126, 234, 0.1)' : '#fafafa',
                borderColor: isActive ? '#667eea' : '#e2e8f0',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: '#667eea',
                    backgroundColor: '#f8faff',
                },
            }}
        >
            {children}
        </Box>
    );
};

const MatchMeMultiplayer: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [game, setGame] = useState<MultiplayerGame | null>(null);
    const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
    const [roundItems, setRoundItems] = useState<MatchRoundItem[]>([]);
    const [correctMatches, setCorrectMatches] = useState<Record<string, string>>({});
    const [userMatches, setUserMatches] = useState<Record<string, string>>({});
    const [hasAnswered, setHasAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFinalResults, setShowFinalResults] = useState(false);
    const [finalResults, setFinalResults] = useState<unknown>(null);
    const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
    const [allPlayersAnswered, setAllPlayersAnswered] = useState(false);
    const [roundWinners, setRoundWinners] = useState<number[]>([]);
    const [roundScoreGains, setRoundScoreGains] = useState<{ [userId: number]: number }>({});
    const [playersAnswered, setPlayersAnswered] = useState<Set<number>>(new Set());
    const [previousScores, setPreviousScores] = useState<{ [userId: number]: number }>({});

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

    const tenseEntries = useMemo(() => Object.keys(correctMatches).sort(), [correctMatches]);

    const getMatchItem = (id: string | undefined) => roundItems.find((item) => item.id === id);

    const handleAssignToTense = (tenseId: string, conjugationId: string) => {
        if (hasAnswered) {
            return;
        }

        setUserMatches((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((key) => {
                if (next[key] === conjugationId) {
                    delete next[key];
                }
            });
            next[tenseId] = conjugationId;
            return next;
        });
    };

    const handleUnassignTense = (tenseId: string) => {
        if (hasAnswered) {
            return;
        }
        setUserMatches((prev) => {
            const next = { ...prev };
            delete next[tenseId];
            return next;
        });
    };

    const handleDropToPool = (conjugationId: string) => {
        if (hasAnswered) {
            return;
        }
        setUserMatches((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((key) => {
                if (next[key] === conjugationId) {
                    delete next[key];
                }
            });
            return next;
        });
    };

    const handleSubmitMatches = async (matchesToSubmit?: Record<string, string>, forcedTimeout?: boolean) => {
        if (!gameId || !currentRound || hasAnswered || isSubmittingRef.current) {
            return;
        }

        const activeMatches = matchesToSubmit || userMatches;
        isSubmittingRef.current = true;
        setHasAnswered(true);

        if (currentUser?.id) {
            setPlayersAnswered((prev) => new Set(prev).add(currentUser.id));
        }

        try {
            const total = tenseEntries.length;
            const correctCount = tenseEntries.reduce((count, tenseId) => {
                return count + (activeMatches[tenseId] === correctMatches[tenseId] ? 1 : 0);
            }, 0);

            const maxTime = game?.config.max_time || 30;
            const timeSpent = maxTime - timeLeft;
            // Score only if at least one match is correct, multiplied by count of correct matches
            let points = 0;
            if (correctCount >= 1) {
                const basePoints = 100;
                const timeBonus = Math.floor((timeLeft / maxTime) * 100);
                points = basePoints * correctCount + timeBonus;
            }

            await multiplayerAPI.submitAnswer(gameId, currentRound.id, {
                answer: JSON.stringify(activeMatches),
                is_correct: total > 0 && correctCount === total,
                points,
                time_spent: Math.max(0, timeSpent) * 1000,
            });
        } catch (err: unknown) {
            const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(errMsg || t('games.multiplayer.failedToSubmitAnswer'));
            if (isAutoSubmittingRef.current) {
                setHasAnswered(true);
            } else {
                setHasAnswered(false);
            }
            isSubmittingRef.current = false;
        } finally {
            isAutoSubmittingRef.current = false;
        }
    };

    // WebSocket connection - only connect after game is loaded
    const { isConnected } = useMultiplayerWebSocket({
        gameId: gameId!,
        enabled: !loading && !!game,
        onGameStarting: (data) => {
            if (data.countdown !== undefined) {
                setGameStartCountdown(data.countdown);
                if (data.countdown === 0) {
                    setTimeout(() => setGameStartCountdown(null), 1000);
                }
            }
        },
        onTimerSync: (data) => {
            if (data.time_left !== undefined) {
                setTimeLeft(data.time_left);
            }
        },
        onAnswerSubmitted: (data) => {
            if (data.user_id) {
                setPlayersAnswered((prev) => new Set(prev).add(data.user_id));
            }
        },
        onPlayerJoined: (data) => {
            const joinedPlayer = (data as unknown as { player?: MultiplayerGame['players'][number] }).player ?? (data as unknown as MultiplayerGame['players'][number]);
            if (game && joinedPlayer && !game.players.find((p) => p.user_id === joinedPlayer.user_id)) {
                setGame({
                    ...game,
                    players: [...game.players, joinedPlayer],
                });
            }
        },
        onPlayerLeft: (data) => {
            const leftPlayer = game?.players.find((p) => p.user_id === data.user_id);
            const playerName = data.username || leftPlayer?.user?.username || 'A player';

            if (leftPlayer && leftPlayer.user_id !== currentUser?.id) {
                toastService.info(`${playerName} left the game`);
            }

            setGame((prevGame) => {
                if (!prevGame) return null;
                return {
                    ...prevGame,
                    players: prevGame.players.filter((p) => p.user_id !== data.user_id),
                };
            });

            if (data.game_ended) {
                if (data.final_results) {
                    setFinalResults(data.final_results);
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
            const round = (data as unknown as { round?: GameRound }).round ?? (data as unknown as GameRound);
            if (!round || !round.round_data) {
                setError(t('games.multiplayer.failedToLoadGame'));
                return;
            }

            if (game && game.status === 'waiting') {
                setGame({
                    ...game,
                    status: 'in_progress',
                });
            }

            const roundData = round.round_data;
            if (!roundData.match_items || !roundData.matches) {
                setError('Invalid matching round data');
                return;
            }

            setHasAnswered(false);
            setUserMatches({});
            setAllPlayersAnswered(false);
            setRoundWinners([]);
            setRoundScoreGains({});
            setPlayersAnswered(new Set());

            if (game) {
                const scores: { [userId: number]: number } = {};
                game.players.forEach((p) => {
                    scores[p.user_id] = p.score;
                });
                setPreviousScores(scores);
            }

            setCurrentRound(round);
            setRoundItems(roundData.match_items);
            setCorrectMatches(roundData.matches);
            setTimeLeft(game?.config.max_time || 30);

            isSubmittingRef.current = false;
            timerStartedRef.current = false;
            autoSubmittedRef.current = false;
            isAutoSubmittingRef.current = false;
        },
        onRoundEnd: (data) => {
            const roundEnd = data as unknown as { players?: Array<{ user_id: number; score: number }>; round_winners?: number[] };
            if (game && roundEnd.players && Array.isArray(roundEnd.players)) {
                const scoreGains: { [userId: number]: number } = {};
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
                if (roundEnd.round_winners && Array.isArray(roundEnd.round_winners)) {
                    setRoundWinners(roundEnd.round_winners);
                }
            }
            setAllPlayersAnswered(true);
        },
        onGameFinished: (data) => {
            setFinalResults(data);
            setShowFinalResults(true);
            setCurrentRound(null);
        },
        onInviteEvent: (type, data) => {
            const invite = data as Invite;
            const receiver = invite?.receiver;
            const receiverName = receiver?.username || 'player';

            if (type === 'invite_sent') {
                if (receiver) {
                    setPendingInvites((prev) => {
                        const existingIndex = prev.findIndex((p) => p?.inviteId === invite.id || p?.receiver?.id === receiver.id);
                        if (existingIndex >= 0) {
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
                setPendingInvites((prev) => prev.filter((p) => (p?.inviteId ?? p?.id) !== invite.id && (!receiver || p?.receiver?.id !== receiver.id)));
                toastService.success(`${receiverName} accepted the invite`);
                return;
            }

            if (type === 'invite_declined') {
                setPendingInvites((prev) => prev.filter((p) => (p?.inviteId ?? p?.id) !== invite.id && (!receiver || p?.receiver?.id !== receiver.id)));
                toastService.info(`${receiverName} declined the invite`);
                return;
            }

            if (type === 'invite_expired') {
                setPendingInvites((prev) => prev.filter((p) => (p?.inviteId ?? p?.id) !== invite.id && (!receiver || p?.receiver?.id !== receiver.id)));
                toastService.warning(`Invite to ${receiverName} expired`);
            }
        },
        onError: () => {
            setError(t('games.multiplayer.connectionError'));
        },
    });

    useEffect(() => {
        const handleVisibilityChange = () => {
            isPageVisible.current = !document.hidden;
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        if (!gameId || !game || game.status !== 'in_progress') {
            return;
        }

        const sendHeartbeat = async () => {
            if (isPageVisible.current) {
                try {
                    await multiplayerAPI.sendHeartbeat(gameId);
                } catch {
                    // silent
                }
            }
        };

        sendHeartbeat();
        heartbeatInterval.current = setInterval(sendHeartbeat, 5000);

        return () => {
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
                heartbeatInterval.current = null;
            }
        };
    }, [gameId, game?.status]);

    useEffect(() => {
        const initLobby = async () => {
            if (!gameId) {
                setError(t('games.multiplayer.gameNotFound'));
                setLoading(false);
                return;
            }
            try {
                const fetched = await multiplayerAPI.getGame(gameId);
                if (!fetched.players) {
                    fetched.players = [];
                }
                const alreadyPlayer = !!fetched.players.find((p) => p.user_id === currentUser?.id);
                if (fetched.status === 'waiting' && !alreadyPlayer && fetched.players.length < fetched.max_players) {
                    try {
                        const newPlayer = await multiplayerAPI.joinGame(gameId);
                        fetched.players.push(newPlayer);
                    } catch {
                        // silent
                    }
                }
                setGame(fetched);
            } catch {
                setError(t('games.multiplayer.failedToLoadGame'));
            } finally {
                setLoading(false);
            }
        };
        initLobby();
    }, [gameId, currentUser?.id, t]);

    useEffect(() => {
        if (!currentRound) {
            return;
        }

        const calculateTimeLeft = () => {
            const roundStartTime = new Date(currentRound.started_at).getTime();
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - roundStartTime) / 1000);
            const maxTime = game?.config.max_time || 30;
            return Math.max(0, maxTime - elapsedSeconds);
        };

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

        updateTimer();
        const timer = setInterval(updateTimer, 50);
        return () => clearInterval(timer);
    }, [currentRound, hasAnswered, game?.config.max_time]);

    useEffect(() => {
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
            void handleSubmitMatches(userMatches, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, currentRound, hasAnswered]);

    useEffect(() => {
        if (game?.status !== 'waiting') return;

        const fetchOnlinePlayers = async () => {
            try {
                const response = await userAPI.getOnlineUsers();
                const gamePlayerIds = game.players.map((p) => p.user_id);
                const filtered = response.data.online.filter((p: { id: number }) => !gamePlayerIds.includes(p.id) && p.id !== currentUser?.id);
                setOnlinePlayers(
                    filtered.map((p: { id: number; username: string; avatar: string; level: number } & Partial<{ is_online: boolean }>) => ({
                        ...p,
                        is_online: p.is_online ?? true,
                    }))
                );
            } catch {
                // silent
            }
        };

        fetchOnlinePlayers();
        const interval = setInterval(fetchOnlinePlayers, 30000);
        return () => clearInterval(interval);
    }, [game?.status, game?.players, currentUser?.id]);

    const handleLeaveGame = async () => {
        if (!gameId) return;
        try {
            await multiplayerAPI.leaveGame(gameId);
            navigate('/games/multiplayer');
        } catch {
            navigate('/games/multiplayer');
        }
    };

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
        } catch {
            toastService.error('Failed to decline invite');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !game) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" gap={2}>
                <Alert severity="error">{error || t('games.multiplayer.gameNotFound')}</Alert>
                <Button variant="contained" onClick={() => navigate('/games/multiplayer')}>
                    {t('common.back')}
                </Button>
            </Box>
        );
    }

    if (game.status === 'waiting') {
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
                        } catch {
                            // silent
                        }
                    }}
                    onReady={async () => {
                        if (!gameId) return;
                        try {
                            await multiplayerAPI.setReady(gameId, true);
                        } catch {
                            // silent
                        }
                    }}
                    onStartGame={async () => {
                        if (!gameId) return;
                        try {
                            await multiplayerAPI.startGame(gameId);
                        } catch {
                            // silent
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

    if (showFinalResults && finalResults) {
        const results = finalResults as { players?: Array<{ user_id: number; score: number; user: { username: string; avatar?: string; level: number } }> };
        return <MultiplayerGameResults players={results.players || []} />;
    }

    if (!currentRound || roundItems.length === 0 || tenseEntries.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <MultiplayerScoreBar
                players={game.players}
                playersAnswered={playersAnswered}
                roundScoreGains={roundScoreGains}
                roundWinners={roundWinners}
                allPlayersAnswered={allPlayersAnswered}
            />

            <Paper sx={{ p: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        {t('games.round')} {currentRound.round_number} / {game.max_steps}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Match the conjugations to the correct tense
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{t('timeLeft')}: {timeLeft}s</Typography>
                            <Typography variant="body2">{Math.min(100, ((timeLeft / (game.config.max_time || 30)) * 100)).toFixed(0)}%</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(100, (timeLeft / (game.config.max_time || 30)) * 100)}
                            color={timeLeft < 10 ? 'error' : 'primary'}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </Box>
                </Box>

                <Card sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    mb: 4,
                    minHeight: 180,
                }}>
                    <CardContent>
                        <Typography
                            variant="h5"
                            sx={{
                                mb: 3,
                                fontWeight: 'bold',
                                textAlign: 'center',
                                color: '#4f46e5',
                            }}
                        >
                            Conjugations
                        </Typography>
                        <PoolDropZone disabled={hasAnswered} onDropToPool={handleDropToPool}>
                            {roundItems.map((item, index) => {
                                const isUsed = Object.values(userMatches).includes(item.id);
                                return (
                                    <DraggableConjugation
                                        key={item.id}
                                        item={item}
                                        isDisabled={hasAnswered}
                                        isUsed={isUsed}
                                        index={index}
                                    />
                                );
                            })}
                        </PoolDropZone>
                    </CardContent>
                </Card>

                <Grid container spacing={3}>
                    {tenseEntries.map((tenseId) => {
                        const assignedConjugationId = userMatches[tenseId];
                        const assignedItem = getMatchItem(assignedConjugationId);
                        const tenseValue = roundItems.find((item) => correctMatches[tenseId] === item.id)?.tense || 'Unknown tense';
                        return (
                            <Grid item xs={12} md={4} key={tenseId}>
                                <TenseDropZone tenseId={tenseId} disabled={hasAnswered} onDrop={handleAssignToTense}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 2, textAlign: 'center' }}>
                                        {TENSE_KEY_TO_DISPLAY_NAMES[tenseValue] || tenseValue}
                                    </Typography>
                                    <Box sx={{ minHeight: 60, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        {assignedItem ? (
                                            <DraggableConjugation
                                                item={assignedItem}
                                                isDisabled={hasAnswered}
                                                isUsed={false}
                                                isMatched={hasAnswered}
                                                isCorrect={hasAnswered ? (correctMatches[tenseId] === assignedConjugationId) : false}
                                            />
                                        ) : (
                                            <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>
                                                Drag a conjugation here
                                            </Typography>
                                        )}
                                    </Box>

                                    {!hasAnswered && assignedItem && (
                                        <Button size="small" sx={{ mt: 1 }} onClick={() => handleUnassignTense(tenseId)}>
                                            Clear
                                        </Button>
                                    )}
                                </TenseDropZone>
                            </Grid>
                        );
                    })}
                </Grid>

                {!hasAnswered && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => void handleSubmitMatches()}
                            disabled={Object.keys(userMatches).length !== tenseEntries.length}
                        >
                            {t('common.submit')}
                        </Button>
                    </Box>
                )}

                {allPlayersAnswered && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Chip icon={<CheckCircleIcon />} label={t('games.multiplayer.allPlayersAnswered', 'All players have answered!')} color="success" sx={{ fontWeight: 'bold' }} />
                    </Box>
                )}
            </Paper>
        </Box>
        </DndProvider>
    );
};

export default MatchMeMultiplayer;
