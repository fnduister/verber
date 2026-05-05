import { useEffect, useRef, useState } from 'react';
import { GameRound, MultiplayerGamePlayer } from '../services/multiplayerApi';

interface UseMultiplayerRoundStateParams {
    currentRound: GameRound | null;
    maxTime: number;
    currentUserId?: number;
    onAutoSubmit: () => void;
}

export const useMultiplayerRoundState = ({
    currentRound,
    maxTime,
    currentUserId,
    onAutoSubmit,
}: UseMultiplayerRoundStateParams) => {
    const [hasAnswered, setHasAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [allPlayersAnswered, setAllPlayersAnswered] = useState(false);
    const [playersAnswered, setPlayersAnswered] = useState<Set<number>>(new Set());
    const [previousScores, setPreviousScores] = useState<{ [userId: number]: number }>({});

    const isSubmittingRef = useRef(false);
    const timerStartedRef = useRef(false);
    const autoSubmittedRef = useRef(false);
    const isAutoSubmittingRef = useRef(false);
    const autoSubmitCallbackRef = useRef(onAutoSubmit);

    useEffect(() => {
        autoSubmitCallbackRef.current = onAutoSubmit;
    }, [onAutoSubmit]);

    useEffect(() => {
        if (!currentRound) {
            return;
        }

        const calculateTimeLeft = () => {
            const roundStartTime = new Date(currentRound.started_at).getTime();
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - roundStartTime) / 1000);
            return Math.max(0, maxTime - elapsedSeconds);
        };

        const updateTimer = () => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
        };

        if (!timerStartedRef.current) {
            timerStartedRef.current = true;
        }

        updateTimer();
        const timer = setInterval(updateTimer, 50);

        return () => clearInterval(timer);
    }, [currentRound, hasAnswered, maxTime]);

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
            autoSubmitCallbackRef.current();
        }
    }, [currentRound, hasAnswered, timeLeft]);

    const markPlayerAnswered = (userId: number) => {
        setPlayersAnswered((prev) => new Set(prev).add(userId));
    };

    const beginSubmission = () => {
        if (hasAnswered || isSubmittingRef.current) {
            return false;
        }

        isSubmittingRef.current = true;
        setHasAnswered(true);

        if (currentUserId) {
            markPlayerAnswered(currentUserId);
        }

        return true;
    };

    const handleSubmissionError = () => {
        if (isAutoSubmittingRef.current) {
            setHasAnswered(true);
        } else {
            setHasAnswered(false);
        }

        isSubmittingRef.current = false;
    };

    const finishSubmission = () => {
        isAutoSubmittingRef.current = false;
    };

    const resetForNewRound = (players: MultiplayerGamePlayer[], initialTimeLeft: number) => {
        setHasAnswered(false);
        setAllPlayersAnswered(false);
        setPlayersAnswered(new Set());
        setTimeLeft(initialTimeLeft);

        const scores: { [userId: number]: number } = {};
        players.forEach((player) => {
            scores[player.user_id] = player.score;
        });
        setPreviousScores(scores);

        isSubmittingRef.current = false;
        timerStartedRef.current = false;
        autoSubmittedRef.current = false;
        isAutoSubmittingRef.current = false;
    };

    return {
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
        isSubmitting: () => isSubmittingRef.current,
    };
};