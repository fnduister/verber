import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Container,
    Grid,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_COLORS, GAME_TYPES } from '../../constants/gameConstants';
import { RootState } from '../../store/store';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleStartGame = (gameType: string) => {
        // Navigate to GameRoom for game configuration
        // The gameId will be picked up by useParams() in GameRoom  
        navigate(`/game-room/${gameType}`);
    };

    const getDifficultyColor = (difficulty: string) => {
        return DIFFICULTY_COLORS[difficulty] || 'default';
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Main Content */}
            <Container maxWidth="lg">
                <Box sx={{ py: 6 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            {t('dashboard.welcomeBack', { username: user?.username })}
                        </Typography>
                        <Typography variant="h5" component="p" sx={{ mb: 6, color: 'text.secondary' }}>
                            {t('dashboard.chooseGame')}
                        </Typography>
                    </motion.div>

                    <Grid container spacing={3}>
                        {GAME_TYPES.map((game, index) => (
                            <Grid item xs={12} md={6} key={game.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Card 
                                        sx={{ 
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 4,
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Box sx={{ color: game.color, mr: 2 }}>
                                                    {game.icon}
                                                </Box>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                        {t(`games.${game.id}.title`)}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                        <Chip 
                                                            label={t(`games.difficulty.${game.difficulty.toLowerCase()}`)} 
                                                            size="small" 
                                                            color={getDifficultyColor(game.difficulty) as any}
                                                        />
                                                        <Chip label={game.duration} size="small" variant="outlined" />
                                                        <Chip label={game.players} size="small" variant="outlined" />
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Typography variant="body1" color="text.secondary">
                                                {t(`games.${game.id}.description`)}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ p: 3, pt: 0 }}>
                                            <Button 
                                                variant="contained" 
                                                fullWidth
                                                size="large"
                                                onClick={() => handleStartGame(game.id)}
                                                sx={{ 
                                                    backgroundColor: game.color,
                                                    '&:hover': {
                                                        backgroundColor: game.color,
                                                        filter: 'brightness(0.9)',
                                                    }
                                                }}
                                            >
                                                {t('dashboard.startGame')}
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Quick Stats Section */}
                    <Box sx={{ mt: 6 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3 }}>
                                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {user?.level || 1}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('dashboard.currentLevel')}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3 }}>
                                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {user?.xp || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('dashboard.totalXP')}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3 }}>
                                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                        956
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('dashboard.verbsAvailable')}
                                    </Typography>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Dashboard;