import { Box, Button, Grid, LinearProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface FindErrorGameData {
    sentence?: string;
    error: string;
    visibleWords: string[];
    stepTense: string;
    correctAnswer: string;
    verb?: string;
    tense?: string;
}

interface FindErrorGameplayProps {
    gameData: FindErrorGameData;
    selectedWord: string | null;
    hasAnswered: boolean;
    timeLeft: number;
    maxTime: number;
    currentRound?: number;
    maxRounds?: number;
    onSelectWord: (word: string) => void;
    onSubmit: () => void;
    showTimer?: boolean;
    showRoundInfo?: boolean;
}

const FindErrorGameplay: React.FC<FindErrorGameplayProps> = ({
    gameData,
    selectedWord,
    hasAnswered,
    timeLeft,
    maxTime,
    currentRound,
    maxRounds,
    onSelectWord,
    onSubmit,
    showTimer = true,
    showRoundInfo = true,
}) => {
    const { t } = useTranslation();
    const progress = (timeLeft / maxTime) * 100;

    return (
        <Box>
            {/* Round info */}
            {showRoundInfo && currentRound && maxRounds && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        {t('games.round')} {currentRound} / {maxRounds}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {t('findError.findTheError')} ({gameData.stepTense})
                    </Typography>
                </Box>
            )}

            {/* Timer */}
            {showTimer && (
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                            {t('timeLeft')}: {timeLeft}s
                        </Typography>
                        <Typography variant="body2">{progress.toFixed(0)}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        color={timeLeft < 10 ? 'error' : 'primary'}
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                </Box>
            )}

            {/* Sentence display (if available) */}
            {gameData.sentence && (
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ 
                        fontWeight: 'bold',
                        color: 'text.primary',
                        p: 3,
                        background: 'linear-gradient(145deg, #f0f4f8, #d6e4ed)',
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: 'primary.light'
                    }}>
                        {gameData.sentence}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                        {t('findError.findTheError')}
                    </Typography>
                </Box>
            )}

            {/* Words */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {gameData.visibleWords.map((word, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                        <motion.div whileHover={{ scale: hasAnswered ? 1 : 1.05 }}>
                            <Button
                                fullWidth
                                variant={selectedWord === word ? 'contained' : 'outlined'}
                                color={
                                    hasAnswered
                                        ? word === gameData.correctAnswer
                                            ? 'success'
                                            : word === selectedWord
                                            ? 'error'
                                            : 'inherit'
                                        : 'primary'
                                }
                                onClick={() => onSelectWord(word)}
                                disabled={hasAnswered}
                                sx={{ p: 2, fontSize: '1.2rem' }}
                            >
                                {word}
                            </Button>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Submit button */}
            {!hasAnswered && (
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={onSubmit}
                    disabled={!selectedWord}
                >
                    {t('common.submit')}
                </Button>
            )}
        </Box>
    );
};

export default FindErrorGameplay;
