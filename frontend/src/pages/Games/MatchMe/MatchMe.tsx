import { CheckCircle, DragIndicator, EmojiEvents, Timer, TrendingUp } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid, LinearProgress, Stack,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GameErrorDisplay from '../../../components/GameErrorDisplay';
import GameScoreDialog from '../../../components/GameScoreDialog';
import { PRONOUNS, TENSE_KEY_TO_DISPLAY_NAMES } from '../../../constants';
import { GAME_METADATA } from '../../../constants/gameConstants';
import { useAudio } from '../../../hooks/useAudio';
import { fetchVerbs } from '../../../store/slices/verbSlice';
import { AppDispatch, RootState } from '../../../store/store';
import { randElement, shuffle } from '../../../utils/gameUtils';
import { findVerbByInfinitive, getConjugation } from '../../../utils/tenseUtils';

const ItemTypes = {
    CONJUGATION: 'conjugation'
};

interface MatchItem {
    id: string;
    tense: string;
    verb: string;
    conjugation: string;
    pronoun: string;
    pronounIndex: number;
    matched?: boolean;
}

interface MatchMeStepData {
    items: MatchItem[];
    matches: Record<string, string>; // tenseId -> conjugationId
    tenses: string[]; // original tense order for consistent indexing
}

interface MatchMeGameInfo {
    currentStep: number;
    maxStep: number;
    score: number;
    maxTime: number;
    duration: number;
}

interface DraggedItem {
    id: string;
    conjugation: string;
    originalTense: string;
}

// Draggable Conjugation Chip Component
interface DraggableConjugationProps {
    item: MatchItem;
    isUsed: boolean;
    isDragging: boolean;
    showAnswers: boolean;
    isProcessingAnswer: boolean;
    onDelete?: () => void;
    isMatched?: boolean;
    isCorrect?: boolean;
    index?: number;
}

const DraggableConjugation: React.FC<DraggableConjugationProps> = ({
    item,
    isUsed,
    isDragging: externalIsDragging,
    showAnswers,
    isProcessingAnswer,
    onDelete,
    isMatched = false,
    isCorrect = false,
    index = 0
}) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.CONJUGATION,
        item: { id: item.id, conjugation: item.conjugation, originalTense: item.tense },
        canDrag: !showAnswers && !isProcessingAnswer,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [item, showAnswers, isProcessingAnswer]);

    const actualIsDragging = isDragging || externalIsDragging;

    return (
        <motion.div
            ref={drag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: actualIsDragging ? 0.3 : 1,
                scale: actualIsDragging ? 0.9 : 1,
                y: actualIsDragging ? -5 : 0
            }}
            transition={{ delay: 0.7 + (index * 0.1) }}
            style={{ display: 'inline-block' }}
        >
            <Chip
                label={`${item.pronoun} ${item.conjugation}`}
                onDelete={onDelete}
                color={showAnswers && isMatched ? (isCorrect ? 'success' : 'error') : isMatched ? 'primary' : 'default'}
                sx={{
                    p: 2,
                    height: 'auto',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: (!showAnswers && !isProcessingAnswer) ? 'grab' : 'default',
                    opacity: actualIsDragging ? 0.3 : (isUsed ? 0.4 : 1),
                    backgroundColor: actualIsDragging ? '#ff9800' : (isUsed ? '#f5f5f5' : (isMatched ? undefined : '#667eea')),
                    color: actualIsDragging ? 'white' : (isUsed ? '#888' : (isMatched ? undefined : 'white')),
                    border: '2px solid',
                    borderColor: actualIsDragging ? '#ff9800' : (isUsed ? '#e0e0e0' : (isMatched ? undefined : '#667eea')),
                    transition: 'all 0.2s ease',
                    transform: actualIsDragging ? 'rotate(-5deg) scale(1.05)' : 'none',
                    boxShadow: actualIsDragging ? '0 8px 24px rgba(255,152,0,0.4)' : undefined,
                    '& .MuiChip-label': {
                        padding: '8px 16px'
                    },
                    '&:hover': {
                        backgroundColor: (!isUsed && !showAnswers && !actualIsDragging && !isMatched) ? '#5a67d8' : undefined,
                        transform: (!showAnswers && !isProcessingAnswer && !actualIsDragging) ? 'translateY(-2px)' : (actualIsDragging ? 'rotate(-5deg) scale(1.05)' : 'none'),
                        boxShadow: (!showAnswers && !isProcessingAnswer && !actualIsDragging) ? '0 4px 20px rgba(0,0,0,0.15)' : (actualIsDragging ? '0 8px 24px rgba(255,152,0,0.4)' : undefined)
                    },
                    '&:active': {
                        cursor: (!showAnswers && !isProcessingAnswer) ? 'grabbing' : 'default'
                    }
                }}
            />
        </motion.div>
    );
};

// Drop Target for Tense Areas
interface TenseDropTargetProps {
    tense: string;
    matchedItem: MatchItem | null;
    isCorrect: boolean;
    showAnswers: boolean;
    isProcessingAnswer: boolean;
    onDrop: (item: DraggedItem) => void;
    children: React.ReactNode;
}

const TenseDropTarget: React.FC<TenseDropTargetProps> = ({ tense, matchedItem, isCorrect, showAnswers, isProcessingAnswer, onDrop, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.CONJUGATION,
        drop: (item: DraggedItem) => {
            if (!showAnswers && !isProcessingAnswer) {
                onDrop(item);
            }
        },
        canDrop: () => !showAnswers && !isProcessingAnswer,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [showAnswers, isProcessingAnswer, onDrop]);

    const isActive = isOver && canDrop;

    return (
        <Card
            ref={drop}
            sx={{
                minHeight: 180,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2,
                border: '2px solid',
                borderColor: isActive ? '#667eea' : (showAnswers ? (isCorrect ? '#4caf50' : '#f44336') : '#e2e8f0'),
                backgroundColor: isActive ? 'rgba(102, 126, 234, 0.1)' : (showAnswers ? (isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)') : 'white'),
                boxShadow: isActive ? '0 8px 24px rgba(102, 126, 234, 0.3)' : undefined,
                transition: 'all 0.3s ease',
                transform: isActive ? 'scale(1.02)' : 'none',
            }}
        >
            {children}
        </Card>
    );
};

// Pool Drop Target
interface PoolDropTargetProps {
    onDrop: () => void;
    showAnswers: boolean;
    isProcessingAnswer: boolean;
    children: React.ReactNode;
}

const PoolDropTarget: React.FC<PoolDropTargetProps> = ({ onDrop, showAnswers, isProcessingAnswer, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.CONJUGATION,
        drop: () => {
            if (!showAnswers && !isProcessingAnswer) {
                onDrop();
            }
        },
        canDrop: () => !showAnswers && !isProcessingAnswer,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [showAnswers, isProcessingAnswer, onDrop]);

    const isActive = isOver && canDrop;

    return (
        <Box
            ref={drop}
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                padding: 2,
                border: '2px dashed #e2e8f0',
                borderRadius: 2,
                backgroundColor: isActive ? 'rgba(102, 126, 234, 0.1)' : '#fafafa',
                borderColor: isActive ? '#667eea' : '#e2e8f0',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: '#667eea',
                    backgroundColor: '#f8faff'
                }
            }}
        >
            {children}
        </Box>
    );
};

const MatchMe: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const currentVerbs = useSelector((state: RootState) => state.game.currentVerbs);
    const currentTenses = useSelector((state: RootState) => state.game.currentTenses);
    const allVerbs = useSelector((state: RootState) => state.verb.verbs);
    const ongoingGameInfo = useSelector((state: RootState) => state.game.ongoingGameInfo);

    // Audio feedback
    const { playSuccess, playFailure } = useAudio();
    const { t } = useTranslation();

    const [gameData, setGameData] = useState<MatchMeStepData[]>([]);
    const [gameScore, setGameScore] = useState<MatchMeGameInfo>({
        currentStep: 0,
        score: 0,
        maxTime: ongoingGameInfo.maxTime,
        maxStep: ongoingGameInfo.maxStep,
        duration: 0
    });
    const [showScore, setShowScore] = useState(false);
    const [timeLeft, setTimeLeft] = useState(ongoingGameInfo.maxTime);
    const [userMatches, setUserMatches] = useState<Record<string, string>>({});
    const [showAnswers, setShowAnswers] = useState(false);
    const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
    const [correctnessStatus, setCorrectnessStatus] = useState<Record<string, boolean>>({});
    const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    const timerRef = useRef<number | null>(null);
    const userMatchesRef = useRef<Record<string, string>>({});
    const MAX_TRIES = 10;

    const initializeGame = useCallback(() => {
        setHasError(false);
        debugger;
        const steps: MatchMeStepData[] = [];
        const maxSteps = ongoingGameInfo.maxStep;

        for (let i = 0; i < maxSteps; i++) {
            
            // Select 3 different tenses for this step
            
            let tries = 0;
            let items: MatchItem[] = [];
            let matches: Record<string, string> = {};
            let selectedTenses: string[] = [];
            while(items.length < 3 && tries < MAX_TRIES) {
                selectedTenses = shuffle(currentTenses).slice(0, 3);
                items = [];
                matches = {};
                selectedTenses.forEach((tense, index) => {
                    // Pick a random verb for this tense
                    const selectedVerb = randElement(currentVerbs);
                    console.log(`MatchMe - Step ${i}, Tense ${index}: Looking for verb '${selectedVerb}'`);
                    const verbData = findVerbByInfinitive(allVerbs, selectedVerb);
                    console.log('MatchMe - Found verb data:', verbData ? verbData.infinitive : 'NOT FOUND');

                    if (verbData && verbData.conjugations) {
                        const pronounIndex = Math.floor(Math.random() * 6);
                        const conjugation = getConjugation(verbData.conjugations, tense, pronounIndex);
                        console.log(`MatchMe - Conjugation for ${selectedVerb} (${tense}, person ${pronounIndex}):`, conjugation);

                        if (conjugation) {
                            const tenseId = `tense-${i}-${index}`;
                            const conjugationId = `conj-${i}-${index}`;

                            items.push({
                                id: conjugationId,
                                tense,
                                verb: selectedVerb,
                                conjugation,
                                pronoun: PRONOUNS[pronounIndex],
                                pronounIndex,
                            });

                            matches[tenseId] = conjugationId;
                        }
                    }
                });
                tries++;
            }
            steps.push({
                items: shuffle(items), // Shuffle conjugations
                matches,
                tenses: selectedTenses // Store original tense order
            });
        }

        console.log('MatchMe - Generated steps:', steps.length);
        console.log('MatchMe - Step data:', steps);

        if (steps.length === 0) {
            console.error('MatchMe - Failed to generate game data');
            setErrorMessage(t('game.error.errorGenerating'));
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
        setUserMatches({});
        setShowAnswers(false);
        setCorrectnessStatus({});
        userMatchesRef.current = {};
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

    // Drag and drop handlers for react-dnd
    const handleDropToTense = useCallback((item: DraggedItem, targetTense: string) => {
        if (showAnswers || isProcessingAnswer) return;

        const currentQuestion = getCurrentQuestion();
        const tenseIndex = currentQuestion?.tenses.findIndex(tense => tense === targetTense) ?? -1;
        const tenseId = `tense-${gameScore.currentStep}-${tenseIndex}`;

        // Remove previous match for this tense
        const newMatches = { ...userMatches };
        Object.keys(newMatches).forEach(key => {
            if (newMatches[key] === item.id) {
                delete newMatches[key];
            }
        });

        // Add new match
        newMatches[tenseId] = item.id;
        setUserMatches(newMatches);
        userMatchesRef.current = newMatches;
    }, [showAnswers, isProcessingAnswer, userMatches, gameScore.currentStep]);

    const handleDropToPool = useCallback(() => {
        // Remove the item from any tense matches (return to pool) - handled by react-dnd
        // The item will automatically return to the pool when dropped there
    }, []);

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

        // Check each match
        const correctness: Record<string, boolean> = {};
        let correctCount = 0;
        const totalMatches = Object.keys(currentQuestion.matches).length;

        Object.keys(currentQuestion.matches).forEach(tenseId => {
            const correctConjugationId = currentQuestion.matches[tenseId];
            const userConjugationId = userMatchesRef.current[tenseId];
            const isCorrect = userConjugationId === correctConjugationId;
            correctness[tenseId] = isCorrect;
            if (isCorrect) correctCount++;
        });

        setCorrectnessStatus(correctness);
        setShowAnswers(true);

        // Calculate score based on correct matches (partial credit)
        const scoreIncrease = Math.floor((correctCount / totalMatches) * 100);
        setGameScore(prev => ({
            ...prev,
            score: prev.score + scoreIncrease
        }));

        // Play audio feedback based on performance
        const isNextLastStep = gameScore.currentStep + 1 >= gameScore.maxStep;
        const successThreshold = Math.ceil(totalMatches * 0.6); // 60% or more correct
        console.log('🎮 MatchMe: Playing audio feedback', { correctCount, totalMatches, successThreshold, isSuccess: correctCount >= successThreshold, isNextLastStep });
        if (correctCount >= successThreshold) {
            playSuccess(isNextLastStep);
        } else {
            playFailure(isNextLastStep);
        }

        // Move to next question after delay
        setTimeout(() => {
            setShowAnswers(false);
            setIsProcessingAnswer(false);
            setUserMatches({});
            setCorrectnessStatus({});
            userMatchesRef.current = {};

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

    const handleSubmit = () => {
        checkAnswers();
    };

    // Timer logic (similar to WriteMe)
    useEffect(() => {
        if (timerRef.current !== null) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }

        if (ongoingGameInfo.maxTime === 0 ||
            gameScore.currentStep >= gameScore.maxStep ||
            showScore ||
            showAnswers ||
            isProcessingAnswer) {
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
                    checkAnswers(); // Time's up
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
    }, [gameScore.currentStep, gameScore.maxStep, showScore, ongoingGameInfo.maxTime, showAnswers, isProcessingAnswer, gameData, checkAnswers, playSuccess, playFailure]);

    const handleClose = () => {
        navigate('/dashboard');
    };

    const handlePlayAgain = () => {
        setShowScore(false);
        setHasError(false);
        initializeGame();
    };

    const getCurrentQuestion = () => gameData[gameScore.currentStep];

    const getMatchedConjugation = (tenseId: string) => {
        const conjugationId = userMatches[tenseId];
        const currentQuestion = getCurrentQuestion();
        return currentQuestion?.items.find(item => item.id === conjugationId);
    };

    const isConjugationUsed = (conjugationId: string) => {
        return Object.values(userMatches).includes(conjugationId);
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

    const currentQuestion = getCurrentQuestion();

    if (!currentQuestion) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h5">Chargement du jeu...</Typography>
            </Container>
        );
    }

    const progressPercent = ((gameScore.currentStep + 1) / gameScore.maxStep) * 100;
    const timePercent = ongoingGameInfo.maxTime > 0 ? Math.max(0, (timeLeft / ongoingGameInfo.maxTime) * 100) : 100;

    // Get tenses for this question (maintaining original order)
    const uniqueTenses = currentQuestion.tenses;

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
                                        icon={<DragIndicator />}
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
                        🎴 Associez les conjugaisons aux temps correspondants
                    </Typography>
                </motion.div>

                {/* Conjugation Pool - Big Box Above */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    key={`conjugations-${gameScore.currentStep}`}
                >
                    <Card sx={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        mb: 4,
                        minHeight: 200
                    }}>
                        <CardContent>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 3,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    color: '#4f46e5'
                                }}
                            >
                                📦 Conjugaisons disponibles
                            </Typography>
                            <PoolDropTarget
                                onDrop={handleDropToPool}
                                showAnswers={showAnswers}
                                isProcessingAnswer={isProcessingAnswer}
                            >
                                {currentQuestion.items.map((item, index) => {
                                    const isUsed = isConjugationUsed(item.id);
                                    return (
                                        <DraggableConjugation
                                            key={item.id}
                                            item={item}
                                            isUsed={isUsed}
                                            isDragging={false}
                                            showAnswers={showAnswers}
                                            isProcessingAnswer={isProcessingAnswer}
                                            index={index}
                                        />
                                    );
                                })}
                            </PoolDropTarget>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Verb Boxes - Three Horizontal Containers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    key={`tenses-${gameScore.currentStep}`}
                >
                    <Grid container spacing={3}>
                        {uniqueTenses.map((tense, index) => {
                            const tenseId = `tense-${gameScore.currentStep}-${index}`;
                            const matchedConjugation = getMatchedConjugation(tenseId);
                            const isCorrect = showAnswers ? correctnessStatus[tenseId] : undefined;

                            return (
                                <Grid item xs={12} md={4} key={tense}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 + (index * 0.1) }}
                                    >
                                        <TenseDropTarget
                                            tense={tense}
                                            matchedItem={matchedConjugation ?? null}
                                            isCorrect={isCorrect ?? false}
                                            showAnswers={showAnswers}
                                            isProcessingAnswer={isProcessingAnswer}
                                            onDrop={(item) => handleDropToTense(item, tense)}
                                        >
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#1f2937',
                                                    mb: 2,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {TENSE_KEY_TO_DISPLAY_NAMES[tense] || tense}
                                            </Typography>

                                            {/* Dropped Conjugation Area */}
                                            <Box sx={{
                                                minHeight: 60,
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'column'
                                            }}>
                                                {matchedConjugation ? (
                                                    <DraggableConjugation
                                                        item={matchedConjugation}
                                                        isUsed={false}
                                                        isDragging={false}
                                                        showAnswers={showAnswers}
                                                        isProcessingAnswer={isProcessingAnswer}
                                                        isMatched={true}
                                                        isCorrect={isCorrect ?? false}
                                                    />
                                                ) : (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#999',
                                                            fontStyle: 'italic',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        Glissez une conjugaison ici
                                                    </Typography>
                                                )}
                                            </Box>

                                            {showAnswers && (
                                                <Typography
                                                    variant="h4"
                                                    sx={{
                                                        color: isCorrect ? '#4caf50' : '#f44336',
                                                        fontWeight: 'bold',
                                                        mt: 1
                                                    }}
                                                >
                                                    {isCorrect ? '✅' : '❌'}
                                                </Typography>
                                            )}
                                        </TenseDropTarget>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </Grid>
                </motion.div>

                {/* Submit Button */}
                {!showAnswers && !isProcessingAnswer && Object.keys(userMatches).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1 }}
                    >
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                size="large"
                                startIcon={<CheckCircle />}
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
                                Vérifier les associations
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
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            {Object.values(correctnessStatus).every(status => status === true) ? (
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
                                        🎉 Parfait ! Toutes les associations sont correctes ! <TrendingUp sx={{ color: '#4caf50' }} />
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
                                        💡 Bien essayé ! Voici les bonnes associations :
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

export default () => (
    <DndProvider backend={HTML5Backend}>
        <MatchMe />
    </DndProvider>
);