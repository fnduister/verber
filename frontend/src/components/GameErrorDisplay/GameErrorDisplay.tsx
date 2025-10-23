import { ErrorOutline, Refresh, Settings } from '@mui/icons-material';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface GameErrorDisplayProps {
    hasValidConfig: boolean;
    onRetry?: () => void;
    errorMessage?: string | null;
    onConfigure?: () => void;
}

const GameErrorDisplay: React.FC<GameErrorDisplayProps> = ({ hasValidConfig, onRetry, errorMessage, onConfigure }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 5,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #fef5f5 0%, #fff 100%)',
                        borderTop: '4px solid',
                        borderColor: 'error.main',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Decorative background circles */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -50,
                            right: -50,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: 'rgba(244, 67, 54, 0.05)',
                            pointerEvents: 'none',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: -30,
                            left: -30,
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            background: 'rgba(244, 67, 54, 0.03)',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Error Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <Box
                            sx={{
                                display: 'inline-flex',
                                p: 2,
                                borderRadius: '50%',
                                bgcolor: 'error.light',
                                mb: 2,
                            }}
                        >
                            <ErrorOutline
                                sx={{
                                    fontSize: 64,
                                    color: 'error.main',
                                }}
                            />
                        </Box>
                    </motion.div>

                    {/* Error Title */}
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="error.main"
                        gutterBottom
                        sx={{ position: 'relative', zIndex: 1 }}
                    >
                        {t('games.error.title')}
                    </Typography>

                    {/* Error Message */}
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 1, maxWidth: 500, mx: 'auto', position: 'relative', zIndex: 1 }}
                    >
                        {hasValidConfig
                            ? t('games.error.noData')
                            : t('games.error.invalidConfig')}
                    </Typography>

                    {/* Additional Error Details */}
                    {errorMessage && (
                        <Typography
                            variant="body2"
                            color="text.disabled"
                            sx={{ mb: 3, fontStyle: 'italic', position: 'relative', zIndex: 1 }}
                        >
                            {errorMessage}
                        </Typography>
                    )}

                    {/* Action Buttons */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="center"
                        sx={{ mt: 4, position: 'relative', zIndex: 1 }}
                    >
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<Settings />}
                            onClick={onConfigure}
                            sx={{
                                borderWidth: 2,
                                '&:hover': {
                                    borderWidth: 2,
                                    transform: 'translateY(-2px)',
                                    boxShadow: 2,
                                },
                                transition: 'all 0.2s',
                            }}
                        >
                            {t('games.error.returnToSetup')}
                        </Button>
                        {hasValidConfig && onRetry && (
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Refresh />}
                                onClick={onRetry}
                                sx={{
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 4,
                                    },
                                    transition: 'all 0.2s',
                                }}
                            >
                                {t('games.error.retry')}
                            </Button>
                        )}
                    </Stack>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default GameErrorDisplay;
