import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Avatar, Box, Button, Chip, Container, Divider, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';

export interface FinalResultsPlayer {
    user_id: number;
    score: number;
    user: {
        username: string;
        avatar?: string;
        level: number;
    };
}

export interface MultiplayerGameResultsProps {
    players: FinalResultsPlayer[];
}

const MultiplayerGameResults: React.FC<MultiplayerGameResultsProps> = ({ players }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const topPlayer = sortedPlayers[0];

    const getPlayerUsername = (player: FinalResultsPlayer): string => {
        const fallback = (player as unknown as { username?: string }).username;
        return player.user?.username || fallback || `Player ${player.user_id}`;
    };

    const getPlayerAvatar = (player: FinalResultsPlayer): string | undefined => {
        const fallback = (player as unknown as { avatar?: string }).avatar;
        return player.user?.avatar || fallback;
    };

    const getPlayerLevel = (player: FinalResultsPlayer): number => {
        const fallback = (player as unknown as { level?: number }).level;
        return player.user?.level ?? fallback ?? 1;
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 3,
                px: 2,
            }}
        >
            <Container maxWidth="md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        sx={{
                            p: { xs: 2.5, md: 3 },
                            textAlign: 'center',
                            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                            borderRadius: 4,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        }}
                    >
                        {/* Confetti effect */}
                        <Box sx={{ mb: 3 }}>
                            <motion.div
                                animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                }}
                            >
                                <EmojiEventsIcon
                                    sx={{
                                        fontSize: { xs: 72, md: 84 },
                                        color: '#FFD700',
                                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                                    }}
                                />
                            </motion.div>
                        </Box>

                        <Typography
                            variant="h2"
                            gutterBottom
                            sx={{
                                fontWeight: 'bold',
                                color: '#764ba2',
                                fontSize: { xs: '2.2rem', md: '3.1rem' },
                                lineHeight: 1.1,
                            }}
                        >
                            {t('games.multiplayer.gameFinished')}
                        </Typography>

                        {topPlayer && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Box sx={{ mb: 3, mt: 2 }}>
                                    <Typography variant="h5" color="text.secondary" gutterBottom>
                                        🎊 {t('games.multiplayer.winner', 'Winner')} 🎊
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
                                        <Avatar
                                            src={getPlayerAvatar(topPlayer)}
                                            sx={{
                                                width: { xs: 64, md: 72 },
                                                height: { xs: 64, md: 72 },
                                                border: '4px solid #FFD700',
                                                boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
                                            }}
                                        >
                                            {getPlayerUsername(topPlayer)[0].toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#764ba2',
                                                    fontSize: { xs: '2rem', md: '2.4rem' },
                                                }}
                                            >
                                                {getPlayerUsername(topPlayer)}
                                            </Typography>
                                            <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                                {topPlayer.score} {t('games.points')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </motion.div>
                        )}

                        {/* Leaderboard */}
                        <Divider sx={{ my: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#764ba2' }}>
                                {t('games.multiplayer.leaderboard')}
                            </Typography>
                        </Divider>

                        <Box sx={{ mb: 3 }}>
                            {sortedPlayers.map((player, index) => (
                                <motion.div
                                    key={player.user_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <Paper
                                        elevation={index === 0 ? 8 : 2}
                                        sx={{
                                            p: { xs: 1.5, md: 2 },
                                            mb: 1.5,
                                            background:
                                                index === 0
                                                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                                                    : index === 1
                                                    ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
                                                    : index === 2
                                                    ? 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'
                                                    : 'white',
                                            border: player.user_id === currentUser?.id ? '3px solid #667eea' : 'none',
                                            color: index < 3 ? 'white' : 'inherit',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    minWidth: 34,
                                                    opacity: 0.8,
                                                }}
                                            >
                                                #{index + 1}
                                            </Typography>
                                            <Avatar
                                                src={getPlayerAvatar(player)}
                                                sx={{
                                                    width: { xs: 48, md: 54 },
                                                    height: { xs: 48, md: 54 },
                                                    bgcolor: index < 3 ? 'rgba(255,255,255,0.3)' : '#667eea',
                                                    border: index < 3 ? '3px solid rgba(255,255,255,0.5)' : 'none',
                                                }}
                                            >
                                                {getPlayerUsername(player)[0].toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                                    {getPlayerUsername(player)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    {t('games.multiplayer.level', {
                                                        level: getPlayerLevel(player),
                                                        defaultValue: `Level ${getPlayerLevel(player)}`,
                                                    })}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right', minWidth: 110 }}>
                                                {player.user_id === currentUser?.id && (
                                                    <Chip
                                                        label={t('games.multiplayer.you', 'You')}
                                                        size="small"
                                                        sx={{
                                                            mb: 0.75,
                                                            backgroundColor: '#667eea',
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                        }}
                                                    />
                                                )}
                                                <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.8rem', md: '2.1rem' } }}>
                                                    {player.score}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    {t('games.points')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </motion.div>
                            ))}
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={() => navigate('/games/multiplayer')}
                                sx={{
                                    minWidth: 170,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                                    },
                                }}
                            >
                                {t('games.multiplayer.backToLobby')}
                            </Button>
                            <Button variant="outlined" size="medium" onClick={() => navigate('/leaderboard')} sx={{ minWidth: 170 }}>
                                {t('nav.leaderboard')}
                            </Button>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default MultiplayerGameResults;
