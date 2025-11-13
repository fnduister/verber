import { CheckCircle } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Stack,
    TextField,
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
import { GAME_METADATA } from '../../../constants';
import { useAudio } from '../../../hooks/useAudio';
import { fetchVerbs } from '../../../store/slices/verbSlice';
import { AppDispatch, RootState } from '../../../store/store';
import { randElement } from '../../../utils/gameUtils';
import { findVerbByInfinitive } from '../../../utils/tenseUtils';

/**
 * TemplateGame Component
 * 
 * This is a template for creating new games with all the standard functionality:
 * - Timer with pause/resume
 * - Score tracking
 * - Game header with progress
 * - Configuration from GameRoom
 * - Error handling
 * - Audio feedback
 * 
 * To create a new game:
 * 1. Copy this file and rename it
 * 2. Update the game logic in initializeGame()
 * 3. Update the game UI in the render section
 * 4. Add translations for game-specific text
 * 5. Register the game in GAME_METADATA constant
 */

// Define your game-specific question/data structure
interface GameQuestion {
    // Example: verb to conjugate, sentence to complete, etc.
    verb: string;
    tense: string;
    pronoun: string;
    correctAnswer: string;
}

interface GameScore {
    currentStep: number;
    score: number;
    maxScore: number;
    maxStep: number;
}

const TemplateGame: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    const { playSuccess, playFailure } = useAudio();
    
    // Get game configuration from Redux store (set in GameRoom)
    const currentVerbs = useSelector((state: RootState) => state.game.currentVerbs);
    const currentTenses = useSelector((state: RootState) => state.game.currentTenses);
    const allVerbs = useSelector((state: RootState) => state.verb.verbs);
    const ongoingGameInfo = useSelector((state: RootState) => state.game.ongoingGameInfo);
    
    // Game state
    const [gameData, setGameData] = useState<GameQuestion[]>([]);
    const [gameScore, setGameScore] = useState<GameScore>({
        currentStep: 0,
        score: 0,
        maxScore: 0,
        maxStep: ongoingGameInfo.maxStep,
    });
    const [showScore, setShowScore] = useState(false);
    const [timeLeft, setTimeLeft] = useState(ongoingGameInfo.maxTime);
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    // Refs for managing timer and user input
    const timerRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const userAnswerRef = useRef<string>('');
    const pauseTimeRef = useRef<number>(0);

    /**
     * Initialize game data
     * This is where you generate questions/challenges based on the configuration
     */
    const initializeGame = useCallback(() => {
        setHasError(false);
        setErrorMessage(null);
        const maxSteps = ongoingGameInfo.maxStep;

        try {
            // Validate configuration
            if (currentVerbs.length === 0) {
                throw new Error(t('games.error.noVerbsSelected'));
            }

            if (currentTenses.length === 0) {
                throw new Error(t('games.error.noTensesSelected'));
            }

            // Generate game questions
            const questions: GameQuestion[] = [];
            const verbPool = currentVerbs.map(v => v.toLowerCase());
            const pronouns = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'];
            
            for (let i = 0; i < maxSteps; i++) {
                const selectedVerb = randElement(verbPool);
                const selectedTense = randElement(currentTenses);
                const selectedPronoun = randElement(pronouns);
                
                const verbData = findVerbByInfinitive(allVerbs, selectedVerb);
                
                if (!verbData || !verbData.conjugations) {
                    throw new Error(t('games.error.verbDataMissing', { verb: selectedVerb }));
                }
                
                // TODO: Get the correct conjugation based on pronoun and tense
                // This is just a placeholder
                const correctAnswer = "placeholder";
                
                questions.push({
                    verb: selectedVerb,
                    tense: selectedTense,
                    pronoun: selectedPronoun,
                    correctAnswer: correctAnswer
                });
            }

            if (questions.length === 0) {
                throw new Error(t('games.error.noData'));
            }

            setGameData(questions);
            setGameScore({
                currentStep: 0,
                score: 0,
                maxScore: questions.length * 100,
                maxStep: questions.length
            });
            setTimeLeft(ongoingGameInfo.maxTime);
            setUserAnswer('');
            userAnswerRef.current = '';
            setShowAnswer(false);
            setIsCorrect(null);
        } catch (err) {
            setHasError(true);
            setErrorMessage(String(err));
            return;
        }
    }, [currentVerbs, currentTenses, allVerbs, ongoingGameInfo.maxTime, ongoingGameInfo.maxStep, t]);

    // Fetch verbs if not loaded
    useEffect(() => {
        if (allVerbs.length === 0) {
            dispatch(fetchVerbs());
        }
    }, [dispatch, allVerbs.length]);

    // Initialize game when verbs are loaded
    useEffect(() => {
        if (currentVerbs.length === 0) {
            navigate('/games');
            return;
        }
        
        if (allVerbs.length > 0 && gameData.length === 0) {
            initializeGame();
        }
    }, [currentVerbs, allVerbs.length, gameData.length, navigate, initializeGame]);

    // Auto-focus input when showing new question
    useEffect(() => {
        if (!showAnswer && !showScore && inputRef.current) {
            inputRef.current.focus();
        }
    }, [gameScore.currentStep, showAnswer, showScore]);

    // Timer management
    useEffect(() => {
        if (showScore || isPaused || hasError) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    
                    // Timer expired - check current answer
                    const currentQuestion = gameData[gameScore.currentStep];
                    if (currentQuestion) {
                        const answer = userAnswerRef.current.trim();
                        const correct = answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
                        
                        setIsCorrect(correct);
                        setShowAnswer(true);
                        setIsProcessingAnswer(false);
                        
                        if (correct) {
                            playSuccess();
                        } else {
                            playFailure();
                        }
                    }
                    
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [showScore, isPaused, hasError, gameData, gameScore.currentStep, playSuccess, playFailure]);

    /**
     * Handle answer checking
     */
    const checkAnswer = () => {
        if (isProcessingAnswer || showAnswer) return;
        
        setIsProcessingAnswer(true);
        const currentQuestion = gameData[gameScore.currentStep];
        const answer = userAnswer.trim();
        
        // Compare answer (implement your comparison logic here)
        const correct = answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        
        setIsCorrect(correct);
        setShowAnswer(true);
        
        if (correct) {
            playSuccess();
            const earnedPoints = Math.ceil((timeLeft / ongoingGameInfo.maxTime) * 100);
            setGameScore(prev => ({
                ...prev,
                score: prev.score + earnedPoints
            }));
        } else {
            playFailure();
        }
        
        setIsProcessingAnswer(false);
    };

    /**
     * Handle moving to next question
     */
    const handleNext = () => {
        const nextStep = gameScore.currentStep + 1;
        
        if (nextStep >= gameScore.maxStep) {
            // Game finished
            setShowScore(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        } else {
            // Move to next question
            setGameScore(prev => ({ ...prev, currentStep: nextStep }));
            setUserAnswer('');
            userAnswerRef.current = '';
            setShowAnswer(false);
            setIsCorrect(null);
            setTimeLeft(ongoingGameInfo.maxTime);
        }
    };

    /**
     * Handle pause/resume
     */
    const handlePause = () => {
        setIsPaused(true);
        pauseTimeRef.current = timeLeft;
    };

    const handleResume = () => {
        setIsPaused(false);
        setTimeLeft(pauseTimeRef.current);
    };

    /**
     * Handle game exit
     */
    const handleQuit = () => {
        navigate('/games');
    };

    /**
     * Handle play again
     */
    const handlePlayAgain = () => {
        setShowScore(false);
        initializeGame();
    };

    // Show error screen if configuration is invalid
    if (hasError) {
        return (
            <GameErrorDisplay
                hasValidConfig={false}
                errorMessage={errorMessage}
                onRetry={initializeGame}
            />
        );
    }

    // Don't render until game is initialized
    if (gameData.length === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h6" align="center">
                    {t('games.loading')}
                </Typography>
            </Container>
        );
    }

    const currentQuestion = gameData[gameScore.currentStep];
    const gameName = GAME_METADATA.template?.title || 'Template Game'; // Update with your game name

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
        }}>
            {/* Pause Overlay */}
            <PauseOverlay
                isPaused={isPaused}
                onResume={handleResume}
            />

            {/* Game Header */}
            <GameHeader
                currentStep={gameScore.currentStep}
                maxStep={gameScore.maxStep}
                score={gameScore.score}
                maxTime={ongoingGameInfo.maxTime}
                timeLeft={timeLeft}
                showTimer={true}
                onPause={handlePause}
                onQuit={handleQuit}
            />

            {/* Main Game Content */}
            <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card
                        sx={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            {/* Question Display */}
                            <Stack spacing={3}>
                                <Typography variant="h5" align="center" fontWeight="bold">
                                    {/* Your question prompt here */}
                                    Conjugate "{currentQuestion.verb}" in {currentQuestion.tense} for {currentQuestion.pronoun}
                                </Typography>

                                {/* Answer Input */}
                                {!showAnswer && (
                                    <TextField
                                        fullWidth
                                        inputRef={inputRef}
                                        value={userAnswer}
                                        onChange={(e) => {
                                            setUserAnswer(e.target.value);
                                            userAnswerRef.current = e.target.value;
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !isProcessingAnswer) {
                                                checkAnswer();
                                            }
                                        }}
                                        placeholder={t('games.enterAnswer')}
                                        disabled={isProcessingAnswer}
                                        autoComplete="off"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                    />
                                )}

                                {/* Answer Review */}
                                {showAnswer && (
                                    <Box>
                                        <Stack spacing={2}>
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    bgcolor: isCorrect ? 'success.light' : 'error.light',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                <CheckCircle color={isCorrect ? 'success' : 'error'} />
                                                <Typography variant="h6" fontWeight="bold">
                                                    {isCorrect ? t('games.correct') : t('games.incorrect')}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {t('games.yourAnswer')}:
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold" color={isCorrect ? 'success.main' : 'error.main'}>
                                                    {userAnswer || t('games.noAnswer')}
                                                </Typography>
                                            </Box>

                                            {!isCorrect && (
                                                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('games.correctAnswer')}:
                                                    </Typography>
                                                    <Typography variant="h6" fontWeight="bold" color="success.main">
                                                        {currentQuestion.correctAnswer}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Box>
                                )}

                                {/* Action Buttons */}
                                <Stack direction="row" spacing={2} justifyContent="center">
                                    {!showAnswer ? (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={checkAnswer}
                                            disabled={!userAnswer.trim() || isProcessingAnswer}
                                            sx={{
                                                minWidth: 200,
                                                py: 1.5,
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {t('games.checkAnswer')}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={handleNext}
                                            sx={{
                                                minWidth: 200,
                                                py: 1.5,
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {gameScore.currentStep + 1 >= gameScore.maxStep
                                                ? t('games.finish')
                                                : t('games.next')}
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>

            {/* Score Dialog */}
            {showScore && (
                <GameScoreDialog
                    open={showScore}
                    onClose={() => navigate('/games')}
                    score={gameScore.score}
                    maxScore={gameScore.maxScore}
                    correctAnswers={gameScore.score / 100} // Simplified calculation
                    totalQuestions={gameScore.maxStep}
                    onPlayAgain={handlePlayAgain}
                    gameName={gameName}
                />
            )}
        </Box>
    );
};

export default TemplateGame;
