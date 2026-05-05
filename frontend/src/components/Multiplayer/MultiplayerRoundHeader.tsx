import { Box, LinearProgress, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface MultiplayerRoundHeaderProps {
    roundNumber: number;
    maxSteps: number;
    subtitle: React.ReactNode;
    timeLeft: number;
    maxTime: number;
}

const MultiplayerRoundHeader: React.FC<MultiplayerRoundHeaderProps> = ({
    roundNumber,
    maxSteps,
    subtitle,
    timeLeft,
    maxTime,
}) => {
    const { t } = useTranslation();
    const progress = Math.min(100, (timeLeft / maxTime) * 100);

    return (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
                {t('games.round')} {roundNumber} / {maxSteps}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {subtitle}
            </Typography>

            <Box sx={{ mt: 2 }}>
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
        </Box>
    );
};

export default MultiplayerRoundHeader;