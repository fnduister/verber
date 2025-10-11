import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface GameScoreDialogProps {
    open: boolean;
    onClose: () => void;
    onPlayAgain: () => void;
    score: number;
    maxScore: number;
    correctAnswers: number;
    totalQuestions: number;
    gameName?: string;
}

const GameScoreDialog: React.FC<GameScoreDialogProps> = ({
    open,
    onClose,
    onPlayAgain,
    score,
    maxScore,
    correctAnswers,
    totalQuestions,
    gameName
}) => {
    const { t } = useTranslation();
    
    const successPercentage = Math.floor((score / maxScore) * 100);
    const isGoodScore = successPercentage > 50;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
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
                            {isGoodScore
                                ? t('gameScore.fantastic')
                                : t('gameScore.goodEffort')}
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
                                    {score}
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
                                    label={t('gameScore.successRate', { percentage: successPercentage })}
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
                                    {t('gameScore.correctAnswers', { 
                                        correct: correctAnswers, 
                                        total: totalQuestions 
                                    })}
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
                            onClick={onPlayAgain} 
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
                            🔄 {t('gameScore.playAgain')}
                        </Button>
                    </motion.div>
                    
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                    >
                        <Button 
                            onClick={onClose} 
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
                            🏠 {t('gameScore.backToDashboard')}
                        </Button>
                    </motion.div>
                </DialogActions>
            </motion.div>
        </Dialog>
    );
};

export default GameScoreDialog;