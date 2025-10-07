import { Cancel, CheckCircle, EmojiEvents, Timer } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TENSE_DISPLAY_NAMES } from '../../../constants/gameConstants';
import { fetchVerbs } from '../../../store/slices/verbSlice';
import { AppDispatch, RootState } from '../../../store/store';
import { getPronoun, randElement, shuffle } from '../../../utils/gameUtils';
import { findVerbByInfinitive, getConjugation } from '../../../utils/tenseUtils';

interface FindErrorGameData {
    error: string;
    visibleWords: string[];
    stepTense: string;
    correctAnswer: string;
}

interface GameScore {
    currentStep: number;
    score: number;
    maxScore: number;
    maxStep: number;
}

const FindError: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    const currentVerbs = useSelector((state: RootState) => state.game.currentVerbs);
    const currentTenses = useSelector((state: RootState) => state.game.currentTenses);
    const allVerbs = useSelector((state: RootState) => state.verb.verbs);
    const ongoingGameInfo = useSelector((state: RootState) => state.game.ongoingGameInfo);
    
    const [gameData, setGameData] = useState<FindErrorGameData[]>([]);
    const [gameScore, setGameScore] = useState<GameScore>({
        currentStep: 0,
        score: 0,
        maxScore: 0,
        maxStep: ongoingGameInfo.maxStep,
    });
    const [showScore, setShowScore] = useState(false);

    const [timeLeft, setTimeLeft] = useState(ongoingGameInfo.maxTime);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [animateBackground, setAnimateBackground] = useState<string>('white');
    const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
    const timerRef = useRef<number | null>(null);

    const initializeGame = useCallback(() => {
        const steps: FindErrorGameData[] = [];
        const maxSteps = ongoingGameInfo.maxStep;

        for (let i = 0; i < maxSteps; i++) {
            const stepTense = randElement(currentTenses);
            
            // Get error word (wrong tense)
            const errorVerb = randElement(currentVerbs);
            const errorVerbData = findVerbByInfinitive(allVerbs, errorVerb);
            
            if (!errorVerbData) continue;

            const pronounIndex = Math.floor(Math.random() * 6);
            
            // Create ERROR: Use wrong tense for the selected verb
            const wrongTenses = currentTenses.filter(t => t !== stepTense);
            const wrongTense = randElement(wrongTenses);
            
            const errorConjugation = errorVerbData.conjugations ? getConjugation(errorVerbData.conjugations, wrongTense, pronounIndex) : '';
            const errorWord = getPronoun(pronounIndex) + ' ' + errorConjugation;
            
            // Get correct words (correct tense)
            const correctWords: string[] = [];
            const maxAttempts = 10; // To avoid infinite loops
            for (let j = 0; j < 3; j++) {
                let attempts = 0;
                let correctConjugation = '';
                let word = '';
                do{
                    const correctVerb = randElement(currentVerbs);
                    const correctVerbData = findVerbByInfinitive(allVerbs, correctVerb);
                    if (correctVerbData) {
                        const pIndex = Math.floor(Math.random() * 6);
                        correctConjugation = correctVerbData.conjugations ? getConjugation(correctVerbData.conjugations, stepTense, pIndex) : '';
                        if (correctConjugation === '') continue; // Avoid infinite loop if no conjugation found

                        word = getPronoun(pIndex) + ' ' + correctConjugation;
                    }
                }while((correctConjugation === '' || correctWords.includes(word) || word === errorWord) && attempts++ < maxAttempts);
                correctWords.push(word);
            }
            if (correctWords.length === 3) {
                const allWords = shuffle([errorWord, ...correctWords]);
                steps.push({
                    error: errorWord,
                    visibleWords: allWords,
                    stepTense: stepTense,
                    correctAnswer: errorWord,
                });
            }
        }

        setGameData(steps);
        setGameScore({
            currentStep: 0,
            score: 0,
            maxScore: steps.length * 100,
            maxStep: steps.length,
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
            navigate('/games/find-error');
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
        
        const correct = answer === currentQuestion.correctAnswer;
        
        setSelectedAnswer(answer);
        setIsCorrect(correct);

        // Visual feedback
        setAnimateBackground(correct ? '#4caf50' : '#f44336');
        setTimeout(() => setAnimateBackground('white'), 1500);

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
    }, [gameData, gameScore.currentStep, gameScore.maxStep, selectedAnswer, isProcessingAnswer]);

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
            isProcessingAnswer) 
        {
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
        initializeGame();
    };

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
            {/* Enhanced Header with Animated Score and Progress */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Card sx={{ 
                    mb: 4, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }}>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmojiEvents sx={{ fontSize: 28 }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    Question {gameScore.currentStep + 1}/{gameScore.maxStep}
                                </Typography>
                            </Box>
                            <motion.div
                                key={gameScore.score}
                                initial={{ scale: 1.2, opacity: 0.8 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Chip 
                                    label={`Score: ${gameScore.score}`}
                                    sx={{ 
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        px: 2,
                                        py: 1
                                    }}
                                />
                            </motion.div>
                        </Stack>
                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={progressPercent} 
                                sx={{ 
                                    height: 12, 
                                    borderRadius: 6,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: '#4caf50',
                                        borderRadius: 6,
                                        boxShadow: '0 2px 8px rgba(76,175,80,0.4)'
                                    }
                                }} 
                            />
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontWeight: 'bold',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                }}
                            >
                                {Math.round(progressPercent)}%
                            </Typography>
                        </Box>
                        {ongoingGameInfo.maxTime > 0 && (
                            <motion.div
                                animate={timePercent < 20 ? { scale: [1, 1.02, 1] } : {}}
                                transition={{ duration: 1, repeat: timePercent < 20 ? Infinity : 0 }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Timer sx={{ fontSize: 20 }} />
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {timeLeft <= 0 ? 0 : Math.ceil(timeLeft)}s restant
                                    </Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={Math.max(0, timePercent)} 
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        transition: 'none',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: timePercent > 50 ? '#4caf50' : timePercent > 20 ? '#ff9800' : '#f44336',
                                            borderRadius: 5,
                                            transition: 'none',
                                            boxShadow: timePercent < 20 ? '0 0 10px rgba(244,67,54,0.6)' : 'none'
                                        }
                                    }}
                                />
                            </motion.div>
                        )}
                </CardContent>
            </Card>
            </motion.div>

            {/* Enhanced Tense Display with Animations */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 6 }}>
                    <motion.div
                        animate={{ 
                            backgroundColor: animateBackground,
                            boxShadow: selectedAnswer !== null 
                                ? (isCorrect 
                                    ? '0 0 30px rgba(76,175,80,0.6)' 
                                    : '0 0 30px rgba(244,67,54,0.6)')
                                : '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                        transition={{ duration: 0.5 }}
                        style={{
                            width: 400,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 24,
                            borderRadius: 16,
                            background: 'linear-gradient(145deg, #f0f4f8, #d6e4ed)',
                            border: '2px solid transparent',
                            backgroundClip: 'padding-box'
                        }}
                    >
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textAlign: 'center'
                            }}
                        >
                            {TENSE_DISPLAY_NAMES[currentQuestion.stepTense] || currentQuestion.stepTense}
                        </Typography>
                    </motion.div>
                </Container>

                {/* Enhanced Instruction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Typography 
                        variant="h4" 
                        textAlign="center" 
                        sx={{ 
                            mb: 6,
                            fontWeight: 'bold',
                            color: 'text.primary',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        🔍 Trouvez l'erreur !
                    </Typography>
                </motion.div>
            </motion.div>

            {/* Answer Options */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="center"
                alignItems="center"
                sx={{ flexWrap: 'wrap', gap: 2 }}
            >
                {currentQuestion.visibleWords.map((word, index) => {
                    let buttonColor = 'secondary';
                    let buttonVariant: 'contained' | 'outlined' = 'contained';
                    
                    if (selectedAnswer !== null) {
                        if (selectedAnswer === word) {
                            // This is the selected answer
                            buttonColor = isCorrect ? 'success' : 'error';
                        } else if (!isCorrect && word === currentQuestion.correctAnswer) {
                            // This is the correct answer when user selected wrong
                            buttonColor = 'success';
                            buttonVariant = 'outlined';
                        }
                    }
                    
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: selectedAnswer === null ? 1.05 : 1 }}
                            whileTap={{ scale: selectedAnswer === null ? 0.95 : 1 }}
                        >
                            <Button
                                onClick={() => handleAnswer(word)}
                                color={buttonColor as any}
                                variant={buttonVariant}
                                disabled={selectedAnswer !== null || isProcessingAnswer}
                                sx={{
                                    minWidth: 240,
                                    minHeight: 120,
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    background: selectedAnswer === null 
                                        ? 'linear-gradient(145deg, #ffffff, #f5f5f5)'
                                        : undefined,
                                    boxShadow: selectedAnswer === null 
                                        ? '0 4px 20px rgba(0,0,0,0.1)'
                                        : undefined,
                                    border: selectedAnswer === null 
                                        ? '2px solid #e0e0e0'
                                        : undefined,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: selectedAnswer === null ? 'translateY(-2px)' : 'none',
                                        boxShadow: selectedAnswer === null 
                                            ? '0 6px 25px rgba(0,0,0,0.15)'
                                            : undefined,
                                        background: selectedAnswer === null
                                            ? 'linear-gradient(145deg, #f8f9fa, #e9ecef)'
                                            : undefined
                                    },
                                    ...(selectedAnswer !== null && !isCorrect && word === currentQuestion.correctAnswer && {
                                        border: '3px solid',
                                        borderColor: 'success.main',
                                        backgroundColor: 'success.light',
                                        color: 'success.contrastText',
                                        boxShadow: '0 0 20px rgba(76,175,80,0.4)',
                                        '&:hover': {
                                            backgroundColor: 'success.light',
                                            transform: 'none'
                                        }
                                    }),
                                    ...(selectedAnswer === word && {
                                        transform: 'scale(0.98)',
                                        boxShadow: isCorrect 
                                            ? '0 0 25px rgba(76,175,80,0.5)'
                                            : '0 0 25px rgba(244,67,54,0.5)'
                                    })
                                }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    {selectedAnswer === word && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {isCorrect ? (
                                                <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
                                            ) : (
                                                <Cancel sx={{ color: 'error.main', fontSize: 28 }} />
                                            )}
                                        </motion.div>
                                    )}
                                    <span>{word}</span>
                                </Box>
                            </Button>
                        </motion.div>
                    );
                })}
            </Stack>

            {/* Enhanced Animated Feedback */}
            <AnimatePresence>
                {selectedAnswer !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.8 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                    >
                        <Card sx={{ 
                            mt: 4, 
                            mx: 'auto', 
                            maxWidth: 600,
                            background: isCorrect 
                                ? 'linear-gradient(135deg, #e8f5e8, #c8e6c9)'
                                : 'linear-gradient(135deg, #ffebee, #ffcdd2)',
                            border: `2px solid ${isCorrect ? '#4caf50' : '#f44336'}`,
                            boxShadow: `0 8px 32px ${isCorrect ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)'}`,
                            borderRadius: 3
                        }}>
                            <CardContent sx={{ py: 3 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ duration: 0.6, type: "spring" }}
                                    >
                                        {isCorrect ? (
                                            <CheckCircle sx={{ color: 'success.main', fontSize: 48, mb: 2 }} />
                                        ) : (
                                            <Cancel sx={{ color: 'error.main', fontSize: 48, mb: 2 }} />
                                        )}
                                    </motion.div>
                                    
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        {isCorrect ? (
                                            <Typography 
                                                variant="h5" 
                                                color="success.main" 
                                                sx={{ fontWeight: 'bold', mb: 1 }}
                                            >
                                                🎉 Excellent ! Bonne réponse !
                                            </Typography>
                                        ) : (
                                            <>
                                                <Typography 
                                                    variant="h5" 
                                                    color="error.main" 
                                                    sx={{ fontWeight: 'bold', mb: 2 }}
                                                >
                                                    😔 Incorrect !
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary">
                                                    La bonne réponse était :
                                                </Typography>
                                                <Chip 
                                                    label={currentQuestion.correctAnswer}
                                                    color="success"
                                                    sx={{ mt: 1, fontSize: '1rem', fontWeight: 'bold' }}
                                                />
                                            </>
                                        )}
                                    </motion.div>
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enhanced Score Dialog with Animations */}
            <Dialog 
                open={showScore} 
                onClose={handleClose} 
                maxWidth="sm" 
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    }
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                >
                    <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <Typography 
                                variant="h3" 
                                sx={{ 
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                {Math.floor((gameScore.score / gameScore.maxScore) * 100) > 50
                                    ? '🎉 Fantastique !'
                                    : '💪 Bon effort !'}
                            </Typography>
                        </motion.div>
                    </DialogTitle>
                    
                    <DialogContent sx={{ py: 4 }}>
                        <Stack spacing={4} alignItems="center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
                            >
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 10px 30px rgba(102,126,234,0.3)'
                                }}>
                                    <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {gameScore.score}
                                    </Typography>
                                </Box>
                            </motion.div>
                            
                            <Stack spacing={2} alignItems="center">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                >
                                    <Chip 
                                        label={`${Math.floor((gameScore.score / gameScore.maxScore) * 100)}% de réussite`}
                                        color="primary"
                                        sx={{ 
                                            fontSize: '1.2rem', 
                                            fontWeight: 'bold',
                                            px: 3,
                                            py: 2,
                                            height: 'auto'
                                        }}
                                    />
                                </motion.div>
                                
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                >
                                    <Typography variant="h6" color="text.secondary" textAlign="center">
                                        Questions correctes: {gameScore.score / 100} / {gameScore.maxStep}
                                    </Typography>
                                </motion.div>
                            </Stack>
                        </Stack>
                    </DialogContent>
                    
                    <DialogActions sx={{ justifyContent: 'center', pb: 4, gap: 2 }}>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.5 }}
                        >
                            <Button 
                                onClick={handlePlayAgain} 
                                variant="contained" 
                                size="large"
                                sx={{
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(102,126,234,0.4)'
                                    }
                                }}
                            >
                                🔄 Rejouer
                            </Button>
                        </motion.div>
                        
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                        >
                            <Button 
                                onClick={handleClose} 
                                variant="outlined" 
                                size="large"
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2,
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                🏠 Tableau de bord
                            </Button>
                        </motion.div>
                    </DialogActions>
                </motion.div>
            </Dialog>
        </Container>
        </Box>
    );
};

export default FindError;