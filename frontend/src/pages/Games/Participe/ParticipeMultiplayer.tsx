import { Box, Button, Card, CardContent, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import MultiplayerGamePhase from '../../../components/Multiplayer/MultiplayerGamePhase';
import MultiplayerRoundHeader from '../../../components/Multiplayer/MultiplayerRoundHeader';
import MultiplayerScoreBar from '../../../components/Multiplayer/MultiplayerScoreBar';
import { useMultiplayerGameEventHandlers } from '../../../hooks/useMultiplayerGameEventHandlers';
import { useMultiplayerGameSession } from '../../../hooks/useMultiplayerGameSession';
import { useMultiplayerRoundState } from '../../../hooks/useMultiplayerRoundState';
import { useMultiplayerWebSocket } from '../../../hooks/useMultiplayerWebSocket';
import { GameRound, multiplayerAPI } from '../../../services/multiplayerApi';
import { RootState } from '../../../store/store';
import { compareConjugations } from '../../../utils/tenseUtils';

type ParticipeRoundData = {
    verb: string;
    tense: string;
    correctAnswers: string[];
    correct_answers?: string[];
    expectedCount: number;
};

const ParticipeMultiplayer: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const { t } = useTranslation();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
    const [roundData, setRoundData] = useState<ParticipeRoundData | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
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
                setError('Failed to load round data');
                return;
            }
            if (!game) return;
            if (game.status === 'waiting') {
                setGame({ ...game, status: 'in_progress' });
            }
            setRoundWinners([]);
            setRoundScoreGains({});
            resetForNewRound(game.players, game.config.max_time || 30);
            setCurrentRound(round);
            const raw = round.round_data as unknown as Record<string, unknown>;
            const normalizedRoundData: ParticipeRoundData = {
                verb: (raw.verb as string) || '',
                tense: (raw.tense as string) || '',
                correctAnswers: Array.isArray(raw.correctAnswers)
                    ? (raw.correctAnswers as string[])
                    : Array.isArray(raw.correct_answers)
                        ? (raw.correct_answers as string[])
                        : [],
                expectedCount: typeof raw.expectedCount === 'number'
                    ? raw.expectedCount
                    : typeof raw.expected_count === 'number'
                        ? raw.expected_count as number
                        : 1,
            };
            setRoundData(normalizedRoundData);
            setUserAnswer('');
        },
        onRoundEnd,
        onGameFinished: (data) => {
            setFinalResults(data);
            setShowFinalResults(true);
            setCurrentRound(null);
        },
    });

    const handleSubmitAnswer = async () => {
        if (!currentRound || !roundData || !currentUser) return;

        submitAnswerRef.current = () => handleSubmitAnswer();

        try {
            if (hasAnswered) return;

            beginSubmission();

            const isCorrect = compareConjugations(userAnswer.trim(), roundData.correctAnswers[0]);
            const points = isCorrect ? 100 : 0;

            await multiplayerAPI.submitAnswer(
                game!.id,
                currentRound.id,
                {
                    answer: userAnswer.trim(),
                    is_correct: isCorrect,
                    points,
                    time_spent: (game!.config.max_time - timeLeft) * 1000,
                }
            );

            finishSubmission();
        } catch (err) {
            console.error('Error submitting answer:', err);
            handleSubmissionError();
        }
    };

    const participleType =
        roundData?.tense === 'past' || roundData?.tense === 'participe_passe'
            ? t('games.participe.types.past', 'Past Participle')
            : t('games.participe.types.present', 'Present Participle');

    const activeContent = !currentRound || !roundData ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
        </Box>
    ) : (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <MultiplayerRoundHeader
                roundNumber={currentRound.round_number}
                maxSteps={game?.max_steps || 5}
                subtitle={t('games.participe.title', 'Participle')}
                timeLeft={timeLeft}
                maxTime={game?.config.max_time || 30}
            />

            <MultiplayerScoreBar
                players={game?.players || []}
                playersAnswered={playersAnswered}
                roundScoreGains={roundScoreGains}
                roundWinners={roundWinners}
                allPlayersAnswered={allPlayersAnswered}
                sticky
            />

            {/* Participle type chip */}
            <Box sx={{ textAlign: 'center', my: 2 }}>
                <Chip
                    label={participleType}
                    sx={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        padding: '20px 16px',
                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                />
            </Box>

            <Card sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '2px solid #ec4899',
            }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Verb */}
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            textAlign: 'center',
                            mb: 4,
                        }}
                    >
                        {roundData.verb}
                    </Typography>

                    {/* Input */}
                    <Stack spacing={2} alignItems="center">
                        <TextField
                            fullWidth
                            variant="outlined"
                            label={t('games.participe.answer', 'Enter the participle')}
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            disabled={hasAnswered}
                            placeholder={t('games.participe.placeholder', 'e.g., aimé...')}
                            autoFocus
                            sx={{
                                maxWidth: 400,
                                '& .MuiOutlinedInput-root': {
                                    fontSize: '1.3rem',
                                    backgroundColor: hasAnswered
                                        ? (compareConjugations(userAnswer.trim(), roundData.correctAnswers[0] || '')
                                            ? 'rgba(5, 150, 105, 0.08)'
                                            : 'rgba(220, 38, 38, 0.08)')
                                        : 'background.paper',
                                    '&:hover fieldset': { borderColor: '#ec4899' },
                                    '&.Mui-focused fieldset': { borderColor: '#ec4899', borderWidth: 2 },
                                },
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !hasAnswered) handleSubmitAnswer(); }}
                        />
                    </Stack>

                    {/* Correct answer reveal */}
                    {hasAnswered && (() => {
                        const correctAnswer = roundData.correctAnswers[0] || '';
                        const isCorrect = compareConjugations(userAnswer.trim(), correctAnswer);
                        return (
                            <Box
                                sx={{
                                    mt: 3,
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: isCorrect ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                                    border: `1px solid ${isCorrect ? '#059669' : '#dc2626'}`,
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="body1" fontWeight="bold" color={isCorrect ? '#059669' : '#dc2626'}>
                                    {isCorrect ? '✓ ' + t('games.common.correct', 'Correct!') : '✗ ' + t('games.common.incorrect', 'Incorrect')}
                                </Typography>
                                {!isCorrect && (
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {t('games.common.correctAnswerWas', 'Correct answer')}: <strong>{correctAnswer}</strong>
                                    </Typography>
                                )}
                            </Box>
                        );
                    })()}

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            maxWidth: 400,
                            display: 'block',
                            mx: 'auto',
                            minHeight: 50,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        }}
                        onClick={handleSubmitAnswer}
                        disabled={hasAnswered || isSubmitting()}
                    >
                        {isSubmitting() ? <CircularProgress size={24} /> : t('common.submit')}
                    </Button>
                </CardContent>
            </Card>
        </Box>
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

export default ParticipeMultiplayer;
