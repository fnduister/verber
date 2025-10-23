import { Cancel, CheckCircle } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GameErrorDisplay from '../../../components/GameErrorDisplay';
import GameHeader from '../../../components/GameHeader';
import GameScoreDialog from '../../../components/GameScoreDialog';
import { AVAILABLE_TENSES, TENSE_KEY_TO_DISPLAY_NAMES } from '../../../constants';
import { GAME_METADATA,  } from '../../../constants/gameConstants';
import { useAudio } from '../../../hooks/useAudio';
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    // Audio feedback
    const { playSuccess, playFailure } = useAudio();
    
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
    const MAX_TRIES = 10;

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
        setErrorMessage(null);
        const steps: FindErrorGameData[] = [];
        const maxSteps = ongoingGameInfo.maxStep;

        try{
            for (let i = 0; i < maxSteps; i++) {
                const stepTense = randElement(currentTenses);
                // Get error word (wrong tense)
                const stepVerb = randElement(currentVerbs);
                const stepVerbData = findVerbByInfinitive(allVerbs, stepVerb);
                
                if (!stepVerbData) continue;
                
                let tries = 0;
                let errorConjugation = '';
                let errorWord = '';
                while(errorConjugation === '' && tries < MAX_TRIES){
                    // Create ERROR: Use wrong tense for the selected verb
                    const pronounIndex = Math.floor(Math.random() * 6);
                    const wrongTense = randElement(AVAILABLE_TENSES.filter(t => t !== stepTense));
                    errorConjugation = stepVerbData.conjugations ? getConjugation(stepVerbData.conjugations, wrongTense, pronounIndex) : '';
                    errorWord = getPronoun(pronounIndex) + ' ' + errorConjugation;
                    tries++;
                }

                if (errorConjugation === '') {
                    throw new Error(t('games.error.failedToGenerate'));
                }

                
                // Get correct words (correct tense)
                const correctWords: string[] = [];
                
                tries = 0;
                while(correctWords.length < 3 && tries < MAX_TRIES){
                    const correctVerb = randElement(currentVerbs);
                    const correctVerbData = findVerbByInfinitive(allVerbs, correctVerb);
                    if (!correctVerbData) {
                        tries++;
                        continue;
                    }

                    const pIndex = Math.floor(Math.random() * 6);
                    const correctConjugation = correctVerbData.conjugations ? getConjugation(correctVerbData.conjugations, stepTense, pIndex) : '';
                    if (correctConjugation === '') {
                        tries++;
                        continue;
                    }

                    const word = getPronoun(pIndex) + ' ' + correctConjugation;
                    if (correctWords.includes(word) || word === errorWord){
                        tries++;
                        continue;
                    }

                    correctWords.push(word);
                }

                if(correctWords.length < 3){
                    throw new Error(t('games.error.failedToGenerate') + "\n" + t('games.error.notEnougthCorrectWords') + ` : ${stepTense})`);
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
        }catch(err){
            console.error("Error initializing game:", err);
            setHasError(true);
            setErrorMessage(t('games.error.unexpected') + "\n" + err);
            return;
        }

        if (steps.length === 0) {
            setHasError(true);
            setErrorMessage(t('games.error.noData'));
            return;
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
            setHasError(true);
            setErrorMessage(t('games.error.invalidConfig'));
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
                <Typography variant="h5">{t('games.loading')}</Typography>
            </Container>
        );
    }

    const currentQuestion = gameData[gameScore.currentStep];
    
    // Additional safety check
    if (!currentQuestion) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h5">{t('games.loading')}</Typography>
            </Container>
        );
    }

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
            {/* Game Header Component */}
            <GameHeader
                currentStep={gameScore.currentStep}
                maxStep={gameScore.maxStep}
                score={gameScore.score}
                timeLeft={timeLeft}
                maxTime={ongoingGameInfo.maxTime}
                showTimer={ongoingGameInfo.maxTime > 0}
            />

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
                            {TENSE_KEY_TO_DISPLAY_NAMES[currentQuestion.stepTense] || currentQuestion.stepTense}
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
                        {t('games.findError.instruction')}
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
                                                {t('games.common.excellent')}
                                            </Typography>
                                        ) : (
                                            <>
                                                <Typography 
                                                    variant="h5" 
                                                    color="error.main" 
                                                    sx={{ fontWeight: 'bold', mb: 2 }}
                                                >
                                                    {t('games.common.incorrect')}
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary">
                                                    {t('games.common.correctAnswerWas')}
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

            {/* Reusable Score Dialog */}
            <GameScoreDialog
                open={showScore}
                onClose={handleClose}
                onPlayAgain={handlePlayAgain}
                score={gameScore.score}
                maxScore={gameScore.maxScore}
                correctAnswers={gameScore.score / 100}
                totalQuestions={gameScore.maxStep}
            />
        </Container>
        </Box>
    );
};

export default FindError;