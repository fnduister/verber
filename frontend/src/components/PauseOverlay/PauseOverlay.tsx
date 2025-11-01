import { PlayArrow } from '@mui/icons-material';
import { Box, Button, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PauseOverlayProps {
    isPaused: boolean;
    onResume: () => void;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ isPaused, onResume }) => {
    const { t } = useTranslation();

    if (!isPaused) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Paper
                    elevation={24}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: 4,
                        minWidth: 400,
                    }}
                >
                    <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold' }}>
                        ⏸️ {t('games.common.paused')}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                        {t('games.common.pauseMessage')}
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrow />}
                        onClick={onResume}
                        sx={{
                            backgroundColor: 'white',
                            color: '#764ba2',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                                backgroundColor: '#f0f0f0',
                            },
                        }}
                    >
                        {t('games.common.resume')}
                    </Button>
                </Paper>
            </motion.div>
        </Box>
    );
};

export default PauseOverlay;
