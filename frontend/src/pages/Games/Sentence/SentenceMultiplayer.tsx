import { Box, Button, Card, CardContent, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import MultiplayerGamePhase from '../../../components/Multiplayer/MultiplayerGamePhase';
import MultiplayerRoundHeader from '../../../components/Multiplayer/MultiplayerRoundHeader';
import MultiplayerScoreBar from '../../../components/Multiplayer/MultiplayerScoreBar';
import { TENSE_KEY_TO_DISPLAY_NAMES } from '../../../constants';
import { useMultiplayerGameEventHandlers } from '../../../hooks/useMultiplayerGameEventHandlers';
import { useMultiplayerGameSession } from '../../../hooks/useMultiplayerGameSession';
import { useMultiplayerRoundState } from '../../../hooks/useMultiplayerRoundState';
import { useMultiplayerWebSocket } from '../../../hooks/useMultiplayerWebSocket';
import { GameRound, multiplayerAPI } from '../../../services/multiplayerApi';
import { RootState } from '../../../store/store';
import { compareConjugations } from '../../../utils/tenseUtils';

type SentenceRoundData = {
    sentence: string;
    verb: string;
    tense: string;
    pronoun?: string;
    pronounIndex?: number;
    correctAnswers: string[];
    correct_answers?: string[];
    expectedCount: number;
};

const SentenceMultiplayer: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const { t } = useTranslation();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
    const [roundData, setRoundData] = useState<SentenceRoundData | null>(null);
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

            const rawRoundData = round.round_data as unknown as Record<string, unknown>;
            const normalizedRoundData: SentenceRoundData = {
                sentence: String(rawRoundData.sentence || ''),
                verb: String(rawRoundData.verb || ''),
                tense: String(rawRoundData.tense || ''),
                pronoun: typeof rawRoundData.pronoun === 'string' ? rawRoundData.pronoun : undefined,
                pronounIndex: typeof rawRoundData.pronoun_index === 'number' ? rawRoundData.pronoun_index : undefined,
                correctAnswers: Array.isArray(rawRoundData.correctAnswers)
                    ? (rawRoundData.correctAnswers as string[])
                    : Array.isArray(rawRoundData.correct_answers)
                        ? (rawRoundData.correct_answers as string[])
                        : [],
                expectedCount: typeof rawRoundData.expectedCount === 'number'
                    ? rawRoundData.expectedCount
                    : typeof rawRoundData.expected_count === 'number'
                        ? rawRoundData.expected_count
                        : 1,
            };

            if (!game) return;
            if (game.status === 'waiting') {
                setGame({ ...game, status: 'in_progress' });
            }
            setRoundWinners([]);
            setRoundScoreGains({});
            resetForNewRound(game.players, game.config.max_time || 30);
            setCurrentRound(round);
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

            const expectedAnswer = roundData.correctAnswers?.[0];
            if (!expectedAnswer) {
                handleSubmissionError();
                return;
            }

            const isCorrect = compareConjugations(userAnswer.trim(), expectedAnswer);
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

    const activeContent = !currentRound || !roundData ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
        </Box>
    ) : (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <MultiplayerRoundHeader
                roundNumber={currentRound.round_number}
                maxSteps={game?.max_steps || 5}
                subtitle={t('games.sentence.title', 'Sentence')}
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

            {/* Tense chip */}
            <Box sx={{ textAlign: 'center', my: 2 }}>
                <Chip
                    label={TENSE_KEY_TO_DISPLAY_NAMES[roundData.tense] || roundData.tense}
                    sx={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        padding: '20px 16px',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                />
            </Box>

            <Card sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '2px solid #06b6d4',
            }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Sentence with verb hint and blank */}
                    {(() => {
                        const correctAnswer = roundData.correctAnswers?.[0] || '';
                        const isCorrect = hasAnswered && compareConjugations(userAnswer.trim(), correctAnswer);
                        return (
                            <Typography
                                variant="h5"
                                sx={{
                                    textAlign: 'center',
                                    mb: 4,
                                    color: '#0c4a6e',
                                    lineHeight: 1.9,
                                    fontWeight: 500,
                                }}
                            >
                                {roundData.sentence.split('___').map((part, index, array) => (
                                    <React.Fragment key={index}>
                                        {part}
                                        {index < array.length - 1 && (
                                            <>
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: '#8b5cf6',
                                                        fontSize: '0.95em',
                                                    }}
                                                >
                                                    ({roundData.verb})
                                                </Box>
                                                {hasAnswered ? (
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            display: 'inline-block',
                                                            fontWeight: 'bold',
                                                            color: isCorrect ? '#059669' : '#dc2626',
                                                            borderBottom: `3px solid ${isCorrect ? '#059669' : '#dc2626'}`,
                                                            px: 1,
                                                            mx: 1,
                                                        }}
                                                    >
                                                        {correctAnswer}
                                                    </Box>
                                                ) : (
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            display: 'inline-block',
                                                            borderBottom: '3px solid #06b6d4',
                                                            minWidth: '120px',
                                                            mx: 1,
                                                        }}
                                                    >
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    </Box>
                                                )}
                                            </>
                                        )}
                                    </React.Fragment>
                                ))}
                            </Typography>
                        );
                    })()}

                    <Stack spacing={2} alignItems="center">
                        <TextField
                            fullWidth
                            label={t('games.sentence.answer', 'Fill in the blank')}
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            disabled={hasAnswered}
                            placeholder={t('games.sentence.placeholder', 'Enter the conjugated verb...')}
                            variant="outlined"
                            autoFocus
                            sx={{ maxWidth: 400 }}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !hasAnswered) handleSubmitAnswer(); }}
                        />
                    </Stack>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, maxWidth: 400, display: 'block', mx: 'auto' }}
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

export default SentenceMultiplayer;
