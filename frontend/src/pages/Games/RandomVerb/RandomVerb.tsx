import { CheckCircle, TrendingUp } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid, TextField,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GameErrorDisplay from '../../../components/GameErrorDisplay';
import GameHeader from '../../../components/GameHeader';
import GameScoreDialog from '../../../components/GameScoreDialog';
import PauseOverlay from '../../../components/PauseOverlay';
import { TENSE_KEY_TO_DISPLAY_NAMES } from '../../../constants';
import { GAME_METADATA } from '../../../constants/gameConstants';
import { useAudio } from '../../../hooks/useAudio';
import { fetchVerbs } from '../../../store/slices/verbSlice';
import { AppDispatch, RootState } from '../../../store/store';
import { getPronoun, randElement } from '../../../utils/gameUtils';
import { findVerbByInfinitive, getConjugation, normalizeString } from '../../../utils/tenseUtils';

interface RandomVerbQuestion {
    verb: string;
    tense: string;
    pronounIndex: number;
    correctAnswer: string;
}

interface RandomVerbRow {
    question: RandomVerbQuestion;
    userAnswer: string;
}

interface GameScore {
    currentStep: number;
    score: number;
    maxScore: number;
    maxStep: number;
}

const RandomVerb: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Audio feedback
    const { playSuccess, playFailure } = useAudio();

    const currentVerbs = useSelector((state: RootState) => state.game.currentVerbs);
    const currentTenses = useSelector((state: RootState) => state.game.currentTenses);
    const allVerbs = useSelector((state: RootState) => state.verb.verbs);
    const ongoingGameInfo = useSelector((state: RootState) => state.game.ongoingGameInfo);

    const [gameData, setGameData] = useState<RandomVerbRow[]>([]);
    const [gameScore, setGameScore] = useState<GameScore>({
        currentStep: 0,
        score: 0,
        maxScore: 0,
        maxStep: ongoingGameInfo.maxStep,
    });
    const [showScore, setShowScore] = useState(false);
    const [timeLeft, setTimeLeft] = useState(ongoingGameInfo.maxTime);
    const [showAnswers, setShowAnswers] = useState(false);
    const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
    const [correctnessStatus, setCorrectnessStatus] = useState<(boolean | null)[]>(Array(6).fill(null));
    const [isPaused, setIsPaused] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const timerRef = useRef<number | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
    const pauseTimeRef = useRef<number>(0);
    const userAnswersRef = useRef<string[]>(Array(6).fill(''));

    const initializeGame = useCallback(() => {
        setHasError(false);
        setErrorMessage(null);
        const steps: RandomVerbRow[] = [];
        const maxSteps = ongoingGameInfo.maxStep;

        console.log("🎮 Initializing RandomVerb game with configuration:", {
            selectedVerbs: currentVerbs,
            selectedTenses: currentTenses,
            verbCount: currentVerbs.length,
            tenseCount: currentTenses.length,
            maxSteps: maxSteps,
            totalVerbsAvailable: allVerbs.length
        });

        try {
            for (let i = 0; i < maxSteps; i++) {
                const stepData: RandomVerbRow = {
                    question: {
                        verb: '',
                        tense: '',
                        pronounIndex: 0,
                        correctAnswer: ''
                    },
                    userAnswer: ''
                };

                // Generate 6 random questions for this step
                const questions: RandomVerbQuestion[] = [];

                for (let j = 0; j < 6; j++) {
                    const selectedVerb = randElement(currentVerbs);
                    const verbData = findVerbByInfinitive(allVerbs, selectedVerb);

                    if (!verbData) {
                        console.error(`❌ Verb data not found for "${selectedVerb}"`, {
                            attemptedVerb: selectedVerb,
                            availableVerbs: allVerbs.map(v => v.infinitive).slice(0, 10),
                            totalAvailable: allVerbs.length
                        });
                        throw new Error(t('games.error.verbDataMissing', { verb: selectedVerb }));
                    }

                    const selectedTense = randElement(currentTenses);
                    const pronounIndex = Math.floor(Math.random() * 6);

                    const correctAnswer = verbData.conjugations
                        ? getConjugation(verbData.conjugations, selectedTense, pronounIndex)
                        : '';

                    if (!correctAnswer) {
                        console.error(`❌ Failed to get conjugation`, {
                            verb: selectedVerb,
                            tense: selectedTense,
                            pronounIndex: pronounIndex,
                            pronoun: getPronoun(pronounIndex),
                            hasConjugations: !!verbData.conjugations,
                            conjugationsKeys: verbData.conjugations ? Object.keys(verbData.conjugations).slice(0, 5) : []
                        });
                        throw new Error(t('games.error.failedToGenerate'));
                    }

                    questions.push({
                        verb: selectedVerb,
                        tense: selectedTense,
                        pronounIndex,
                        correctAnswer
                    });
                }

                // Store all 6 questions for this step
                if (i === 0) {
                    questions.forEach(q => {
                        steps.push({
                            question: q,
                            userAnswer: ''
                        });
                    });
                }
            }
        } catch (err) {
            console.error("❌ Error initializing RandomVerb game:", err);
            console.error("🔧 Game Configuration Debug Info:", {
                selectedVerbs: currentVerbs,
                selectedTenses: currentTenses,
                verbCount: currentVerbs.length,
                tenseCount: currentTenses.length,
                maxSteps: maxSteps,
                totalVerbsAvailable: allVerbs.length,
                error: err
            });
            setHasError(true);
            setErrorMessage(
                t('games.error.unexpected') + "\n" +
                `Error: ${err}\n\n` +
                `Configuration:\n` +
                `- Verbs selected: ${currentVerbs.length} (${currentVerbs.join(', ')})\n` +
                `- Tenses selected: ${currentTenses.length} (${currentTenses.join(', ')})\n` +
                `- Max steps: ${maxSteps}\n` +
                `- Total verbs available: ${allVerbs.length}`
            );
            return;
        }

        if (steps.length === 0) {
            console.error("❌ RandomVerb game failed: No data generated");
            console.error("🔧 Game Configuration Debug Info:", {
                selectedVerbs: currentVerbs,
                selectedTenses: currentTenses,
                verbCount: currentVerbs.length,
                tenseCount: currentTenses.length,
                maxSteps: maxSteps,
                totalVerbsAvailable: allVerbs.length,
                stepsGenerated: steps.length
            });
            setHasError(true);
            setErrorMessage(
                t('games.error.noData') + "\n\n" +
                `Configuration:\n` +
                `- Verbs selected: ${currentVerbs.length} (${currentVerbs.join(', ')})\n` +
                `- Tenses selected: ${currentTenses.length} (${currentTenses.join(', ')})\n` +
                `- Max steps: ${maxSteps}\n` +
                `- Total verbs available: ${allVerbs.length}`
            );
            return;
        }

        setGameData(steps);
        setGameScore({
            currentStep: 0,
            score: 0,
            maxScore: ongoingGameInfo.maxStep * 600, // 100 points per question, 6 questions per step
            maxStep: ongoingGameInfo.maxStep,
        });
        setTimeLeft(ongoingGameInfo.maxTime);
        setShowAnswers(false);
        setCorrectnessStatus(Array(6).fill(null));
        userAnswersRef.current = Array(6).fill('');
    }, [currentTenses, currentVerbs, allVerbs, ongoingGameInfo.maxTime, ongoingGameInfo.maxStep, t]);

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
            setErrorMessage(t('games.error.invalidConfig'));
            return;
        }
        initializeGame();
    }, [currentVerbs.length, currentTenses.length, initializeGame, t]);

    const handleAnswerChange = (index: number, value: string) => {
        if (showAnswers || isProcessingAnswer) return;

        userAnswersRef.current[index] = value;
    };

    const checkAnswers = useCallback(() => {
        if (isProcessingAnswer || gameData.length === 0) return;

        setIsProcessingAnswer(true);

        // Stop the timer
        if (timerRef.current !== null) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }

        const currentQuestions = gameData.slice(0, 6);

        // Check each answer
        const correctness: (boolean | null)[] = [];
        let correctCount = 0;

        for (let i = 0; i < 6; i++) {
            const userAnswer = normalizeString(userAnswersRef.current[i].trim().toLowerCase());
            const correctAnswer = normalizeString(currentQuestions[i].question.correctAnswer.toLowerCase());
            const isCorrect = userAnswer === correctAnswer;
            correctness[i] = isCorrect;
            if (isCorrect) correctCount++;
        }

        setCorrectnessStatus(correctness);
        setShowAnswers(true);

        // Calculate score based on correct answers
        const scoreIncrease = correctCount * 100;
        setGameScore(prev => ({
            ...prev,
            score: prev.score + scoreIncrease
        }));

        // Play audio feedback
        const isNextLastStep = gameScore.currentStep + 1 >= gameScore.maxStep;
        if (correctCount >= 4) {
            playSuccess(isNextLastStep);
        } else {
            playFailure(isNextLastStep);
        }

        // Move to next question after delay
        setTimeout(() => {
            setShowAnswers(false);
            setIsProcessingAnswer(false);
            setCorrectnessStatus(Array(6).fill(null));
            userAnswersRef.current = Array(6).fill('');

            // Clear all input fields
            inputRefs.current.forEach(ref => {
                if (ref) ref.value = '';
            });

            if (gameScore.currentStep + 1 >= gameScore.maxStep) {
                setShowScore(true);
            } else {
                // Generate new questions for next step
                const newQuestions: RandomVerbRow[] = [];

                for (let j = 0; j < 6; j++) {
                    const selectedVerb = randElement(currentVerbs);
                    const verbData = findVerbByInfinitive(allVerbs, selectedVerb);

                    if (verbData) {
                        const selectedTense = randElement(currentTenses);
                        const pronounIndex = Math.floor(Math.random() * 6);

                        const correctAnswer = verbData.conjugations
                            ? getConjugation(verbData.conjugations, selectedTense, pronounIndex)
                            : '';

                        newQuestions.push({
                            question: {
                                verb: selectedVerb,
                                tense: selectedTense,
                                pronounIndex,
                                correctAnswer
                            },
                            userAnswer: ''
                        });
                    }
                }

                setGameData(newQuestions);
                setGameScore(prev => ({
                    ...prev,
                    currentStep: prev.currentStep + 1,
                }));
            }
        }, 3000);
    }, [gameData, gameScore.currentStep, gameScore.maxStep, isProcessingAnswer, playSuccess, playFailure, currentVerbs, currentTenses, allVerbs]);

    const handlePause = () => {
        setIsPaused(true);
        if (timerRef.current !== null) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }
        pauseTimeRef.current = timeLeft;
    };

    const handleResume = () => {
        setIsPaused(false);
    };

    const handleQuit = () => {
        navigate('/game-room/' + GAME_METADATA['random-verb'].url);
    };

    const handleSubmit = () => {
        checkAnswers();
    };

    const handleKeyPress = (event: React.KeyboardEvent, index: number) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (index < 5) {
                inputRefs.current[index + 1]?.focus();
            } else {
                handleSubmit();
            }
        }
    };

    // Timer logic
    useEffect(() => {
        if (timerRef.current !== null) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }

        if (ongoingGameInfo.maxTime === 0 ||
            gameScore.currentStep >= gameScore.maxStep ||
            showScore ||
            showAnswers ||
            isProcessingAnswer ||
            isPaused) {
            return;
        }

        const initialTime = pauseTimeRef.current > 0 ? pauseTimeRef.current : ongoingGameInfo.maxTime;
        setTimeLeft(initialTime);
        pauseTimeRef.current = 0;

        const startTime = Date.now();
        const targetDuration = initialTime * 1000;

        const updateTimer = () => {
            if (showAnswers || isProcessingAnswer) {
                timerRef.current = null;
                return;
            }

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, targetDuration - elapsed);
            const remainingSeconds = remaining / 1000;

            setTimeLeft(remainingSeconds);

            if (remaining <= 100) {
                timerRef.current = null;
                if (!isProcessingAnswer && !showAnswers && remainingSeconds <= 0.1) {
                    checkAnswers();
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
    }, [gameScore.currentStep, gameScore.maxStep, showScore, ongoingGameInfo.maxTime, showAnswers, isProcessingAnswer, checkAnswers, isPaused]);

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
                onConfigure={() => navigate('/game-room/' + GAME_METADATA["random-verb"].url)}
                errorMessage={errorMessage}
            />
        );
    }

    if (gameData.length === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h5">{t('games.loading')}</Typography>
            </Container>
        );
    }

    const currentQuestions = gameData.slice(0, 6);

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
                    radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
                `,
                zIndex: 0
            }} />

            <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
                {/* Pause Overlay */}
                <PauseOverlay isPaused={isPaused} onResume={handleResume} />

                {/* Game Header Component */}
                <Box style={{ filter: isPaused ? 'blur(20px)' : 'none', pointerEvents: isPaused ? 'none' : 'auto' }}>
                    <GameHeader
                        currentStep={gameScore.currentStep}
                        maxStep={gameScore.maxStep}
                        score={gameScore.score}
                        timeLeft={timeLeft}
                        maxTime={ongoingGameInfo.maxTime}
                        showTimer={ongoingGameInfo.maxTime > 0}
                        gradientStart="#8b5cf6"
                        gradientEnd="#7c3aed"
                        onPause={handlePause}
                        onQuit={handleQuit}
                    />
                </Box>

                {/* Game Title */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    style={{ filter: isPaused ? 'blur(20px)' : 'none', pointerEvents: isPaused ? 'none' : 'auto' }}
                >
                    <Card sx={{
                        mb: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '2px solid',
                        borderColor: '#8b5cf6'
                    }}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent'
                                }}
                            >
                                🎲 {t('games.random-verb.title')}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#64748b', mt: 1 }}>
                                {t('games.random-verb.instruction')}
                            </Typography>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Conjugation Questions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card sx={{
                        mb: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Grid container spacing={3}>
                                {currentQuestions.map((row, index) => {
                                    const question = row.question;
                                    const pronoun = getPronoun(question.pronounIndex);

                                    return (
                                        <Grid item xs={12} key={index}>
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: 0.5 + (index * 0.1)
                                                }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    p: 2,
                                                    borderRadius: 2,
                                                    backgroundColor: showAnswers
                                                        ? (correctnessStatus[index] === true ? '#e8f5e8' : '#ffeaea')
                                                        : '#f8fafc'
                                                }}>
                                                    <Typography
                                                        sx={{
                                                            minWidth: 120,
                                                            fontWeight: 'bold',
                                                            color: '#334155'
                                                        }}
                                                    >
                                                        {pronoun}
                                                    </Typography>
                                                    <Chip
                                                        label={question.verb}
                                                        sx={{
                                                            minWidth: 100,
                                                            fontWeight: 'bold',
                                                            backgroundColor: '#8b5cf6',
                                                            color: 'white'
                                                        }}
                                                    />
                                                    <Chip
                                                        label={TENSE_KEY_TO_DISPLAY_NAMES[question.tense] || question.tense}
                                                        sx={{
                                                            minWidth: 150,
                                                            fontWeight: 'bold',
                                                            backgroundColor: '#6366f1',
                                                            color: 'white'
                                                        }}
                                                    />
                                                    <TextField
                                                        inputRef={(el) => { inputRefs.current[index] = el; }}
                                                        defaultValue=""
                                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                                        disabled={showAnswers || isProcessingAnswer}
                                                        error={showAnswers && correctnessStatus[index] === false}
                                                        sx={{
                                                            flexGrow: 1,
                                                            '& .MuiOutlinedInput-root': {
                                                                backgroundColor: 'white',
                                                                '&:hover fieldset': {
                                                                    borderColor: '#8b5cf6',
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: '#8b5cf6',
                                                                }
                                                            }
                                                        }}
                                                        placeholder={t('games.random-verb.placeholder')}
                                                    />
                                                    {showAnswers && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            {correctnessStatus[index] === true ? (
                                                                <CheckCircle sx={{ color: '#4caf50', fontSize: 32 }} />
                                                            ) : (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                                                        ❌ {question.correctAnswer}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </Box>
                                            </motion.div>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Submit Button */}
                {!showAnswers && !isProcessingAnswer && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1 }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                size="large"
                                sx={{
                                    minWidth: 200,
                                    minHeight: 60,
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                {t('games.common.checkAnswers')}
                            </Button>
                        </Box>
                    </motion.div>
                )}

                {/* Feedback */}
                {showAnswers && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            {correctnessStatus.every(status => status === true) ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                                >
                                    <Typography
                                        variant="h4"
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
                                        🎉 {t('games.common.perfect')} <TrendingUp sx={{ color: '#4caf50' }} />
                                    </Typography>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                                >
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#f59e0b',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        💡 {t('games.common.goodTry')}
                                    </Typography>
                                </motion.div>
                            )}
                        </Box>
                    </motion.div>
                )}

                {/* Score Dialog */}
                <GameScoreDialog
                    open={showScore}
                    onClose={handleClose}
                    score={gameScore.score}
                    maxScore={gameScore.maxStep * 600}
                    correctAnswers={Math.floor(gameScore.score / 100)}
                    totalQuestions={gameScore.maxStep * 6}
                    onPlayAgain={handlePlayAgain}
                />
            </Container>
        </Box>
    );
};

export default RandomVerb;
