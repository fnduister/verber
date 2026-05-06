import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
    Box, Button, CircularProgress,
    Stack, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import MultiplayerGamePhase from '../../../components/Multiplayer/MultiplayerGamePhase';
import MultiplayerGameScaffold from '../../../components/Multiplayer/MultiplayerGameScaffold';
import { useMultiplayerGameEventHandlers } from '../../../hooks/useMultiplayerGameEventHandlers';
import { useMultiplayerGameSession } from '../../../hooks/useMultiplayerGameSession';
import { useMultiplayerRoundState } from '../../../hooks/useMultiplayerRoundState';
import { useMultiplayerWebSocket } from '../../../hooks/useMultiplayerWebSocket';
import {
    GameRound, multiplayerAPI
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
    correctWords?: string[];
}

const FindErrorMultiplayer: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const { t } = useTranslation();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
    const [gameData, setGameData] = useState<FindErrorGameData | null>(null);
    const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
    const [showFinalResults, setShowFinalResults] = useState(false);
    const [finalResults, setFinalResults] = useState<unknown>(null);
    const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
    const [roundWinners, setRoundWinners] = useState<number[]>([]);
    const [roundScoreGains, setRoundScoreGains] = useState<{[userId: number]: number}>({});

    const formatTenseLabel = (tense: string) => tense.replace(/[_-]+/g, ' ').trim();

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
    
    const submitAnswerRef = useRef<(() => void) | null>(null);

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
        isSubmitting,
    } = useMultiplayerRoundState({
        currentRound,
        maxTime: game?.config.max_time || 30,
        currentUserId: currentUser?.id,
        onAutoSubmit: () => {
            submitAnswerRef.current?.();
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
        buildFallbackFinalResults: (currentGame, leftUserId) => ({
            game_id: currentGame.id,
            players: currentGame.players
                .filter((player) => player.user_id !== leftUserId)
                .sort((a, b) => b.score - a.score),
        }),
        deriveRoundWinners: (scoreGains, payload) => {
            if (payload.round_winners && Array.isArray(payload.round_winners)) {
                return payload.round_winners;
            }

            const gains = Object.values(scoreGains);
            const maxGain = Math.max(...gains);

            if (maxGain > 0) {
                return Object.entries(scoreGains)
                    .filter(([_, gain]) => gain === maxGain)
                    .map(([userId]) => parseInt(userId));
            }

            if (gains.every((gain) => gain === 0)) {
                return [-1];
            }

            return [];
        },
    });

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
                markPlayerAnswered(data.user_id);
            }
        },
        onPlayerJoined,
        onPlayerLeft,
        onPlayerReady,
        onRoundStart: (data) => {
            // Normalize payload: accept {round: {...}} or raw round object
            const round = (data as unknown as { round?: GameRound }).round ?? (data as unknown as GameRound);
            if (!round || !round.round_data) {
                setError(t('games.multiplayer.failedToLoadGame'));
                return;
            }

            if (!game) {
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
            setSelectedWords(new Set()); // Clear selection
            setRoundWinners([]); // Clear round winners
            setRoundScoreGains({}); // Clear score gains
            resetForNewRound(game.players, game?.config.max_time || 30);
            setCurrentRound(round); // Set new round
            
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
        onRoundEnd,
        onGameFinished: (data) => {
            setFinalResults(data);
            setShowFinalResults(true);
            // Stop the timer
            setCurrentRound(null);
        },
        onInviteEvent: handleInviteEvent,
        onError: handleConnectionError,
    });

    const handleSelectWord = (word: string) => {
        if (hasAnswered || isSubmitting()) {
            return;
        }

        setSelectedWords(prev => {
            const updated = new Set<string>();
            if (!prev.has(word)) {
                updated.add(word);
            }
            return updated;
        });
    };

    const handleSubmitSelection = () => {
        if (!gameId || !currentRound || !gameData || hasAnswered || isSubmitting()) {
            return;
        }
        void handleSubmitAnswer(Array.from(selectedWords));
    };

    const handleSubmitAnswer = async (selectedList: string[]) => {
        if (!gameId || !currentRound || !gameData) {
            return;
        }

        if (!beginSubmission()) {
            return;
        }

        try {
            const maxTime = game?.config.max_time || 30;
            const timeSpent = maxTime - timeLeft;

            const selectedWord = selectedList[0] || '';
            const isCorrect = selectedWord === gameData.correctAnswer;

            // Single-answer scoring: correct answer gets base points + time bonus.
            let points = 0;
            if (isCorrect) {
                const basePoints = 100;
                const timeBonus = Math.floor((timeLeft / maxTime) * 100);
                points = basePoints + timeBonus;
            }

            const payload = {
                answer: JSON.stringify(selectedList),
                is_correct: isCorrect,
                points,
                time_spent: Math.max(0, Math.round(timeSpent * 1000)),
            };
            await multiplayerAPI.submitAnswer(gameId, currentRound.id, payload);
        } catch (err: unknown) {
            const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(errMsg || t('games.multiplayer.failedToSubmitAnswer'));
            handleSubmissionError();
        } finally {
            finishSubmission();
        }
    };

    submitAnswerRef.current = () => {
        void handleSubmitAnswer(Array.from(selectedWords));
    };

    // Keep round results visible until the next onRoundStart arrives
    // This avoids returning to the previous round's UI where the answer
    // appears already set and the timer isn't reset yet.

    const activeGame = game!;

    const activeContent = !gameData ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
        </Box>
    ) : (
        <MultiplayerGameScaffold
            gameTitle={t('games.findError.title', 'Find Error')}
            gameTypeIcon={<SearchRoundedIcon fontSize="medium" />}
            gameTypeColor="#2563eb"
            roundNumber={currentRound?.round_number || 1}
            maxSteps={activeGame.max_steps}
            subtitle={t('findError.findTheError')}
            timeLeft={timeLeft}
            maxTime={activeGame.config.max_time || 30}
            players={activeGame.players}
            playersAnswered={playersAnswered}
            roundScoreGains={roundScoreGains}
            roundWinners={roundWinners}
            allPlayersAnswered={allPlayersAnswered}
            contextNode={
                <Box sx={{ textAlign: 'center' }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            mb: 0.25,
                            fontSize: '0.6rem',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            display: 'block',
                        }}
                    >
                        {t('games.common.tense', 'Tense')}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.05, fontSize: { xs: '1.9rem', md: '2.2rem' } }}>
                        {formatTenseLabel(gameData.stepTense)}
                    </Typography>
                </Box>
            }
            actionNode={
                <>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ flexWrap: 'wrap', gap: 1.25, mb: 2 }}
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
                                            minWidth: 190,
                                            minHeight: 88,
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            borderRadius: 2,
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

                    {!hasAnswered && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5, mb: 0.5 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={handleSubmitSelection}
                                disabled={selectedWords.size === 0}
                                sx={{
                                    minWidth: 170,
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    py: 1
                                }}
                            >
                                Submit ({selectedWords.size})
                            </Button>
                        </Box>
                    )}
                </>
            }
            contextMinHeight={80}
            actionMinHeight={0}
        />
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

export default FindErrorMultiplayer;