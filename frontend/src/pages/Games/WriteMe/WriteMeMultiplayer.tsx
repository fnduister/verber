import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    TextField,
    Typography
} from '@mui/material';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import MultiplayerGamePhase from '../../../components/Multiplayer/MultiplayerGamePhase';
import MultiplayerGameScaffold from '../../../components/Multiplayer/MultiplayerGameScaffold';
import { TENSE_KEY_TO_DISPLAY_NAMES } from '../../../constants';
import { PRONOUNS } from '../../../constants/gameConstants';
import { useMultiplayerGameEventHandlers } from '../../../hooks/useMultiplayerGameEventHandlers';
import { useMultiplayerGameSession } from '../../../hooks/useMultiplayerGameSession';
import { useMultiplayerRoundState } from '../../../hooks/useMultiplayerRoundState';
import { useMultiplayerWebSocket } from '../../../hooks/useMultiplayerWebSocket';
import { GameRound, multiplayerAPI } from '../../../services/multiplayerApi';
import { RootState } from '../../../store/store';
import { compareConjugations } from '../../../utils/tenseUtils';

type WriteMeRoundData = {
    verb: string;
    tense: string;
    pronouns: string[];
    correctAnswers: string[];
};

const EMPTY_ANSWERS = Array(6).fill('');

const WriteMeMultiplayer: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const { t } = useTranslation();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
    const [roundData, setRoundData] = useState<WriteMeRoundData | null>(null);
    const [userAnswers, setUserAnswers] = useState<string[]>(EMPTY_ANSWERS);
    const [correctness, setCorrectness] = useState<(boolean | null)[]>(EMPTY_ANSWERS.map(() => null));
    const [showFinalResults, setShowFinalResults] = useState(false);
    const [finalResults, setFinalResults] = useState<unknown>(null);
    const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
    const [roundWinners, setRoundWinners] = useState<number[]>([]);
    const [roundScoreGains, setRoundScoreGains] = useState<{ [userId: number]: number }>({});

    const answersRef = useRef<string[]>(EMPTY_ANSWERS);
    const submitAnswersRef = useRef<(() => void) | null>(null);

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
            submitAnswersRef.current?.();
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

    const handleAnswerChange = (index: number, value: string) => {
        if (hasAnswered || isSubmitting()) {
            return;
        }

        setUserAnswers((prev) => {
            const updated = [...prev];
            updated[index] = value;
            answersRef.current = updated;
            return updated;
        });
    };

    const submitAnswers = async (answersToSubmit: string[]) => {
        if (!gameId || !currentRound || !roundData) {
            return;
        }

        if (!beginSubmission()) {
            return;
        }

        try {
            const correctnessResult = roundData.correctAnswers.map((correctAnswer, index) => {
                return compareConjugations(answersToSubmit[index]?.trim() || '', correctAnswer.trim());
            });
            const correctCount = correctnessResult.filter(Boolean).length;
            const maxTime = game?.config.max_time || 30;
            const timeSpent = Math.max(0, maxTime - timeLeft);
            const timeBonus = Math.floor((timeLeft / maxTime) * 100);
            const points = correctCount > 0 ? (correctCount * 100) + timeBonus : 0;

            setCorrectness(correctnessResult);

            await multiplayerAPI.submitAnswer(gameId, currentRound.id, {
                answer: JSON.stringify(answersToSubmit),
                is_correct: correctCount === roundData.correctAnswers.length,
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

    submitAnswersRef.current = () => {
        void submitAnswers(answersRef.current);
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
            if (!nextRoundData.correct_answers || !nextRoundData.pronouns) {
                setError('Invalid write-me round data');
                return;
            }

            if (game.status === 'waiting') {
                setGame({
                    ...game,
                    status: 'in_progress',
                });
            }

            answersRef.current = EMPTY_ANSWERS;
            setUserAnswers(EMPTY_ANSWERS);
            setCorrectness(EMPTY_ANSWERS.map(() => null));
            setRoundWinners([]);
            setRoundScoreGains({});
            resetForNewRound(game.players, game.config.max_time || 30);

            setCurrentRound(round);
            setRoundData({
                verb: nextRoundData.verb,
                tense: nextRoundData.tense,
                pronouns: nextRoundData.pronouns,
                correctAnswers: nextRoundData.correct_answers,
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
            gameTitle={t('games.writeMe.title', 'Write Me')}
            gameTypeColor="#ea580c"
            roundNumber={currentRound.round_number}
            maxSteps={activeGame.max_steps}
            subtitle={`${roundData.verb} • ${TENSE_KEY_TO_DISPLAY_NAMES[roundData.tense] || roundData.tense}`}
            timeLeft={timeLeft}
            maxTime={activeGame.config.max_time || 30}
            players={activeGame.players}
            playersAnswered={playersAnswered}
            roundScoreGains={roundScoreGains}
            roundWinners={roundWinners}
            allPlayersAnswered={allPlayersAnswered}
            contextNode={
                <Card sx={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)' }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                            {roundData.verb}
                        </Typography>
                        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            {TENSE_KEY_TO_DISPLAY_NAMES[roundData.tense] || roundData.tense}
                        </Typography>
                    </CardContent>
                </Card>
            }
            actionNode={
                <>
                    <Grid container spacing={2}>
                        {roundData.pronouns.map((pronoun, index) => (
                            <Grid item xs={12} md={6} key={`${pronoun}-${index}`}>
                                <TextField
                                    fullWidth
                                    label={pronoun.trim() || PRONOUNS[index]}
                                    value={userAnswers[index]}
                                    onChange={(event) => handleAnswerChange(index, event.target.value)}
                                    disabled={hasAnswered}
                                    error={correctness[index] === false}
                                    helperText={
                                        correctness[index] === true
                                            ? t('common.correct', 'Correct')
                                            : correctness[index] === false
                                            ? roundData.correctAnswers[index]
                                            : ' '
                                    }
                                />
                            </Grid>
                        ))}
                    </Grid>

                    {!hasAnswered && (
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Button variant="contained" size="large" onClick={() => void submitAnswers(userAnswers)}>
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

export default WriteMeMultiplayer;