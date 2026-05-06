import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Avatar, Box, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';

interface MultiplayerGameScaffoldProps {
    gameTitle: string;
    gameTypeIcon?: React.ReactNode;
    gameTypeDescription?: React.ReactNode;
    gameTypeColor?: string;
    roundNumber: number;
    maxSteps: number;
    subtitle: React.ReactNode;
    timeLeft: number;
    maxTime: number;
    players: Array<{
        user_id: number;
        score: number;
        user: {
            username: string;
            avatar?: string;
            level?: number;
        };
    }>;
    playersAnswered: Set<number>;
    roundScoreGains: Record<number, number>;
    roundWinners: number[];
    allPlayersAnswered: boolean;
    contextNode?: React.ReactNode;
    actionNode: React.ReactNode;
    contextMinHeight?: number;
    actionMinHeight?: number;
}

export default function MultiplayerGameScaffold({
    gameTitle,
    gameTypeIcon,
    gameTypeDescription,
    gameTypeColor = '#4f46e5',
    roundNumber,
    maxSteps,
    subtitle,
    timeLeft,
    maxTime,
    players,
    playersAnswered,
    roundScoreGains,
    roundWinners,
    allPlayersAnswered,
    contextNode,
    actionNode,
    contextMinHeight = 0,
    actionMinHeight = 0,
}: MultiplayerGameScaffoldProps) {
    const progress = Math.min(100, (timeLeft / maxTime) * 100);
    const resolvedGameTypeDescription = gameTypeDescription ?? (typeof subtitle === 'string' ? subtitle : null);
    const normalizedGameTitle = gameTitle.replace(/^\s*[^\p{L}\p{N}]+\s*/u, '');

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 2fr 1fr' },
                    gap: 2,
                    mb: 2.5,
                    alignItems: 'stretch',
                }}
            >
                <Paper
                    sx={{
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderTop: '4px solid',
                        borderTopColor: gameTypeColor,
                        background: (theme) => `linear-gradient(180deg, ${alpha(gameTypeColor, 0.1)} 0%, ${theme.palette.background.paper} 45%)`,
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: 420, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: gameTypeColor,
                                backgroundColor: (theme) => alpha(gameTypeColor, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: gameTypeColor,
                                flexShrink: 0,
                            }}
                        >
                            {gameTypeIcon ?? <SportsEsportsIcon fontSize="medium" />}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1, mb: 0.75, color: gameTypeColor }}>
                                {normalizedGameTitle}
                            </Typography>
                            {resolvedGameTypeDescription && (
                                <>
                                    <Box sx={{ height: 1, backgroundColor: (theme) => alpha(gameTypeColor, 0.4), mb: 0.75 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                        {resolvedGameTypeDescription}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                </Paper>

                <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stack direction="row" spacing={2.5} justifyContent="center" useFlexGap flexWrap="wrap">
                        {players.map((player) => (
                            <Box key={player.user_id} textAlign="center">
                                <Avatar src={player.user.avatar} sx={{ width: 40, height: 40, mx: 'auto', mb: 0.25 }}>
                                    {player.user.username[0].toUpperCase()}
                                </Avatar>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.1 }}>
                                    {player.user.username}
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1, color: gameTypeColor }}>
                                    {player.score}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Paper>

                <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Round Status
                        </Typography>
                        <Chip
                            label={`${roundNumber} / ${maxSteps}`}
                            sx={{
                                height: 54,
                                px: 1.5,
                                borderRadius: 27,
                                '& .MuiChip-label': {
                                    fontSize: '1.7rem',
                                    fontWeight: 900,
                                    lineHeight: 1,
                                },
                            }}
                        />
                    </Box>
                </Paper>
            </Box>

            <Paper
                sx={{
                    p: 2.5,
                    mb: 2.5,
                    border: '1px solid',
                    borderColor: (theme) => alpha(gameTypeColor, 0.18),
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">timeLeft: {Math.ceil(timeLeft)}s</Typography>
                    <Typography variant="body2">{progress.toFixed(0)}%</Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    color={timeLeft < 10 ? 'error' : 'primary'}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: (theme) => alpha(gameTypeColor, 0.25),
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: (theme) => (timeLeft < 10 ? theme.palette.error.main : gameTypeColor),
                        },
                    }}
                />
            </Paper>

            <Paper
                sx={{
                    p: { xs: 2, md: 2.5 },
                    border: '1px solid',
                    borderColor: (theme) => alpha(gameTypeColor, 0.16),
                    background: (theme) => `linear-gradient(180deg, ${alpha(gameTypeColor, 0.03)} 0%, ${theme.palette.background.paper} 30%)`,
                    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
                }}
            >
                {!resolvedGameTypeDescription && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5, textAlign: 'center' }}>
                        {subtitle}
                    </Typography>
                )}

                {contextNode && (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: { xs: 1.5, md: 2 },
                            mb: 1.5,
                            borderRadius: 2,
                            minHeight: contextMinHeight,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            borderColor: (theme) => alpha(gameTypeColor, 0.26),
                            borderWidth: 1,
                            backgroundColor: (theme) => alpha(gameTypeColor, 0.02),
                        }}
                    >
                        {contextNode}
                    </Paper>
                )}

                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 1.5, md: 2 },
                        borderRadius: 2,
                        minHeight: actionMinHeight,
                        borderColor: (theme) => alpha(gameTypeColor, 0.22),
                        borderWidth: 1,
                    }}
                >
                    {actionNode}
                </Paper>
            </Paper>
        </Box>
    );
}
