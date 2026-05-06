import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
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

type RaceRoundData = {
    verb: string;
    pronoun: string;
    displayedWord: string;
    visibleTenses: string[];
    correctTense: string;
};

const RaceMultiplayer: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const { t } = useTranslation();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
    const [roundData, setRoundData] = useState<RaceRoundData | null>(null);
    const [selectedTense, setSelectedTense] = useState<string | null>(null);
    const [showFinalResults, setShowFinalResults] = useState(false);
    const [finalResults, setFinalResults] = useState<unknown>(null);
    const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
    const [roundWinners, setRoundWinners] = useState<number[]>([]);
    const [roundScoreGains, setRoundScoreGains] = useState<{ [userId: number]: number }>({});

    const submitAnswerRef = useRef<(() => void) | null>(null);

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
        deriveRoundWinners: (scoreGains, payload) => {
            if (payload.round_winners && Array.isArray(payload.round_winners)) {
                return payload.round_winners;
            }

            const maxGain = Math.max(0, ...Object.values(scoreGains));
            if (maxGain === 0) {
                return [-1];
            }

            return Object.entries(scoreGains)
                .filter(([, gain]) => gain === maxGain)
                .map(([userId]) => parseInt(userId, 10));
        },
    });

    const submitAnswer = async (answer: string) => {
        if (!gameId || !currentRound || !roundData) {
            return;
        }

        if (!beginSubmission()) {
            return;
        }

        try {
            const maxTime = game?.config.max_time || 30;
            const timeSpent = Math.max(0, maxTime - timeLeft);
            const isCorrect = answer === roundData.correctTense;
            const timeBonus = Math.floor((timeLeft / maxTime) * 100);
            const points = isCorrect ? 100 + timeBonus : 0;

            setSelectedTense(answer || null);

            await multiplayerAPI.submitAnswer(gameId, currentRound.id, {
                answer,
                is_correct: isCorrect,
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

    submitAnswerRef.current = () => {
        void submitAnswer(selectedTense || '');
    };

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

            const nextRoundData = round.round_data;
            if (!nextRoundData.visible_tenses || !nextRoundData.correct_tense || !nextRoundData.displayed_word || !nextRoundData.pronoun) {
                setError('Invalid race round data');
                return;
            }

            if (game.status === 'waiting') {
                setGame({
                    ...game,
                    status: 'in_progress',
                });
            }

            setSelectedTense(null);
            setRoundWinners([]);
            setRoundScoreGains({});
            resetForNewRound(game.players, game.config.max_time || 30);

            setCurrentRound(round);
            setRoundData({
                verb: nextRoundData.verb,
                pronoun: nextRoundData.pronoun,
                displayedWord: nextRoundData.displayed_word,
                visibleTenses: nextRoundData.visible_tenses,
                correctTense: nextRoundData.correct_tense,
            });
        },
        onRoundEnd,
        onGameFinished: (data) => {
            setFinalResults(data);
            setShowFinalResults(true);
            setCurrentRound(null);
        },
        onInviteEvent: handleInviteEvent,
        onError: handleConnectionError,
    });

    const activeGame = game!;

    const activeContent = !currentRound || !roundData ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
        </Box>
    ) : (
        <MultiplayerGameScaffold
            gameTitle={t('games.race.title', 'Conjugation Race')}
            gameTypeColor="#dc2626"
            roundNumber={currentRound.round_number}
            maxSteps={activeGame.max_steps}
            subtitle={t('games.race.title', 'Conjugation Race')}
            timeLeft={timeLeft}
            maxTime={activeGame.config.max_time || 30}
            players={activeGame.players}
            playersAnswered={playersAnswered}
            roundScoreGains={roundScoreGains}
            roundWinners={roundWinners}
            allPlayersAnswered={allPlayersAnswered}
            contextNode={
                <Card sx={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            {roundData.pronoun}{roundData.displayedWord}
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold', textAlign: 'center' }}>
                            {roundData.verb}
                        </Typography>
                    </CardContent>
                </Card>
            }
            actionNode={
                <>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" alignItems="stretch" sx={{ gap: 2, flexWrap: 'wrap' }}>
                        {roundData.visibleTenses.map((tense, index) => {
                            const isSelected = selectedTense === tense;
                            const isCorrectAnswer = roundData.correctTense === tense;
                            const showCorrectState = hasAnswered && isCorrectAnswer;
                            const showIncorrectState = hasAnswered && isSelected && !isCorrectAnswer;

                            const background = showCorrectState
                                ? 'linear-gradient(145deg, #16a34a, #15803d)'
                                : showIncorrectState
                                ? 'linear-gradient(145deg, #ef4444, #dc2626)'
                                : isSelected
                                ? 'linear-gradient(145deg, #2563eb, #1d4ed8)'
                                : 'linear-gradient(145deg, #ffffff, #f8fafc)';

                            const borderColor = showCorrectState
                                ? '#15803d'
                                : showIncorrectState
                                ? '#dc2626'
                                : isSelected
                                ? '#1d4ed8'
                                : '#dbeafe';

                            const boxShadow = showCorrectState
                                ? '0 0 24px rgba(22,163,74,0.35)'
                                : showIncorrectState
                                ? '0 0 24px rgba(239,68,68,0.35)'
                                : isSelected
                                ? '0 0 24px rgba(37,99,235,0.28)'
                                : '0 4px 18px rgba(15,23,42,0.08)';

                            const textColor = showCorrectState || showIncorrectState || isSelected ? '#ffffff' : '#111827';

                            return (
                                <motion.div
                                    key={tense}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.35, delay: index * 0.08 }}
                                    whileHover={{ scale: hasAnswered ? 1 : 1.03 }}
                                    whileTap={{ scale: hasAnswered ? 1 : 0.98 }}
                                >
                                    <Button
                                        variant="contained"
                                        disabled={hasAnswered || isSubmitting()}
                                        onClick={() => {
                                            setSelectedTense(tense);
                                            void submitAnswer(tense);
                                        }}
                                        sx={{
                                            minWidth: 240,
                                            minHeight: 110,
                                            fontSize: '1.05rem',
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            borderRadius: 3,
                                            background,
                                            color: textColor,
                                            border: '2px solid',
                                            borderColor,
                                            boxShadow,
                                            '&:hover': {
                                                background: hasAnswered
                                                    ? background
                                                    : isSelected
                                                    ? 'linear-gradient(145deg, #2563eb, #1d4ed8)'
                                                    : 'linear-gradient(145deg, #ffffff, #eff6ff)',
                                            },
                                        }}
                                    >
                                        {TENSE_KEY_TO_DISPLAY_NAMES[tense] || tense}
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </Stack>

                    {allPlayersAnswered && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Chip icon={<CheckCircleIcon />} label={t('games.multiplayer.allPlayersAnswered', 'All players have answered!')} color="success" sx={{ fontWeight: 'bold' }} />
                        </Box>
                    )}
                </>
            }
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

export default RaceMultiplayer;