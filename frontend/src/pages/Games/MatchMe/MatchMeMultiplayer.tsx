import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import MultiplayerGamePhase from '../../../components/Multiplayer/MultiplayerGamePhase';
import MultiplayerGameScaffold from '../../../components/Multiplayer/MultiplayerGameScaffold';
import { TENSE_KEY_TO_DISPLAY_NAMES } from '../../../constants';
import { useMultiplayerGameEventHandlers } from '../../../hooks/useMultiplayerGameEventHandlers';
import { useMultiplayerGameSession } from '../../../hooks/useMultiplayerGameSession';
import { useMultiplayerRoundState } from '../../../hooks/useMultiplayerRoundState';
import { useMultiplayerWebSocket } from '../../../hooks/useMultiplayerWebSocket';
import { GameRound, multiplayerAPI } from '../../../services/multiplayerApi';
import { RootState } from '../../../store/store';

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
    const { t } = useTranslation();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
    const [roundItems, setRoundItems] = useState<MatchRoundItem[]>([]);
    const [correctMatches, setCorrectMatches] = useState<Record<string, string>>({});
    const [userMatches, setUserMatches] = useState<Record<string, string>>({});
    const [showFinalResults, setShowFinalResults] = useState(false);
    const [finalResults, setFinalResults] = useState<unknown>(null);
    const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
    const [roundWinners, setRoundWinners] = useState<number[]>([]);
    const [roundScoreGains, setRoundScoreGains] = useState<{ [userId: number]: number }>({});

    const {
        game,
        setGame,
        loading,
        error,
        setError,
        onlinePlayers,
        inviteDialogOpen,
        openInviteDialog,
        closeInviteDialog,
        pendingInvites,
        currentInvite,
        invitePopupOpen,
        closeInvitePopup,
        handleInviteEvent,
        handleConnectionError,
        joinGame,
        setReady,
        startGame,
        leaveGame,
        sendInvite,
        acceptInvite,
        declineInvite,
    } = useMultiplayerGameSession({
        gameId,
        currentUserId: currentUser?.id,
    });

    const submitMatchesRef = useRef<(() => void) | null>(null);

    const {
        hasAnswered,
        timeLeft,
        setTimeLeft,
        allPlayersAnswered,
        setAllPlayersAnswered,
        playersAnswered,
        previousScores,
        markPlayerAnswered,
        beginSubmission,
        handleSubmissionError,
        finishSubmission,
        resetForNewRound,
    } = useMultiplayerRoundState({
        currentRound,
        maxTime: game?.config.max_time || 30,
        currentUserId: currentUser?.id,
        onAutoSubmit: () => {
            submitMatchesRef.current?.();
        },
    });

    const { onPlayerJoined, onPlayerLeft, onPlayerReady, onRoundEnd } = useMultiplayerGameEventHandlers({
        game,
        setGame,
        currentUserId: currentUser?.id,
        previousScores,
        setRoundScoreGains,
        setRoundWinners,
        setAllPlayersAnswered,
        setFinalResults,
        setShowFinalResults,
        deriveRoundWinners: (_scoreGains, payload) => payload.round_winners || [],
    });

    const handleRoundEnd = useCallback((data: Parameters<typeof onRoundEnd>[0]) => {
        onRoundEnd(data);
    }, [onRoundEnd]);

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

    const handleSubmitMatches = async (matchesToSubmit?: Record<string, string>, _forcedTimeout?: boolean) => {
        if (!gameId || !currentRound) {
            return;
        }

        if (!beginSubmission()) {
            return;
        }

        const activeMatches = matchesToSubmit || userMatches;

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
                time_spent: Math.max(0, Math.round(timeSpent * 1000)),
            });
        } catch (err: unknown) {
            const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(errMsg || t('games.multiplayer.failedToSubmitAnswer'));
            handleSubmissionError();
        } finally {
            finishSubmission();
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
                markPlayerAnswered(data.user_id);
            }
        },
        onPlayerJoined,
        onPlayerLeft,
        onPlayerReady,
        onRoundStart: (data) => {
            const round = (data as unknown as { round?: GameRound }).round ?? (data as unknown as GameRound);
            if (!round || !round.round_data) {
                setError(t('games.multiplayer.failedToLoadGame'));
                return;
            }

            if (!game) {
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

            setUserMatches({});
            setRoundWinners([]);
            setRoundScoreGains({});
            resetForNewRound(game.players, game?.config.max_time || 30);

            setCurrentRound(round);
            setRoundItems(roundData.match_items);
            setCorrectMatches(roundData.matches);
        },
        onRoundEnd: handleRoundEnd,
        onGameFinished: (data) => {
            setFinalResults(data);
            setShowFinalResults(true);
            setCurrentRound(null);
        },
        onInviteEvent: handleInviteEvent,
        onError: handleConnectionError,
    });

    submitMatchesRef.current = () => {
        void handleSubmitMatches(userMatches, true);
    };

    const activeGame = game!;

    const activeContent = !currentRound || roundItems.length === 0 || tenseEntries.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
        </Box>
    ) : (
        <DndProvider backend={HTML5Backend}>
        <MultiplayerGameScaffold
            gameTitle={t('games.matching.title', 'Match Me')}
            gameTypeColor="#0f766e"
            roundNumber={currentRound.round_number}
            maxSteps={activeGame.max_steps}
            subtitle="Match the conjugations to the correct tense"
            timeLeft={timeLeft}
            maxTime={activeGame.config.max_time || 30}
            players={activeGame.players}
            playersAnswered={playersAnswered}
            roundScoreGains={roundScoreGains}
            roundWinners={roundWinners}
            allPlayersAnswered={allPlayersAnswered}
            contextNode={
                <Card sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    minHeight: 180,
                }}>
                    <CardContent>
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
            }
            actionNode={
                <>
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
                </>
            }
        />
        </DndProvider>
    );

    return (
        <MultiplayerGamePhase
            loading={loading}
            error={error}
            game={game}
            gameStartCountdown={gameStartCountdown}
            isConnected={isConnected}
            currentUserId={currentUser?.id}
            showFinalResults={showFinalResults}
            finalResults={finalResults}
            inviteDialogOpen={inviteDialogOpen}
            onlinePlayers={onlinePlayers}
            pendingInvites={pendingInvites}
            currentInvite={currentInvite}
            invitePopupOpen={invitePopupOpen}
            onJoinGame={joinGame}
            onReady={setReady}
            onStartGame={startGame}
            onLeaveGame={leaveGame}
            onInviteDialogClose={closeInviteDialog}
            onInviteDialogOpen={openInviteDialog}
            onSendInvite={sendInvite}
            onInvitePopupClose={closeInvitePopup}
            onAcceptInvite={acceptInvite}
            onDeclineInvite={declineInvite}
        >
            {activeContent}
        </MultiplayerGamePhase>
    );
};

export default MatchMeMultiplayer;
