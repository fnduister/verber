import { Edit, EmojiEvents, Timer, TrendingUp } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Grid, LinearProgress,
    Stack, TextField, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PRONOUNS, TENSE_DISPLAY_NAMES } from '../../../constants/gameConstants';
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
    const [userAnswers, setUserAnswers] = useState<string[]>(Array(6).fill(''));
    const [showAnswers, setShowAnswers] = useState(false);
    const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
    const [correctnessStatus, setCorrectnessStatus] = useState<(boolean | null)[]>(Array(6).fill(null));
    
    const timerRef = useRef<number | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
    const userAnswersRef = useRef<string[]>(Array(6).fill(''));

    const initializeGame = useCallback(() => {
        const steps: WriteMeStepData[] = [];
        const maxSteps = ongoingGameInfo.maxStep;

        for (let i = 0; i < maxSteps; i++) {
            const selectedVerb = randElement(currentVerbs);
            const verbData = findVerbByInfinitive(allVerbs, selectedVerb);
            
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
    }, [gameData, gameScore.currentStep, gameScore.maxStep, isProcessingAnswer]);

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
            isProcessingAnswer) 
        {
            return;
        }

        setTimeLeft(ongoingGameInfo.maxTime);
        
        const startTime = Date.now();
        const targetDuration = ongoingGameInfo.maxTime * 1000;
        
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
    }, [gameScore.currentStep, gameScore.maxStep, showScore, ongoingGameInfo.maxTime, showAnswers, isProcessingAnswer, gameData]);

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
                                    icon={<Edit />} 
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

            {/* Verb and Tense Display */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                key={gameScore.currentStep}
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
                            {TENSE_DISPLAY_NAMES[currentQuestion.tense] || currentQuestion.tense}
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
            <Dialog open={showScore} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Typography variant="h4" textAlign="center">
                        {Math.floor((gameScore.score / (gameScore.maxStep * 100)) * 100) > 70
                            ? '🎉 Excellent !'
                            : Math.floor((gameScore.score / (gameScore.maxStep * 100)) * 100) > 50
                            ? '👍 Bien joué !'
                            : '💪 Continuez à pratiquer !'}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} alignItems="center">
                        <Typography variant="h2" color="primary">
                            {gameScore.score}
                        </Typography>
                        <Typography variant="h6">
                            Score: {Math.floor((gameScore.score / (gameScore.maxStep * 100)) * 100)}%
                        </Typography>
                        <Typography variant="body1">
                            Score total: {gameScore.score} / {gameScore.maxStep * 100}
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button onClick={handlePlayAgain} variant="contained" color="primary" size="large">
                        Rejouer
                    </Button>
                    <Button onClick={handleClose} variant="outlined" size="large">
                        Retour au tableau de bord
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
        </Box>
    );
};

export default WriteMe;
