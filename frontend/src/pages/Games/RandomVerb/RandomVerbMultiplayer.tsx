import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import MultiplayerGamePhase from '../../../components/Multiplayer/MultiplayerGamePhase';
import MultiplayerGameScaffold from '../../../components/Multiplayer/MultiplayerGameScaffold';
import { useMultiplayerGameEventHandlers } from '../../../hooks/useMultiplayerGameEventHandlers';
import { useMultiplayerGameSession } from '../../../hooks/useMultiplayerGameSession';
import { useMultiplayerRoundState } from '../../../hooks/useMultiplayerRoundState';
import { useMultiplayerWebSocket } from '../../../hooks/useMultiplayerWebSocket';
import { GameRound, multiplayerAPI } from '../../../services/multiplayerApi';
import { RootState } from '../../../store/store';
import { compareConjugations } from '../../../utils/tenseUtils';

type RandomVerbRoundData = {
    verb: string;
    tense: string;
    pronouns: string[];
    correctAnswers: string[];
    expectedCount: number;
};

const RandomVerbMultiplayer: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const { t } = useTranslation();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
    const [roundData, setRoundData] = useState<RandomVerbRoundData | null>(null);
    const [userAnswers, setUserAnswers] = useState<string[]>(Array(6).fill(''));
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

    const handleRoundEnd = useCallback((data: Parameters<typeof onRoundEnd>[0]) => {
        onRoundEnd(data);
    }, [onRoundEnd]);

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
            setRoundData(round.round_data as unknown as RandomVerbRoundData);
            setUserAnswers(Array(6).fill(''));
        },
        onRoundEnd: handleRoundEnd,
        onGameFinished: (data) => {
            setFinalResults(data);
            setShowFinalResults(true);
            setCurrentRound(null);
        },
    });

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[index] = value;
        setUserAnswers(newAnswers);
    };

    const handleSubmitAnswers = async () => {
        if (!currentRound || !roundData || !currentUser) return;

        submitAnswerRef.current = () => handleSubmitAnswers();

        try {
            if (hasAnswered) return;

            beginSubmission();

            let score = 0;
            const maxScore = roundData.expectedCount * 100;

            for (let i = 0; i < roundData.expectedCount; i++) {
                const userAnswer = userAnswers[i]?.trim() || '';
                const correctAnswer = roundData.correctAnswers[i];

                if (compareConjugations(userAnswer, correctAnswer)) {
                    score += 100;
                }
            }

            const finalScore = Math.round((score / maxScore) * 100);

            await multiplayerAPI.submitAnswer(
                game!.id,
                currentRound.id,
                {
                    answer: userAnswers.join(','),
                    is_correct: score === maxScore,
                    points: Math.round(finalScore),
                    time_spent: Math.max(0, Math.round((game!.config.max_time - timeLeft) * 1000)),
                }
            );

            finishSubmission();
        } catch (err) {
            console.error('Error submitting answers:', err);
            handleSubmissionError();
        }
    };

    const activeContent = !currentRound || !roundData ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
        </Box>
    ) : (
        <MultiplayerGameScaffold
            gameTitle={t('games.randomVerb.title', 'Random Verb')}
            roundNumber={currentRound.round_number}
            maxSteps={game?.max_steps || 5}
            subtitle={t('games.randomVerb.title', 'Random Verb')}
            gameTypeColor="#7c3aed"
            timeLeft={timeLeft}
            maxTime={game?.config.max_time || 30}
            players={game?.players || []}
            playersAnswered={playersAnswered}
            roundScoreGains={roundScoreGains}
            roundWinners={roundWinners}
            allPlayersAnswered={allPlayersAnswered}
            contextNode={
                <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 600 }}>
                    {t('games.randomVerb.conjugate', {
                        verb: roundData.verb,
                        tense: roundData.tense
                    })}
                </Typography>
            }
            actionNode={
                <>
                    <Stack spacing={2}>
                        {roundData.pronouns.map((pronoun, index) => (
                            <Box key={index}>
                                <TextField
                                    fullWidth
                                    label={pronoun}
                                    value={userAnswers[index] || ''}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                    disabled={hasAnswered}
                                    placeholder={`${pronoun} ${roundData.verb}...`}
                                    variant="outlined"
                                />
                            </Box>
                        ))}
                    </Stack>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={handleSubmitAnswers}
                        disabled={hasAnswered || isSubmitting()}
                    >
                        {isSubmitting() ? <CircularProgress size={24} /> : t('common.submit')}
                    </Button>
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

export default RandomVerbMultiplayer;
