import { Edit, EmojiEvents, Timer, TrendingUp } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid, LinearProgress,
    Stack, TextField, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GameErrorDisplay from '../../../components/GameErrorDisplay';
import GameScoreDialog from '../../../components/GameScoreDialog';
import GameHeader from '../../../components/GameHeader';
import PauseOverlay from '../../../components/PauseOverlay';
import { TENSE_KEY_TO_DISPLAY_NAMES } from '../../../constants';
import { GAME_METADATA, PRONOUNS } from '../../../constants/gameConstants';
import { useAudio } from '../../../hooks/useAudio';
import { fetchVerbs } from '../../../store/slices/verbSlice';
import { AppDispatch, RootState } from '../../../store/store';
import { randElement } from '../../../utils/gameUtils';
import { findVerbByInfinitive, getConjugation, normalizeString } from '../../../utils/tenseUtils';

interface WriteMeStepData {
    verb: string;
    tense: string;
    correctAnswers: string[];
    userAnswers: string[];
}

interface WriteMeGameInfo {
    currentStep: number;
    maxStep: number;
    score: number;
    maxTime: number;
    duration: number;
}

const WriteMe: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    const currentVerbs = useSelector((state: RootState) => state.game.currentVerbs);
    const currentTenses = useSelector((state: RootState) => state.game.currentTenses);
    const allVerbs = useSelector((state: RootState) => state.verb.verbs);
    const ongoingGameInfo = useSelector((state: RootState) => state.game.ongoingGameInfo);
    
    // Audio feedback
    const { playSuccess, playFailure } = useAudio();
    const { t } = useTranslation();
    
    const [gameData, setGameData] = useState<WriteMeStepData[]>([]);
    const [gameScore, setGameScore] = useState<WriteMeGameInfo>({
        currentStep: 0,
        score: 0,
        maxTime: ongoingGameInfo.maxTime,
        maxStep: ongoingGameInfo.maxStep,
        duration: 0
    });
    const [showScore, setShowScore] = useState(false);
    const [timeLeft, setTimeLeft] = useState(ongoingGameInfo.maxTime);
    const [isPaused, setIsPaused] = useState(false);
    const [userAnswers, setUserAnswers] = useState<string[]>(Array(6).fill(''));
    const [showAnswers, setShowAnswers] = useState(false);
    const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
    const [correctnessStatus, setCorrectnessStatus] = useState<(boolean | null)[]>(Array(6).fill(null));
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const timerRef = useRef<number | null>(null);
    const pauseTimeRef = useRef<number>(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
    const userAnswersRef = useRef<string[]>(Array(6).fill(''));

    const initializeGame = useCallback(() => {
        setHasError(false);
        const steps: WriteMeStepData[] = [];
        const maxSteps = ongoingGameInfo.maxStep;

        for (let i = 0; i < maxSteps; i++) {
            const selectedVerb = randElement(currentVerbs);
            const verbData = findVerbByInfinitive(allVerbs, selectedVerb);

            if (!verbData) {
                setErrorMessage(t('game.error.verbDataMissing', { verb: selectedVerb }));
                console.log('Race - Found verb data:', verbData ? verbData.infinitive : 'NOT FOUND');
            }
            
            if (verbData && verbData.conjugations) {
                const selectedTense = randElement(currentTenses);
                const correctAnswers: string[] = [];
                
                // Get all 6 conjugations for this tense
                for (let pronounIndex = 0; pronounIndex < 6; pronounIndex++) {
                    const conjugation = getConjugation(verbData.conjugations, selectedTense, pronounIndex);
                    correctAnswers.push(conjugation || '');
                }
                
                steps.push({
                    verb: selectedVerb,
                    tense: selectedTense,
                    correctAnswers,
                    userAnswers: Array(6).fill('')
                });
            }
        }

        if (steps.length === 0) {
            console.error('WriteMe - Failed to generate game data');
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
        setUserAnswers(Array(6).fill(''));
        setShowAnswers(false);
        setCorrectnessStatus(Array(6).fill(null));
        userAnswersRef.current = Array(6).fill(''); // Keep ref in sync
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
            navigate('/games');
            return;
        }
        initializeGame();
    }, [currentVerbs.length, currentTenses.length, initializeGame, navigate]);

    const handleAnswerChange = (index: number, value: string) => {
        if (showAnswers || isProcessingAnswer) return;
        
        const newAnswers = [...userAnswers];
        newAnswers[index] = value;
        setUserAnswers(newAnswers);
        userAnswersRef.current = newAnswers; // Keep ref in sync
    };

    const checkAnswers = useCallback(() => {
        if (isProcessingAnswer || gameData.length === 0) return;

        setIsProcessingAnswer(true);

        // Stop the timer
        if (timerRef.current !== null) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }

        const currentQuestion = gameData[gameScore.currentStep];
        if (!currentQuestion) {
            setIsProcessingAnswer(false);
            return;
        }

        // Check each answer
        const correctness: (boolean | null)[] = [];
        let correctCount = 0;
        
        for (let i = 0; i < 6; i++) {
            const userAnswer = normalizeString(userAnswersRef.current[i].trim().toLowerCase());
            const correctAnswer = normalizeString(currentQuestion.correctAnswers[i].toLowerCase());
            const isCorrect = userAnswer === correctAnswer;
            correctness[i] = isCorrect;
            if (isCorrect) correctCount++;
        }

        setCorrectnessStatus(correctness);
        setShowAnswers(true);

        // Calculate score based on correct answers (partial credit)
        const scoreIncrease = Math.floor((correctCount / 6) * 100);
        setGameScore(prev => ({
            ...prev,
            score: prev.score + scoreIncrease
        }));

        // Play audio feedback based on performance
        const isNextLastStep = gameScore.currentStep + 1 >= gameScore.maxStep;
        console.log('🎮 WriteMe: Playing audio feedback', { correctCount, isSuccess: correctCount >= 4, isNextLastStep });
        if (correctCount >= 4) { // 4+ correct answers = success
            playSuccess(isNextLastStep);
        } else {
            playFailure(isNextLastStep);
        }

        // Move to next question after delay
        setTimeout(() => {
            setShowAnswers(false);
            setIsProcessingAnswer(false);
            setUserAnswers(Array(6).fill(''));
            setCorrectnessStatus(Array(6).fill(null));
            userAnswersRef.current = Array(6).fill(''); // Keep ref in sync
            
            if (gameScore.currentStep + 1 >= gameScore.maxStep) {
                setShowScore(true);
            } else {
                setGameScore(prev => ({
                    ...prev,
                    currentStep: prev.currentStep + 1,
                }));
            }
        }, 3000);
    }, [gameData, gameScore.currentStep, gameScore.maxStep, isProcessingAnswer, playSuccess, playFailure]);

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
        navigate('/game-room/' + GAME_METADATA['write-me'].url);
    };

    const handleSubmit = () => {
        checkAnswers();
    };

    const handleKeyPress = (event: React.KeyboardEvent, index: number) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (index < 5) {
                // Move to next input
                inputRefs.current[index + 1]?.focus();
            } else {
                // Submit if on last input
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
            isPaused) 
        {
            return;
        }

        const initialTime = pauseTimeRef.current > 0 ? pauseTimeRef.current : ongoingGameInfo.maxTime;
        setTimeLeft(initialTime);
        pauseTimeRef.current = 0;
        
        const startTime = Date.now();
        const targetDuration = initialTime * 1000;
        
        const updateTimer = () => {
            if (showAnswers || isProcessingAnswer || isPaused) {
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
                    // Call checkAnswers directly without depending on the callback
                    setIsProcessingAnswer(true);

                    // Stop the timer
                    if (timerRef.current !== null) {
                        cancelAnimationFrame(timerRef.current);
                        timerRef.current = null;
                    }

                    const currentQuestion = gameData[gameScore.currentStep];
                    if (!currentQuestion) {
                        setIsProcessingAnswer(false);
                        return;
                    }

                    // Check each answer using current userAnswers state
                    const correctness: (boolean | null)[] = [];
                    let correctCount = 0;
                    
                    for (let i = 0; i < 6; i++) {
                        const userAnswer = normalizeString(userAnswersRef.current[i].trim().toLowerCase());
                        const correctAnswer = normalizeString(currentQuestion.correctAnswers[i].toLowerCase());
                        const isCorrect = userAnswer === correctAnswer;
                        correctness[i] = isCorrect;
                        if (isCorrect) correctCount++;
                    }

                    setCorrectnessStatus(correctness);
                    setShowAnswers(true);

                    // Calculate score based on correct answers (partial credit)
                    const scoreIncrease = Math.floor((correctCount / 6) * 100);
                    setGameScore(prev => ({
                        ...prev,
                        score: prev.score + scoreIncrease
                    }));

                    // Play audio feedback for timer expiry
                    const isNextLastStep = gameScore.currentStep + 1 >= gameScore.maxStep;
                    console.log('🎮 WriteMe (timer): Playing audio feedback', { correctCount, isSuccess: correctCount >= 4, isNextLastStep });
                    if (correctCount >= 4) {
                        playSuccess(isNextLastStep);
                    } else {
                        playFailure(isNextLastStep);
                    }

                    // Move to next question after delay
                    setTimeout(() => {
                        setShowAnswers(false);
                        setIsProcessingAnswer(false);
                        setUserAnswers(Array(6).fill(''));
                        setCorrectnessStatus(Array(6).fill(null));
                        userAnswersRef.current = Array(6).fill(''); // Keep ref in sync
                        
                        if (gameScore.currentStep + 1 >= gameScore.maxStep) {
                            setShowScore(true);
                        } else {
                            setGameScore(prev => ({
                                ...prev,
                                currentStep: prev.currentStep + 1,
                            }));
                        }
                    }, 3000);
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
    }, [gameScore.currentStep, gameScore.maxStep, showScore, ongoingGameInfo.maxTime, showAnswers, isProcessingAnswer, isPaused, gameData, playSuccess, playFailure]);

    const handleClose = () => {
        navigate('/dashboard');
    };

    const handlePlayAgain = () => {
        setShowScore(false);
        setHasError(false);
        initializeGame();
    };

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
    
    if (!currentQuestion) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h5">Chargement du jeu...</Typography>
            </Container>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            position: 'relative'
        }}>
            <PauseOverlay isPaused={isPaused} onResume={handleResume} />
            
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
            {/* GameHeader */}
            <GameHeader
                currentStep={gameScore.currentStep}
                maxStep={gameScore.maxStep}
                score={gameScore.score}
                timeLeft={timeLeft}
                maxTime={ongoingGameInfo.maxTime}
                showTimer={ongoingGameInfo.maxTime > 0}
                gradientStart="#667eea"
                gradientEnd="#764ba2"
                onPause={handlePause}
                onQuit={handleQuit}
            />

            {/* Verb and Tense Display */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                key={gameScore.currentStep}
                style={{ filter: isPaused ? 'blur(20px)' : 'none', pointerEvents: isPaused ? 'none' : 'auto' }}
            >
                <Card sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '2px solid',
                    borderColor: 'primary.light'
                }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Typography 
                            variant="h2" 
                            sx={{ 
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                mb: 2
                            }}
                        >
                            {currentQuestion.verb}
                        </Typography>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 'bold',
                                color: '#1f2937'
                            }}
                        >
                            {TENSE_KEY_TO_DISPLAY_NAMES[currentQuestion.tense] || currentQuestion.tense}
                        </Typography>
                    </CardContent>
                </Card>
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
                    ✏️ Conjuguez le verbe pour chaque personne
                </Typography>
            </motion.div>

            {/* Conjugation Inputs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <Card sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <Grid container spacing={3}>
                            {PRONOUNS.map((pronoun, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ 
                                            duration: 0.4, 
                                            delay: 0.7 + (index * 0.1)
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    minWidth: 80,
                                                    fontWeight: 'bold',
                                                    color: '#4f46e5'
                                                }}
                                            >
                                                {pronoun}
                                            </Typography>
                                            <TextField
                                                inputRef={(el) => {inputRefs.current[index] = el;}}
                                                value={showAnswers ? currentQuestion.correctAnswers[index] : userAnswers[index]}
                                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                onKeyPress={(e) => handleKeyPress(e, index)}
                                                disabled={showAnswers || isProcessingAnswer}
                                                error={showAnswers && correctnessStatus[index] === false}
                                                sx={{
                                                    flexGrow: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        backgroundColor: showAnswers 
                                                            ? (correctnessStatus[index] === true ? '#e8f5e8' : '#ffeaea')
                                                            : 'white',
                                                        '&:hover fieldset': {
                                                            borderColor: '#667eea',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#667eea',
                                                        }
                                                    }
                                                }}
                                                placeholder="Conjugaison..."
                                            />
                                            {showAnswers && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            color: correctnessStatus[index] ? '#4caf50' : '#f44336',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {correctnessStatus[index] ? '✅' : '❌'}
                                                    </Typography>
                                                </motion.div>
                                            )}
                                        </Box>
                                    </motion.div>
                                </Grid>
                            ))}
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
                    style={{ filter: isPaused ? 'blur(20px)' : 'none', pointerEvents: isPaused ? 'none' : 'auto' }}
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
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Vérifier mes réponses
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
                                    🎉 Parfait ! Toutes les conjugaisons sont correctes ! <TrendingUp sx={{ color: '#4caf50' }} />
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
                                    💡 Bien essayé ! Voici les bonnes réponses :
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
                maxScore={gameScore.maxStep * 100}
                correctAnswers={Math.floor(gameScore.score / 100)}
                totalQuestions={gameScore.maxStep}
                onPlayAgain={handlePlayAgain}
            />
        </Container>
        </Box>
    );
};

export default WriteMe;
