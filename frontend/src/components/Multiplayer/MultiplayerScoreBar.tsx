import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Avatar, Box, Chip, Grid, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export interface MultiplayerScoreBarProps {
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
    gameMode?: 'find-error' | 'matching';
    sticky?: boolean;
}

const MultiplayerScoreBar: React.FC<MultiplayerScoreBarProps> = ({
    players,
    playersAnswered,
    roundScoreGains,
    roundWinners,
    allPlayersAnswered,
    sticky = false,
}) => {
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const { t } = useTranslation();

    return (
        <Paper
            sx={{
                p: 2,
                mb: 3,
                ...(sticky
                    ? {
                          position: 'sticky',
                          top: { xs: 8, md: 16 },
                          zIndex: 20,
                          backdropFilter: 'blur(6px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      }
                    : {}),
            }}
        >
            <Grid container spacing={2} alignItems="center">
                {players.map((player) => {
                    const noOneWon = roundWinners.includes(-1);
                    const everyoneWon = roundWinners.length > 0 && roundWinners.length === players.length && !noOneWon;
                    const isWinner = roundWinners.includes(player.user_id);
                    const hasAnswered = playersAnswered.has(player.user_id);
                    const scoreGain = roundScoreGains[player.user_id] || 0;

                    // Determine animation type
                    let animation = {};
                    let animationRepeat = 0;

                    if (noOneWon) {
                        // Sad shake animation for everyone
                        animation = {
                            x: [-5, 5, -5, 5, 0],
                            rotate: [-2, 2, -2, 2, 0],
                        };
                        animationRepeat = 2;
                    } else if (everyoneWon) {
                        // Happy bounce for everyone
                        animation = {
                            y: [0, -15, 0],
                            scale: [1, 1.1, 1],
                        };
                        animationRepeat = 3;
                    } else if (isWinner) {
                        // Winner celebration
                        animation = {
                            scale: [1, 1.15, 1],
                            rotate: [0, 5, -5, 0],
                        };
                        animationRepeat = 3;
                    }

                    return (
                        <Grid item xs={12 / players.length} key={player.user_id}>
                            <motion.div
                                animate={animation}
                                transition={{
                                    duration: 0.6,
                                    repeat: animationRepeat,
                                }}
                            >
                                <Box textAlign="center">
                                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                        {/* Avatar with animations */}
                                        <motion.div
                                            animate={hasAnswered ? {
                                                scale: [1, 0.9, 1],
                                                opacity: [1, 0.7, 1],
                                            } : {}}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Avatar
                                                src={player.user.avatar}
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    mx: 'auto',
                                                    mb: 1,
                                                    border: player.user_id === currentUser?.id
                                                        ? '3px solid'
                                                        : hasAnswered
                                                        ? '2px solid'
                                                        : 'none',
                                                    borderColor: player.user_id === currentUser?.id
                                                        ? 'primary.main'
                                                        : 'success.main',
                                                    boxShadow: (isWinner && !noOneWon)
                                                        ? '0 0 25px rgba(255, 215, 0, 0.9)'
                                                        : hasAnswered
                                                        ? '0 0 15px rgba(76, 175, 80, 0.6)'
                                                        : 'none',
                                                    opacity: hasAnswered ? 0.8 : 1,
                                                    filter: hasAnswered ? 'grayscale(30%)' : 'none',
                                                }}
                                            >
                                                {player.user.username[0].toUpperCase()}
                                            </Avatar>
                                        </motion.div>

                                        {/* Winner trophy - only show for actual winners, not when no one won */}
                                        {isWinner && !noOneWon && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: 'spring', stiffness: 200 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                }}
                                            >
                                                <Box sx={{
                                                    bgcolor: everyoneWon ? '#4caf50' : '#FFD700',
                                                    borderRadius: '50%',
                                                    width: 32,
                                                    height: 32,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                                }}>
                                                    <EmojiEventsIcon sx={{ color: 'white', fontSize: 20 }} />
                                                </Box>
                                            </motion.div>
                                        )}

                                        {/* Sad indicator when no one won */}
                                        {noOneWon && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 200 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                }}
                                            >
                                                <Box sx={{
                                                    bgcolor: '#f44336',
                                                    borderRadius: '50%',
                                                    width: 32,
                                                    height: 32,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                                }}>
                                                    <Typography sx={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                                                        ✗
                                                    </Typography>
                                                </Box>
                                            </motion.div>
                                        )}

                                        {/* Waiting indicator */}
                                        {hasAnswered && !allPlayersAnswered && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: -5,
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                }}
                                            >
                                                <Chip
                                                    icon={<CheckCircleIcon />}
                                                    label="✓"
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        bgcolor: 'success.main',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.7rem',
                                                        '& .MuiChip-icon': {
                                                            color: 'white',
                                                            fontSize: 14,
                                                        },
                                                    }}
                                                />
                                            </motion.div>
                                        )}
                                    </Box>

                                    <Typography variant="body2" noWrap sx={{ fontWeight: isWinner ? 'bold' : 'normal' }}>
                                        {player.user.username}
                                    </Typography>

                                    {/* Score with animation */}
                                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                        <Typography
                                            variant="h6"
                                            color="primary"
                                            sx={{
                                                fontWeight: isWinner ? 'bold' : 'normal',
                                                fontSize: isWinner ? '1.5rem' : '1.25rem',
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            {player.score}
                                        </Typography>

                                        {/* Score gain animation */}
                                        {scoreGain > 0 && (
                                            <motion.div
                                                initial={{ y: 0, opacity: 1, scale: 0.5 }}
                                                animate={{ y: -30, opacity: 0, scale: 1.2 }}
                                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                                style={{
                                                    position: 'absolute',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    top: 0,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        color: '#4caf50',
                                                        fontWeight: 'bold',
                                                        fontSize: '1.1rem',
                                                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                    }}
                                                >
                                                    +{scoreGain}
                                                </Typography>
                                            </motion.div>
                                        )}
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>
                    );
                })}
            </Grid>
            {allPlayersAnswered && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Chip
                        icon={<CheckCircleIcon />}
                        label={t('games.multiplayer.allPlayersAnswered')}
                        color="success"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>
            )}
        </Paper>
    );
};

export default MultiplayerScoreBar;
