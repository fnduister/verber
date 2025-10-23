import { EmojiEvents, PlayArrow, Timer, TrendingUp } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Container, LinearProgress, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GameErrorDisplay from '../../../components/GameErrorDisplay';
import GameScoreDialog from '../../../components/GameScoreDialog';
import { TENSE_KEY_TO_DISPLAY_NAMES } from '../../../constants';
import { GAME_METADATA, MAX_TRIES } from '../../../constants/gameConstants';
import { useAudio } from '../../../hooks/useAudio';
import { fetchVerbs } from '../../../store/slices/verbSlice';
import { AppDispatch, RootState } from '../../../store/store';
import { getPronoun, randElement, shuffle } from '../../../utils/gameUtils';
import { findVerbByInfinitive, getConjugation } from '../../../utils/tenseUtils';

interface RaceStepData {
    pronoun: string;
    word: string;
    visibleTenses: string[];
    stepTense: string;
}

interface RaceGameInfo {
    currentStep: number;
    maxStep: number;
    score: number;
    maxTime: number;
    duration: number;
}



const Race: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Audio feedback
    const { playSuccess, playFailure } = useAudio();
    const { t } = useTranslation();

    const currentVerbs = useSelector((state: RootState) => state.game.currentVerbs);
    const currentTenses = useSelector((state: RootState) => state.game.currentTenses);
    const allVerbs = useSelector((state: RootState) => state.verb.verbs);
    const ongoingGameInfo = useSelector((state: RootState) => state.game.ongoingGameInfo);

    const [gameData, setGameData] = useState<RaceStepData[]>([]);
    const [gameScore, setGameScore] = useState<RaceGameInfo>({
        currentStep: 0,
        score: 0,
        maxTime: ongoingGameInfo.maxTime,
        maxStep: ongoingGameInfo.maxStep,
        duration: 0
    });
    const [showScore, setShowScore] = useState(false);

    const [timeLeft, setTimeLeft] = useState(ongoingGameInfo.maxTime);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [animateBackground, setAnimateBackground] = useState<string>('white');
    const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const timerRef = useRef<number | null>(null);

    const initializeGame = useCallback(() => {
        
        setHasError(false);
        const steps: RaceStepData[] = [];
        const maxSteps = ongoingGameInfo.maxStep;

        for (let i = 0; i < maxSteps; i++) {
            // Pick a random verb for this step
            const selectedVerb = randElement(currentVerbs);
            const verbData = findVerbByInfinitive(allVerbs, selectedVerb);
            
            if (!verbData) {
                setErrorMessage(t('game.error.verbDataMissing', { verb: selectedVerb }));
                console.log('Race - Found verb data:', verbData ? verbData.infinitive : 'NOT FOUND');
            }
            
            let tries = 0;
            let allTenseOptions: string[] = [];
            if (verbData && verbData.conjugations) {
                while (allTenseOptions.length < 3 && tries < MAX_TRIES) {
                    const correctTense = randElement(currentTenses);
                    const pronounIndex = Math.floor(Math.random() * 6);
                    const conjugation = getConjugation(verbData.conjugations, correctTense, pronounIndex);
                    if (conjugation) {
                        // Generate 3 tense options including the correct one
                        const wrongTenses = shuffle(currentTenses.filter(t => t !== correctTense)).slice(0, 2);
                        allTenseOptions = shuffle([correctTense, ...wrongTenses]);

                        steps.push({
                            pronoun: getPronoun(pronounIndex),
                            word: conjugation,
                            visibleTenses: allTenseOptions,
                            stepTense: correctTense,
                        });
                    }
                    tries++;
                }
            }else{
                setErrorMessage(t('game.error.verbDataMissing', { verb: selectedVerb }));
                setHasError(true);
            }

            if (allTenseOptions.length < 3) {
                setErrorMessage(t('game.error.insufficientTenseOptions', { verb: selectedVerb }));
                setHasError(true);
            }
        }

        if (steps.length === 0) {
            setHasError(true);
            return;
        }

        setGameData(steps);
        setGameScore({
            currentStep: 0,
            score: 0,
            maxTime: ongoingGameInfo.maxTime,
            maxStep: steps.length,
            duration: 0
        });
        setTimeLeft(ongoingGameInfo.maxTime);
    }, [currentTenses, currentVerbs, allVerbs, ongoingGameInfo.maxTime, ongoingGameInfo.maxStep]);

    // Fetch verbs when component mounts
    useEffect(() => {
        if (allVerbs.length === 0) {
            dispatch(fetchVerbs());
        }
    }, [dispatch, allVerbs.length]);

    // Initialize game
    useEffect(() => {
        if (currentVerbs.length === 0 || currentTenses.length === 0) {
            setHasError(true);
            return;
        }
        initializeGame();
    }, [currentVerbs.length, currentTenses.length, initializeGame, navigate]);

    const handleAnswer = useCallback((answer: string) => {
        // Prevent multiple calls or processing during transition
        if (selectedAnswer !== null || isProcessingAnswer) return;

        // Set processing state immediately to prevent race conditions
        setIsProcessingAnswer(true);

        // Immediately stop the timer
        if (timerRef.current !== null) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }

        const currentQuestion = gameData[gameScore.currentStep];
        if (!currentQuestion) {
            setIsProcessingAnswer(false);
            return; // Safety check
        }

        const correct = answer === currentQuestion.stepTense;

        setSelectedAnswer(answer);
        setIsCorrect(correct);

        // Visual feedback
        setAnimateBackground(correct ? '#4caf50' : '#f44336');
        setTimeout(() => setAnimateBackground('white'), 1500);

        // Audio feedback - determine if this is the last step
        const isLastStep = gameScore.currentStep + 1 >= gameScore.maxStep;
        if (correct) {
            playSuccess(isLastStep);
        } else {
            playFailure(isLastStep);
        }

        // Update score
        if (correct) {
            setGameScore(prev => ({
                ...prev,
                score: prev.score + 100,
            }));
        }

        // Move to next question or show score
        setTimeout(() => {
            setSelectedAnswer(null);
            setIsCorrect(null);
            setIsProcessingAnswer(false);

            if (gameScore.currentStep + 1 >= gameScore.maxStep) {
                setShowScore(true);
            } else {
                setGameScore(prev => ({
                    ...prev,
                    currentStep: prev.currentStep + 1,
                }));
                // Timer will restart automatically via useEffect dependency change
            }
        }, 1500);
    }, [gameData, gameScore.currentStep, gameScore.maxStep, selectedAnswer, isProcessingAnswer, playSuccess, playFailure]);

    // Timer - using more frequent updates for smoother animation
    useEffect(() => {
        // Clean up any existing timer
        if (timerRef.current !== null) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }

        // Don't start timer if conditions aren't met, answer is selected, or processing
        if (ongoingGameInfo.maxTime === 0 ||
            gameScore.currentStep >= gameScore.maxStep ||
            showScore ||
            selectedAnswer !== null ||
            isProcessingAnswer) {
            return;
        }

        // Reset timer to full time when starting new question
        setTimeLeft(ongoingGameInfo.maxTime);

        const startTime = Date.now();
        const targetDuration = ongoingGameInfo.maxTime * 1000; // Convert to milliseconds

        const updateTimer = () => {
            // Check if we should stop (answer was selected or being processed)
            if (selectedAnswer !== null || isProcessingAnswer) {
                timerRef.current = null;
                return;
            }

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, targetDuration - elapsed);
            const remainingSeconds = remaining / 1000;

            // Update the visual timer first
            setTimeLeft(remainingSeconds);

            // Add a small buffer (100ms) to ensure visual timer reaches zero before timeout
            if (remaining <= 100) {
                timerRef.current = null;
                // Only call timeout if no answer is being processed and we're truly at zero
                if (!isProcessingAnswer && selectedAnswer === null && remainingSeconds <= 0.1) {
                    handleAnswer(''); // Time's up
                }
                return;
            }
            timerRef.current = requestAnimationFrame(updateTimer);
        };

        timerRef.current = requestAnimationFrame(updateTimer);

        return () => {
            if (timerRef.current !== null) {
                cancelAnimationFrame(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [gameScore.currentStep, gameScore.maxStep, showScore, ongoingGameInfo.maxTime, handleAnswer, selectedAnswer, isProcessingAnswer]);

    const handleClose = () => {
        navigate('/dashboard');
    };

    const handlePlayAgain = () => {
        setShowScore(false);
        setHasError(false);
        initializeGame();
    };

    // Show error state
    if (hasError) {
        return (
            <GameErrorDisplay
                hasValidConfig={currentVerbs.length > 0 && currentTenses.length > 0}
                onRetry={handlePlayAgain}
                onConfigure={() => navigate('/game-room/'+ GAME_METADATA["find-error"].url)}
                errorMessage={errorMessage}
            />
        );
    }

    if (gameData.length === 0 || gameScore.currentStep >= gameData.length) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h5">Chargement du jeu...</Typography>
            </Container>
        );
    }

    const currentQuestion = gameData[gameScore.currentStep];

    // Additional safety check
    if (!currentQuestion) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h5">Chargement du jeu...</Typography>
            </Container>
        );
    }
    const progressPercent = ((gameScore.currentStep + 1) / gameScore.maxStep) * 100;
    const timePercent = ongoingGameInfo.maxTime > 0 ? Math.max(0, (timeLeft / ongoingGameInfo.maxTime) * 100) : 100;

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            position: 'relative'
        }}>
            {/* Subtle Static Background Pattern */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                    radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
                `,
                zIndex: 0
            }} />

            <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
                {/* Header with Score and Progress */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card sx={{
                        mb: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                >
                                    <Chip
                                        icon={<PlayArrow />}
                                        label={`Question ${gameScore.currentStep + 1}/${gameScore.maxStep}`}
                                        sx={{
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </motion.div>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <EmojiEvents sx={{ color: '#ffd700' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {gameScore.score}
                                        </Typography>
                                    </Stack>
                                </motion.div>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={progressPercent}
                                sx={{
                                    mb: 2,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: '#ffd700',
                                        borderRadius: 4
                                    }
                                }}
                            />
                            {ongoingGameInfo.maxTime > 0 && (
                                <>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                        <Timer sx={{ fontSize: '1rem' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {timeLeft <= 0 ? 0 : Math.ceil(timeLeft)}s
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.max(0, timePercent)}
                                        color={timePercent > 20 ? "secondary" : "error"}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            transition: 'none',
                                            '& .MuiLinearProgress-bar': {
                                                transition: 'none',
                                                borderRadius: 3
                                            }
                                        }}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Verb Display */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    key={gameScore.currentStep}
                >
                    <Container sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
                        <Box
                            component={motion.div}
                            animate={{ backgroundColor: animateBackground }}
                            transition={{ duration: 0.5 }}
                            sx={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                borderRadius: 4,
                                padding: 4,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                border: '2px solid',
                                borderColor: 'primary.light',
                                minWidth: 350,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    textAlign: 'center'
                                }}
                            >
                                {currentQuestion.pronoun} {currentQuestion.word}
                            </Typography>
                        </Box>
                    </Container>
                </motion.div>

                {/* Instruction */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <Typography
                        variant="h4"
                        textAlign="center"
                        sx={{
                            mb: 4,
                            fontWeight: 'bold',
                            color: '#1f2937',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        🏁 Quelle est la bonne conjugaison ?
                    </Typography>
                </motion.div>

                {/* Answer Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ flexWrap: 'wrap', gap: 3 }}
                    >
                        {currentQuestion.visibleTenses.map((tense, index) => {
                            let buttonColor = 'primary';
                            let buttonVariant: 'contained' | 'outlined' = 'contained';

                            if (selectedAnswer !== null) {
                                if (selectedAnswer === tense) {
                                    buttonColor = isCorrect ? 'success' : 'error';
                                } else if (!isCorrect && tense === currentQuestion.stepTense) {
                                    buttonColor = 'success';
                                    buttonVariant = 'outlined';
                                }
                            }

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.7 + (index * 0.1),
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={() => handleAnswer(tense)}
                                        color={buttonColor as any}
                                        variant={buttonVariant}
                                        disabled={selectedAnswer !== null || isProcessingAnswer}
                                        sx={{
                                            minWidth: 220,
                                            minHeight: 80,
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                            background: selectedAnswer === null ?
                                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
                                            '&:hover': {
                                                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                                                transform: 'translateY(-2px)'
                                            },
                                            '&:disabled': {
                                                opacity: 0.8
                                            },
                                            ...(selectedAnswer !== null && !isCorrect && tense === currentQuestion.stepTense && {
                                                border: '3px solid',
                                                borderColor: 'success.main',
                                                backgroundColor: 'success.light',
                                                color: 'success.contrastText',
                                                animation: 'pulse 1s infinite',
                                                '@keyframes pulse': {
                                                    '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                                                    '70%': { boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)' },
                                                    '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                                                }
                                            })
                                        }}
                                    >
                                        {TENSE_KEY_TO_DISPLAY_NAMES[tense] || tense}
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </Stack>
                </motion.div>

                {/* Feedback Text */}
                {selectedAnswer !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                    >
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            {isCorrect ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                                >
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#4caf50',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1
                                        }}
                                    >
                                        🎉 Excellent ! Bonne réponse ! <TrendingUp sx={{ color: '#4caf50' }} />
                                    </Typography>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#f44336',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        ❌ Pas tout à fait ! La bonne réponse était :
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#4caf50',
                                            mt: 1,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        "{TENSE_KEY_TO_DISPLAY_NAMES[currentQuestion.stepTense] || currentQuestion.stepTense}"
                                    </Typography>
                                </motion.div>
                            )}
                        </Box>
                    </motion.div>
                )}

                {/* Reusable Score Dialog */}
                <GameScoreDialog
                    open={showScore}
                    onClose={handleClose}
                    onPlayAgain={handlePlayAgain}
                    score={gameScore.score}
                    maxScore={gameScore.maxStep * 100}
                    correctAnswers={gameScore.score / 100}
                    totalQuestions={gameScore.maxStep}
                />
            </Container>
        </Box>
    );
};

export default Race;