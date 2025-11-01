import { CheckCircle, Edit } from '@mui/icons-material';
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
import { findVerbByInfinitive, normalizeString } from '../../../utils/tenseUtils';

type ParticipeType = 'past' | 'present';

interface ParticipeQuestion {
    verb: string;
    correctAnswer: string;
    type: ParticipeType;
}

interface GameScore {
    currentStep: number;
    score: number;
    maxScore: number;
    maxStep: number;
}

const Participe: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    const { playSuccess, playFailure } = useAudio();
    
    const currentVerbs = useSelector((state: RootState) => state.game.currentVerbs);
    const currentParticipeTypes = useSelector((state: RootState) => state.game.currentParticipeTypes);
    const allVerbs = useSelector((state: RootState) => state.verb.verbs);
    const ongoingGameInfo = useSelector((state: RootState) => state.game.ongoingGameInfo);
    
    const [gameData, setGameData] = useState<ParticipeQuestion[]>([]);
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
    
    const timerRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const userAnswerRef = useRef<string>('');
    const pauseTimeRef = useRef<number>(0);

    const initializeGame = useCallback(() => {
        setHasError(false);
        setErrorMessage(null);
        const maxSteps = ongoingGameInfo.maxStep;

        try {
            if (currentVerbs.length === 0) {
                throw new Error(t('games.error.noVerbsSelected'));
            }

            if (currentParticipeTypes.length === 0) {
                throw new Error(t('games.error.noParticipeTypesSelected'));
            }

            const questions: ParticipeQuestion[] = [];
            const verbPool = currentVerbs.map(v => v.toLowerCase());
            
            for (let i = 0; i < maxSteps; i++) {
                const selectedVerb = randElement(verbPool);
                // Select participe type from the user's selection
                const participeType: ParticipeType = randElement(currentParticipeTypes) as ParticipeType;
                
                const verbData = findVerbByInfinitive(allVerbs, selectedVerb);
                
                if (!verbData) {
                    throw new Error(t('games.error.verbDataMissing', { verb: selectedVerb }));
                }
                
                const participle = participeType === 'past' 
                    ? verbData.past_participle 
                    : verbData.present_participle;
                
                if (!participle) {
                    throw new Error(t('games.error.failedToGenerate'));
                }
                
                questions.push({
                    verb: selectedVerb,
                    correctAnswer: participle,
                    type: participeType
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
    }, [currentVerbs, currentParticipeTypes, allVerbs, ongoingGameInfo.maxTime, ongoingGameInfo.maxStep, t]);

    useEffect(() => {
        if (allVerbs.length === 0) {
            dispatch(fetchVerbs());
        }
    }, [dispatch, allVerbs.length]);

    useEffect(() => {
        if (currentVerbs.length === 0) {
            navigate('/games');
            return;
        }
        initializeGame();
    }, [currentVerbs.length, initializeGame, navigate]);

    const handleAnswerChange = (value: string) => {
        if (showAnswer || isProcessingAnswer) return;
        setUserAnswer(value);
        userAnswerRef.current = value;
    };

    const checkAnswer = useCallback(() => {
        if (isProcessingAnswer || gameData.length === 0) return;

        setIsProcessingAnswer(true);

        if (timerRef.current !== null) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }

        const currentQuestion = gameData[gameScore.currentStep];
        const normalizedUserAnswer = normalizeString(userAnswerRef.current.trim());
        const normalizedCorrectAnswer = normalizeString(currentQuestion.correctAnswer.trim());
        
        const correct = normalizedUserAnswer === normalizedCorrectAnswer;
        
        setIsCorrect(correct);
        setShowAnswer(true);

        if (correct) {
            setGameScore(prev => ({
                ...prev,
                score: prev.score + 100
            }));
        }

        const isNextLastStep = gameScore.currentStep + 1 >= gameScore.maxStep;
        if (correct) {
            playSuccess(isNextLastStep);
        } else {
            playFailure(isNextLastStep);
        }
    }, [gameData, gameScore.currentStep, gameScore.maxStep, playSuccess, playFailure, isProcessingAnswer]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (showAnswer) {
                handleNextStep();
            } else {
                checkAnswer();
            }
        }
    };

    const handleNextStep = () => {
        const nextStep = gameScore.currentStep + 1;
        
        if (nextStep >= gameScore.maxStep) {
            setShowScore(true);
            return;
        }

        setGameScore(prev => ({ ...prev, currentStep: nextStep }));
        setUserAnswer('');
        userAnswerRef.current = '';
        setShowAnswer(false);
        setIsCorrect(null);
        setIsProcessingAnswer(false);
        setTimeLeft(ongoingGameInfo.maxTime);
        
        startTimer();
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const startTimer = useCallback(() => {
        if (timerRef.current !== null) {
            cancelAnimationFrame(timerRef.current);
        }

        const initialTime = pauseTimeRef.current > 0 ? pauseTimeRef.current : ongoingGameInfo.maxTime;
        pauseTimeRef.current = 0;

        const startTime = Date.now();
        const duration = initialTime * 1000;

        const updateTimer = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            const remainingSeconds = remaining / 1000;

            setTimeLeft(remainingSeconds);

            if (remaining > 0 && !showAnswer) {
                timerRef.current = requestAnimationFrame(updateTimer);
            } else if (remaining <= 0 && !showAnswer) {
                checkAnswer();
            }
        };

        timerRef.current = requestAnimationFrame(updateTimer);
    }, [ongoingGameInfo.maxTime, showAnswer, checkAnswer]);

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
        navigate('/game-room/' + GAME_METADATA['participe'].url);
    };

    useEffect(() => {
        if (gameData.length > 0 && !showAnswer && !isPaused) {
            startTimer();
        }

        return () => {
            if (timerRef.current !== null) {
                cancelAnimationFrame(timerRef.current);
            }
        };
    }, [gameData.length, gameScore.currentStep, showAnswer, startTimer, isPaused]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [gameScore.currentStep]);

    const handleRestart = () => {
        initializeGame();
        setShowScore(false);
    };

    const handleBackToMenu = () => {
        navigate('/dashboard');
    };

    if (hasError) {
        return (
            <GameErrorDisplay
                hasValidConfig={currentVerbs.length > 0}
                onRetry={initializeGame}
                onConfigure={() => navigate('/game-room/' + GAME_METADATA['participe'].url)}
                errorMessage={errorMessage}
            />
        );
    }

    if (gameData.length === 0) {
        return (
            <Container maxWidth='md' sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant='h5'>{t('games.loading')}</Typography>
            </Container>
        );
    }

    const currentQuestion = gameData[gameScore.currentStep];

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            position: 'relative'
        }}>
            <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(236, 72, 153, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)',
                zIndex: 0
            }} />
            
            <Container maxWidth='lg' sx={{ py: 4, position: 'relative', zIndex: 1 }}>
                <GameScoreDialog
                    open={showScore}
                    onClose={handleBackToMenu}
                    score={gameScore.score}
                    maxScore={gameScore.maxScore}
                    correctAnswers={Math.floor(gameScore.score / 100)}
                    totalQuestions={gameScore.maxStep}
                    onPlayAgain={handleRestart}
                />

                <PauseOverlay isPaused={isPaused} onResume={handleResume} />

                <GameHeader
                    currentStep={gameScore.currentStep}
                    maxStep={gameScore.maxStep}
                    score={gameScore.score}
                    timeLeft={timeLeft}
                    maxTime={ongoingGameInfo.maxTime}
                    showTimer={ongoingGameInfo.maxTime > 0}
                    gradientStart="#ec4899"
                    gradientEnd="#db2777"
                    onPause={handlePause}
                    onQuit={handleQuit}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'backOut' }}
                    style={{ filter: isPaused ? 'blur(20px)' : 'none', pointerEvents: isPaused ? 'none' : 'auto' }}
                >
                    <Card sx={{
                        mb: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '2px solid',
                        borderColor: '#ec4899'
                    }}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Typography 
                                variant='h3' 
                                sx={{ 
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent'
                                }}
                            >
                                 {t('games.participe.title')}
                            </Typography>
                            <Typography variant='h6' sx={{ color: '#64748b', mt: 1 }}>
                                {t('games.participe.question', { 
                                    type: t('games.participe.types.' + currentQuestion.type)
                                })}
                            </Typography>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    key={gameScore.currentStep}
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
                            <Typography 
                                variant='h2' 
                                sx={{ 
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    textAlign: 'center',
                                    mb: 4
                                }}
                            >
                                {currentQuestion.verb}
                            </Typography>

                            <TextField
                                ref={inputRef}
                                fullWidth
                                variant='outlined'
                                placeholder={t('games.participe.placeholder')}
                                value={userAnswer}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={showAnswer}
                                autoComplete='off'
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '1.5rem',
                                        backgroundColor: showAnswer 
                                            ? (isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)')
                                            : 'background.paper'
                                    }
                                }}
                                InputProps={{
                                    endAdornment: showAnswer && (
                                        isCorrect 
                                            ? <CheckCircle color='success' /> 
                                            : <Edit color='error' />
                                    )
                                }}
                            />

                            {showAnswer && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card 
                                        sx={{ 
                                            p: 2, 
                                            mb: 3,
                                            backgroundColor: isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                            border: 1,
                                            borderColor: isCorrect ? '#4caf50' : '#f44336'
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            <Typography variant='body1' fontWeight='bold'>
                                                {isCorrect ? ' ' + t('games.common.correct') : ' ' + t('games.common.incorrect')}
                                            </Typography>
                                            {!isCorrect && (
                                                <Typography variant='body2'>
                                                    {t('games.common.correctAnswerWas')}: <strong>{currentQuestion.correctAnswer}</strong>
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Card>
                                </motion.div>
                            )}

                            <Stack direction='row' spacing={2} justifyContent='center'>
                                {!showAnswer ? (
                                    <Button
                                        variant='contained'
                                        size='large'
                                        onClick={checkAnswer}
                                        disabled={!userAnswer.trim() || isProcessingAnswer}
                                        sx={{
                                            minWidth: 200,
                                            minHeight: 60,
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                            '&:hover': {
                                                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        {t('games.common.checkAnswers')}
                                    </Button>
                                ) : (
                                    <Button
                                        variant='contained'
                                        size='large'
                                        onClick={handleNextStep}
                                        sx={{
                                            minWidth: 200,
                                            minHeight: 60,
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                            '&:hover': {
                                                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        {gameScore.currentStep + 1 >= gameScore.maxStep 
                                            ? t('common.finish') 
                                            : t('games.common.nextQuestion')}
                                    </Button>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};

export default Participe;
