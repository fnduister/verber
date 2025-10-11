import { EmojiEvents, Timer } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface GameHeaderProps {
    currentStep: number;
    maxStep: number;
    score: number;
    timeLeft?: number;
    maxTime?: number;
    showTimer?: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({
    currentStep,
    maxStep,
    score,
    timeLeft = 0,
    maxTime = 0,
    showTimer = false
}) => {
    const { t } = useTranslation();
    const progressPercent = ((currentStep + 1) / maxStep) * 100;
    const timePercent = maxTime > 0 ? Math.max(0, (timeLeft / maxTime) * 100) : 100;

    return (
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
                                {t('games.common.questionCount', { current: currentStep + 1, total: maxStep })}
                            </Typography>
                        </Box>
                        <motion.div
                            key={score}
                            initial={{ scale: 1.2, opacity: 0.8 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Chip 
                                label={t('games.common.score', { score })}
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
                    
                    {showTimer && maxTime > 0 && (
                        <motion.div
                            animate={timePercent < 20 ? { scale: [1, 1.02, 1] } : {}}
                            transition={{ duration: 1, repeat: timePercent < 20 ? Infinity : 0 }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Timer sx={{ fontSize: 20 }} />
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {t('games.common.timeRemaining', { time: timeLeft <= 0 ? 0 : Math.ceil(timeLeft) })}
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
    );
};

export default GameHeader;