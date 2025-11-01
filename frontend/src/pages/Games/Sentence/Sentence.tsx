import { CheckCircle, EmojiEvents, MenuBook, Timer } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    LinearProgress,
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
import GameScoreDialog from '../../../components/GameScoreDialog';
import GameHeader from '../../../components/GameHeader';
import PauseOverlay from '../../../components/PauseOverlay';
import { GAME_METADATA, TENSE_KEY_TO_DISPLAY_NAMES } from '../../../constants';
import { useAudio } from '../../../hooks/useAudio';
import api from '../../../services/api';
import { fetchVerbs } from '../../../store/slices/verbSlice';
import { AppDispatch, RootState } from '../../../store/store';
import { randElement } from '../../../utils/gameUtils';
import { findVerbByInfinitive, getConjugation, normalizeString } from '../../../utils/tenseUtils';

interface SentenceVerb {
    infinitive: string;
    position: number;
    subject: string;
}

interface SentenceData {
    id: number;
    text: string;
    verbs: SentenceVerb[];
    tenses: string[];
}

interface SentenceQuestion {
    sentenceTemplate: string;
    verb: string;
    subject: string;
    selectedTense: string;
    correctAnswer: string;
}

interface GameScore {
    currentStep: number;
    score: number;
    maxScore: number;
    maxStep: number;
}

const Sentence: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    // Audio feedback
    const { playSuccess, playFailure } = useAudio();
    
    const currentTenses = useSelector((state: RootState) => state.game.currentTenses);
    const allVerbs = useSelector((state: RootState) => state.verb.verbs);
    const ongoingGameInfo = useSelector((state: RootState) => state.game.ongoingGameInfo);
    
    const [gameData, setGameData] = useState<SentenceQuestion[]>([]);
    const [gameScore, setGameScore] = useState<GameScore>({
        currentStep: 0,
        score: 0,
        maxScore: 0,
        maxStep: ongoingGameInfo.maxStep,
    });
    const [showScore, setShowScore] = useState(false);
    const [timeLeft, setTimeLeft] = useState(ongoingGameInfo.maxTime);
    const [isPaused, setIsPaused] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const timerRef = useRef<number | null>(null);
    const pauseTimeRef = useRef<number>(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const userAnswerRef = useRef<string>('');

    const initializeGame = useCallback(async () => {
        setHasError(false);
        setErrorMessage(null);
        const maxSteps = ongoingGameInfo.maxStep;

        console.log("🎮 Initializing Sentence game with configuration:", {
            selectedTenses: currentTenses,
            tenseCount: currentTenses.length,
            maxSteps: maxSteps,
            totalVerbsAvailable: allVerbs.length
        });

        try {
            // Fetch sentences from backend API
            const tensesParam = currentTenses.join(',');
            const limit = Math.min(maxSteps * 2, 100); // Fetch extra for variety
            const response = await api.get(`/sentences?tenses=${tensesParam}&limit=${limit}`);
            const availableSentences: SentenceData[] = response.data;

            if (availableSentences.length === 0) {
                throw new Error(t('games.error.noMatchingSentences'));
            }

            console.log(`📖 Fetched ${availableSentences.length} sentences from backend`);

            // Generate questions
            const questions: SentenceQuestion[] = [];
            const usedSentenceIds = new Set<number>();
            
            for (let i = 0; i < maxSteps; i++) {
                // Find an unused sentence
                let sentence: SentenceData | null = null;
                let attempts = 0;
                const maxAttempts = availableSentences.length * 2;
                
                while (attempts < maxAttempts) {
                    const candidate = randElement(availableSentences);
                    if (!usedSentenceIds.has(candidate.id)) {
                        sentence = candidate;
                        usedSentenceIds.add(candidate.id);
                        break;
                    }
                    attempts++;
                }
                
                if (!sentence) {
                    // If we can't find unused sentences, allow reuse
                    sentence = randElement(availableSentences);
                }
                
                // Pick the first verb in the sentence for now (later we'll support multiple)
                const verbInfo = sentence.verbs[0];
                const selectedTense = randElement(sentence.tenses.filter(t => currentTenses.includes(t)));
                
                // Get verb data from the database
                const verbData = findVerbByInfinitive(allVerbs, verbInfo.infinitive);
                
                if (!verbData) {
                    console.error(`❌ Verb data not found for "${verbInfo.infinitive}"`, {
                        sentenceId: sentence.id,
                        attemptedVerb: verbInfo.infinitive
                    });
                    throw new Error(t('games.error.verbDataMissing', { verb: verbInfo.infinitive }));
                }
                
                // Determine pronoun index based on subject
                const subject = verbInfo.subject.toLowerCase();
                let pronounIndex = 0;
                if (subject.includes('tu ') || subject.startsWith('tu')) pronounIndex = 1;
                else if (subject.includes('il ') || subject.includes('elle ') || subject.includes('on ') || 
                         subject.match(/^(le |la |l'|cet |cette )/)) pronounIndex = 2;
                else if (subject.includes('nous ') || subject.startsWith('nous')) pronounIndex = 3;
                else if (subject.includes('vous ') || subject.startsWith('vous')) pronounIndex = 4;
                else if (subject.includes('ils ') || subject.includes('elles ') || subject.match(/^les /)) pronounIndex = 5;
                
                const correctAnswer = verbData.conjugations 
                    ? getConjugation(verbData.conjugations, selectedTense, pronounIndex)
                    : '';
                
                if (!correctAnswer) {
                    console.error(`❌ Failed to get conjugation`, {
                        verb: verbInfo.infinitive,
                        tense: selectedTense,
                        pronounIndex: pronounIndex,
                        subject: verbInfo.subject
                    });
                    throw new Error(t('games.error.failedToGenerate'));
                }
                
                questions.push({
                    sentenceTemplate: sentence.text,
                    verb: verbInfo.infinitive,
                    subject: verbInfo.subject,
                    selectedTense: selectedTense,
                    correctAnswer: correctAnswer
                });
            }

            if (questions.length === 0) {
                throw new Error(t('games.error.noData'));
            }

            console.log(`✅ Generated ${questions.length} questions successfully`);

            setGameData(questions);
            setGameScore({
                currentStep: 0,
                score: 0,
                maxScore: questions.length * 100, // 100 points per question
                maxStep: questions.length
            });
            setTimeLeft(ongoingGameInfo.maxTime);
            setUserAnswer('');
            userAnswerRef.current = '';
            setShowAnswer(false);
            setIsCorrect(null);
        } catch (err) {
            console.error("❌ Error initializing Sentence game:", err);
            setHasError(true);
            setErrorMessage(
                t('games.error.unexpected') + "\n" + 
                `Error: ${err}\n\n` +
                `Configuration:\n` +
                `- Tenses selected: ${currentTenses.length} (${currentTenses.join(', ')})\n` +
                `- Max steps: ${maxSteps}\n` +
                `- Total verbs available: ${allVerbs.length}`
            );
            return;
        }
    }, [currentTenses, allVerbs, ongoingGameInfo.maxTime, ongoingGameInfo.maxStep, t]);

    // Fetch verbs when component mounts
    useEffect(() => {
        if (allVerbs.length === 0) {
            dispatch(fetchVerbs());
        }
    }, [dispatch, allVerbs.length]);

    // Initialize game
    useEffect(() => {
        if (currentTenses.length === 0) {
            navigate('/games');
            return;
        }
        initializeGame();
    }, [currentTenses.length, initializeGame, navigate]);

    const handleAnswerChange = (value: string) => {
        if (showAnswer || isProcessingAnswer) return;
        setUserAnswer(value);
        userAnswerRef.current = value;
    };

    const checkAnswer = useCallback(() => {
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

        // Check answer
        const normalizedUserAnswer = normalizeString(userAnswer.trim().toLowerCase());
        const normalizedCorrectAnswer = normalizeString(currentQuestion.correctAnswer.toLowerCase());
        const correct = normalizedUserAnswer === normalizedCorrectAnswer;

        setIsCorrect(correct);
        setShowAnswer(true);

        // Calculate score
        if (correct) {
            setGameScore(prev => ({
                ...prev,
                score: prev.score + 100
            }));
        }

        // Play audio feedback
        const isNextLastStep = gameScore.currentStep + 1 >= gameScore.maxStep;
        console.log('🎮 Sentence: Playing audio feedback', { correct, isNextLastStep });
        if (correct) {
            playSuccess(isNextLastStep);
        } else {
            playFailure(isNextLastStep);
        }

        // Move to next question after delay
        setTimeout(() => {
            setShowAnswer(false);
            setIsProcessingAnswer(false);
            setUserAnswer('');
            userAnswerRef.current = '';
            setIsCorrect(null);
            
            if (gameScore.currentStep + 1 >= gameScore.maxStep) {
                setShowScore(true);
            } else {
                setGameScore(prev => ({
                    ...prev,
                    currentStep: prev.currentStep + 1,
                }));
            }
        }, 3000);
    }, [gameData, gameScore.currentStep, gameScore.maxStep, isProcessingAnswer, userAnswer, playSuccess, playFailure]);

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
        navigate('/game-room/' + GAME_METADATA['sentence'].url);
    };

    const handleSubmit = () => {
        checkAnswer();
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
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
            showAnswer || 
            isProcessingAnswer ||
            isPaused ||
            hasError ||
            gameData.length === 0) 
        {
            return;
        }

        const initialTime = pauseTimeRef.current > 0 ? pauseTimeRef.current : ongoingGameInfo.maxTime;
        setTimeLeft(initialTime);
        pauseTimeRef.current = 0;
        
        const startTime = Date.now();
        const targetDuration = initialTime * 1000;
        
        const updateTimer = () => {
            if (showAnswer || isProcessingAnswer || isPaused) {
                timerRef.current = null;
                return;
            }

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, targetDuration - elapsed);
            const remainingSeconds = remaining / 1000;
            
            setTimeLeft(remainingSeconds);
            
            if (remaining <= 100) {
                timerRef.current = null;
                if (!isProcessingAnswer && !showAnswer && remainingSeconds <= 0.1) {
                    // Time's up - submit the current answer
                    setIsProcessingAnswer(true);
                    const currentQuestion = gameData[gameScore.currentStep];
                    const normalizedUserAnswer = normalizeString(userAnswerRef.current.trim().toLowerCase());
                    const normalizedCorrectAnswer = normalizeString(currentQuestion.correctAnswer.toLowerCase());
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
                    
                    setTimeout(() => {
                        setShowAnswer(false);
                        setIsProcessingAnswer(false);
                        setUserAnswer('');
                        userAnswerRef.current = '';
                        setIsCorrect(null);
                        
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
    }, [gameScore.currentStep, gameScore.maxStep, showScore, ongoingGameInfo.maxTime, showAnswer, isProcessingAnswer, isPaused, hasError, gameData.length, playSuccess, playFailure]);

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
                hasValidConfig={currentTenses.length > 0}
                onRetry={handlePlayAgain}
                onConfigure={() => navigate('/game-room/'+ GAME_METADATA["sentence"].url)}
                errorMessage={errorMessage}
            />
        );
    }

    if (gameData.length === 0 || gameScore.currentStep >= gameData.length) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h5">{t('games.common.loading')}</Typography>
            </Container>
        );
    }

    const currentQuestion = gameData[gameScore.currentStep];
    
    if (!currentQuestion) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h5">{t('games.common.loading')}</Typography>
            </Container>
        );
    }

    // Replace (verb) placeholder with infinitive + blank or correct answer
    const displaySentence = showAnswer 
        ? currentQuestion.sentenceTemplate.replace(/\(([^)]+)\)/, `**(${currentQuestion.verb})** → **${currentQuestion.correctAnswer}**`)
        : currentQuestion.sentenceTemplate.replace(/\(([^)]+)\)/, `**(${currentQuestion.verb})** ______`);

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0fdfa 0%, #cffafe 100%)',
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
                    radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(14, 165, 233, 0.05) 0%, transparent 50%)
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
                    gradientStart="#06b6d4"
                    gradientEnd="#0284c7"
                    onPause={handlePause}
                    onQuit={handleQuit}
                />

                {/* Instruction */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    style={{ filter: isPaused ? 'blur(20px)' : 'none', pointerEvents: isPaused ? 'none' : 'auto' }}
                >
                    <Typography 
                        variant="h5" 
                        textAlign="center" 
                        sx={{ 
                            mb: 3,
                            fontWeight: 'bold',
                            color: '#0c4a6e',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        📖 {t('games.sentence.instruction')}
                    </Typography>
                </motion.div>

                {/* Tense Display */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    key={gameScore.currentStep}
                >
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Chip 
                            label={TENSE_KEY_TO_DISPLAY_NAMES[currentQuestion.selectedTense] || currentQuestion.selectedTense}
                            sx={{ 
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                padding: '24px 16px',
                                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                            }}
                        />
                    </Box>
                </motion.div>

                {/* Sentence Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    style={{ filter: isPaused ? 'blur(20px)' : 'none', pointerEvents: isPaused ? 'none' : 'auto' }}
                >
                    <Card sx={{
                        mb: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '2px solid',
                        borderColor: '#06b6d4'
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    textAlign: 'center',
                                    mb: 4,
                                    color: '#0c4a6e',
                                    lineHeight: 1.8,
                                    fontWeight: 500
                                }}
                            >
                                {displaySentence.split('______').map((part, index, array) => (
                                    <React.Fragment key={index}>
                                        {part.split(/(\*\*\([^)]+\)\*\*)/).map((segment, i) => {
                                            // Check if this segment is the infinitive verb in parentheses
                                            if (segment.match(/^\*\*\([^)]+\)\*\*$/)) {
                                                const verb = segment.replace(/\*\*|\(|\)/g, '');
                                                return (
                                                    <Box 
                                                        key={i}
                                                        component="span" 
                                                        sx={{ 
                                                            fontWeight: 'bold',
                                                            color: '#8b5cf6',
                                                            fontSize: '1.1em'
                                                        }}
                                                    >
                                                        ({verb})
                                                    </Box>
                                                );
                                            }
                                            // Handle other bold text (correct answer)
                                            return segment.replace(/\*\*(.*?)\*\*/g, '$1');
                                        })}
                                        {index < array.length - 1 && !showAnswer && (
                                            <Box 
                                                component="span" 
                                                sx={{ 
                                                    display: 'inline-block',
                                                    borderBottom: '3px solid #06b6d4',
                                                    minWidth: '150px',
                                                    mx: 1
                                                }}
                                            >
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            </Box>
                                        )}
                                        {index < array.length - 1 && showAnswer && (
                                            <Box 
                                                component="span" 
                                                sx={{ 
                                                    display: 'inline-block',
                                                    fontWeight: 'bold',
                                                    color: isCorrect ? '#059669' : '#dc2626',
                                                    borderBottom: `3px solid ${isCorrect ? '#059669' : '#dc2626'}`,
                                                    px: 1
                                                }}
                                            >
                                                {currentQuestion.correctAnswer}
                                            </Box>
                                        )}
                                    </React.Fragment>
                                ))}
                            </Typography>

                            {!showAnswer && (
                                <Stack spacing={3} alignItems="center">
                                    <TextField
                                        inputRef={inputRef}
                                        value={userAnswer}
                                        onChange={(e) => handleAnswerChange(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={showAnswer || isProcessingAnswer}
                                        fullWidth
                                        autoFocus
                                        sx={{
                                            maxWidth: 400,
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '1.2rem',
                                                '&:hover fieldset': {
                                                    borderColor: '#06b6d4',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#06b6d4',
                                                    borderWidth: 2
                                                }
                                            }
                                        }}
                                        placeholder={t('games.sentence.placeholder')}
                                    />
                                </Stack>
                            )}

                            {showAnswer && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                                        {isCorrect ? (
                                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                                <CheckCircle sx={{ color: '#059669', fontSize: 40 }} />
                                                <Typography 
                                                    variant="h5" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        color: '#059669'
                                                    }}
                                                >
                                                    {t('games.common.correct')}
                                                </Typography>
                                            </Stack>
                                        ) : (
                                            <Box>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        color: '#dc2626',
                                                        mb: 1
                                                    }}
                                                >
                                                    {t('games.common.incorrect')}
                                                </Typography>
                                                <Typography 
                                                    variant="body1" 
                                                    sx={{ color: '#64748b' }}
                                                >
                                                    {t('games.common.yourAnswer')}: <strong>{userAnswer}</strong>
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Submit Button */}
                {!showAnswer && !isProcessingAnswer && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        style={{ filter: isPaused ? 'blur(20px)' : 'none', pointerEvents: isPaused ? 'none' : 'auto' }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                size="large"
                                disabled={!userAnswer.trim()}
                                sx={{
                                    minWidth: 200,
                                    minHeight: 60,
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                                        transform: 'translateY(-2px)'
                                    },
                                    '&:disabled': {
                                        background: '#94a3b8',
                                        color: '#cbd5e1'
                                    }
                                }}
                            >
                                {t('games.common.checkAnswers')}
                            </Button>
                        </Box>
                    </motion.div>
                )}

                {/* Score Dialog */}
                <GameScoreDialog
                    open={showScore}
                    onClose={handleClose}
                    score={gameScore.score}
                    maxScore={gameScore.maxScore}
                    correctAnswers={Math.floor(gameScore.score / 100)}
                    totalQuestions={gameScore.maxStep}
                    onPlayAgain={handlePlayAgain}
                />
            </Container>
        </Box>
    );
};

export default Sentence;
