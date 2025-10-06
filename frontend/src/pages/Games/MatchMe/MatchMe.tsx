import { CheckCircle, DragIndicator, EmojiEvents, Timer, TrendingUp } from '@mui/icons-material';
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
    DialogTitle, Grid, LinearProgress, Paper, Stack,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FRENCH_PRONOUNS } from '../../../constants';
import { TENSE_DISPLAY_NAMES } from '../../../constants/gameConstants';
import { fetchVerbs } from '../../../store/slices/verbSlice';
import { AppDispatch, RootState } from '../../../store/store';
import { randElement, shuffle } from '../../../utils/gameUtils';
import { findVerbByInfinitive, getConjugation } from '../../../utils/tenseUtils';

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

const MatchMe: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    const currentVerbs = useSelector((state: RootState) => state.game.currentVerbs);
    const currentTenses = useSelector((state: RootState) => state.game.currentTenses);
    const allVerbs = useSelector((state: RootState) => state.verb.verbs);
    const ongoingGameInfo = useSelector((state: RootState) => state.game.ongoingGameInfo);
    
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
    
    const timerRef = useRef<number | null>(null);
    const userMatchesRef = useRef<Record<string, string>>({});

    const initializeGame = useCallback(() => {
        const steps: MatchMeStepData[] = [];
        const maxSteps = ongoingGameInfo.maxStep;

        for (let i = 0; i < maxSteps; i++) {
            const items: MatchItem[] = [];
            const matches: Record<string, string> = {};
            
            // Select 4-6 different tenses for this step
            const selectedTenses = shuffle(currentTenses).slice(0, Math.min(6, currentTenses.length, 4));
            
            selectedTenses.forEach((tense, index) => {
                // Pick a random verb for this tense
                const selectedVerb = randElement(currentVerbs);
                const verbData = findVerbByInfinitive(allVerbs, selectedVerb);
                
                if (verbData && verbData.conjugations) {
                    const pronounIndex = Math.floor(Math.random() * 6);
                    const conjugation = getConjugation(verbData.conjugations, tense, pronounIndex);
                    
                    if (conjugation) {
                        const tenseId = `tense-${i}-${index}`;
                        const conjugationId = `conj-${i}-${index}`;
                        
                        items.push({
                            id: conjugationId,
                            tense,
                            verb: selectedVerb,
                            conjugation,
                            pronoun: FRENCH_PRONOUNS[pronounIndex],
                            pronounIndex,
                        });
                        
                        matches[tenseId] = conjugationId;
                    }
                }
            });

            if (items.length >= 3) { // Ensure we have at least 3 matches
                steps.push({
                    items: shuffle(items), // Shuffle conjugations
                    matches,
                    tenses: selectedTenses // Store original tense order
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

    const handleDragStart = (e: React.DragEvent, item: MatchItem) => {
        setDraggedItem({
            id: item.id,
            conjugation: item.conjugation,
            originalTense: item.tense
        });
        setDraggedItemId(item.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedItemId(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetTense: string) => {
        e.preventDefault();
        
        if (!draggedItem || showAnswers || isProcessingAnswer) return;

        const currentQuestion = getCurrentQuestion();
        const tenseIndex = currentQuestion?.tenses.findIndex(tense => tense === targetTense) ?? -1;
        const tenseId = `tense-${gameScore.currentStep}-${tenseIndex}`;
        
        // Remove previous match for this tense
        const newMatches = { ...userMatches };
        Object.keys(newMatches).forEach(key => {
            if (newMatches[key] === draggedItem.id) {
                delete newMatches[key];
            }
        });

        // Add new match
        newMatches[tenseId] = draggedItem.id;
        setUserMatches(newMatches);
        userMatchesRef.current = newMatches;
        setDraggedItem(null);
        setDraggedItemId(null);
    };

    const handleDropToPool = (e: React.DragEvent) => {
        e.preventDefault();
        
        if (!draggedItem || showAnswers || isProcessingAnswer) return;

        // Remove the item from any tense matches (return to pool)
        const newMatches = { ...userMatches };
        Object.keys(newMatches).forEach(key => {
            if (newMatches[key] === draggedItem.id) {
                delete newMatches[key];
            }
        });

        setUserMatches(newMatches);
        userMatchesRef.current = newMatches;
        setDraggedItem(null);
        setDraggedItemId(null);
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
    }, [gameData, gameScore.currentStep, gameScore.maxStep, isProcessingAnswer]);

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
    }, [gameScore.currentStep, gameScore.maxStep, showScore, ongoingGameInfo.maxTime, showAnswers, isProcessingAnswer, gameData, checkAnswers]);

    const handleClose = () => {
        navigate('/dashboard');
    };

    const handlePlayAgain = () => {
        setShowScore(false);
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
                        <Box 
                            onDragOver={handleDragOver}
                            onDrop={handleDropToPool}
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                                justifyContent: 'center',
                                minHeight: 120,
                                alignItems: 'flex-start',
                                padding: 2,
                                border: '2px dashed #e2e8f0',
                                borderRadius: 2,
                                backgroundColor: '#fafafa',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: '#667eea',
                                    backgroundColor: '#f8faff'
                                }
                            }}>
                            {currentQuestion.items.map((item, index) => {
                                const isUsed = isConjugationUsed(item.id);
                                const isDragging = draggedItemId === item.id;
                                
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ 
                                            opacity: isDragging ? 0.3 : 1, 
                                            scale: isDragging ? 0.9 : 1,
                                            y: isDragging ? -5 : 0
                                        }}
                                        transition={{ delay: 0.7 + (index * 0.1) }}
                                    >
                                        <Chip
                                            label={`${item.pronoun} ${item.conjugation}`}
                                            draggable={!showAnswers && !isProcessingAnswer}
                                            onDragStart={(e) => handleDragStart(e, item)}
                                            onDragEnd={handleDragEnd}
                                            sx={{
                                                p: 2,
                                                height: 'auto',
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                cursor: (!showAnswers && !isProcessingAnswer) ? 'grab' : 'default',
                                                opacity: isDragging ? 0.3 : (isUsed ? 0.4 : 1),
                                                backgroundColor: isDragging ? '#ff9800' : (isUsed ? '#f5f5f5' : '#667eea'),
                                                color: isDragging ? 'white' : (isUsed ? '#888' : 'white'),
                                                border: '2px solid',
                                                borderColor: isDragging ? '#ff9800' : (isUsed ? '#e0e0e0' : '#667eea'),
                                                transition: 'all 0.2s ease',
                                                transform: isDragging ? 'rotate(-5deg) scale(1.05)' : 'none',
                                                boxShadow: isDragging ? '0 8px 24px rgba(255,152,0,0.4)' : undefined,
                                                '& .MuiChip-label': {
                                                    padding: '8px 16px'
                                                },
                                                '&:hover': {
                                                    backgroundColor: (!isUsed && !showAnswers && !isDragging) ? '#5a67d8' : undefined,
                                                    transform: (!showAnswers && !isProcessingAnswer && !isDragging) ? 'translateY(-2px)' : (isDragging ? 'rotate(-5deg) scale(1.05)' : 'none'),
                                                    boxShadow: (!showAnswers && !isProcessingAnswer && !isDragging) ? '0 4px 20px rgba(0,0,0,0.15)' : (isDragging ? '0 8px 24px rgba(255,152,0,0.4)' : undefined)
                                                },
                                                '&:active': {
                                                    cursor: (!showAnswers && !isProcessingAnswer) ? 'grabbing' : 'default'
                                                }
                                            }}
                                        />
                                    </motion.div>
                                );
                            })}
                        </Box>
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
                                    <Paper
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, tense)}
                                        sx={{
                                            p: 3,
                                            minHeight: 180,
                                            height: 180, // Fixed height for consistent sizing
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            border: '3px dashed',
                                            borderColor: matchedConjugation ? '#667eea' : '#e2e8f0',
                                            backgroundColor: showAnswers 
                                                ? (isCorrect ? '#e8f5e8' : '#ffeaea')
                                                : (matchedConjugation ? '#f0f4ff' : '#fafafa'),
                                            cursor: 'default',
                                            transition: 'all 0.3s ease',
                                            borderRadius: 3,
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                            '&:hover': {
                                                borderColor: '#667eea',
                                                backgroundColor: matchedConjugation ? '#e6ecff' : '#f8faff',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                                            }
                                        }}
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
                                            {TENSE_DISPLAY_NAMES[tense] || tense}
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
                                                <>
                                                    <Chip
                                                        label={`${matchedConjugation.pronoun} ${matchedConjugation.conjugation}`}
                                                        draggable={!showAnswers && !isProcessingAnswer}
                                                        onDragStart={(e) => handleDragStart(e, matchedConjugation)}
                                                        color={showAnswers ? (isCorrect ? 'success' : 'error') : 'primary'}
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            fontSize: '1rem',
                                                            height: 'auto',
                                                            cursor: (!showAnswers && !isProcessingAnswer) ? 'grab' : 'default',
                                                            '& .MuiChip-label': {
                                                                padding: '8px 16px'
                                                            },
                                                            animation: showAnswers ? 'none' : 'pulse 2s infinite',
                                                            '&:hover': {
                                                                transform: (!showAnswers && !isProcessingAnswer) ? 'translateY(-1px)' : 'none',
                                                                boxShadow: (!showAnswers && !isProcessingAnswer) ? '0 2px 8px rgba(0,0,0,0.15)' : undefined
                                                            },
                                                            '&:active': {
                                                                cursor: (!showAnswers && !isProcessingAnswer) ? 'grabbing' : 'default'
                                                            }
                                                        }}
                                                    />

                                                </>
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
                                    </Paper>
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

export default MatchMe;
