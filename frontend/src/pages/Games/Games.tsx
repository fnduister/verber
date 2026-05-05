import {
    EmojiEvents,
    Group,
    Person
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Stack,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Games: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const gamesModes = [
        {
            id: 'singleplayer',
            title: t('games.singlePlayer.title'),
            description: t('games.singlePlayer.description'),
            icon: <Person sx={{ fontSize: 80 }} />,
            color: '#fbbf24',
            gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            path: '/games/singleplayer'
        },
        {
            id: 'multiplayer',
            title: t('games.multiplayer.title'),
            description: t('games.multiplayer.description'),
            icon: <Group sx={{ fontSize: 80 }} />,
            color: '#667eea',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            path: '/games/multiplayer'
        }
    ];

    return (
        <Box sx={{ 
            flexGrow: 1, 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
        }}>
            <Container maxWidth="lg">
                <Box sx={{ py: 8 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Stack alignItems="center" spacing={2} sx={{ mb: 8 }}>
                            <EmojiEvents sx={{ fontSize: 80, color: '#f59e0b' }} />
                            <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                🎮 {t('games.title')}
                            </Typography>
                            <Typography variant="h5" component="p" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 600 }}>
                                {t('games.subtitle')}
                            </Typography>
                        </Stack>
                    </motion.div>

                    <Grid container spacing={4} justifyContent="center">
                        {gamesModes.map((mode, index) => (
                            <Grid item xs={12} md={5} key={mode.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <Card 
                                        sx={{ 
                                            height: '100%',
                                            minHeight: 400,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            background: mode.gradient,
                                            color: mode.id === 'multiplayer' ? 'white' : 'inherit',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: 3,
                                            '&:hover': {
                                                boxShadow: 8,
                                                transform: 'translateY(-8px)',
                                            }
                                        }}
                                        onClick={() => navigate(mode.path)}
                                    >
                                        <CardContent sx={{ 
                                            flexGrow: 1, 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            p: 5,
                                            textAlign: 'center'
                                        }}>
                                            <Box sx={{ 
                                                mb: 3,
                                                color: mode.id === 'multiplayer' ? 'rgba(255,255,255,0.9)' : mode.color
                                            }}>
                                                {mode.icon}
                                            </Box>
                                            <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                                                {mode.title}
                                            </Typography>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    mb: 4,
                                                    opacity: mode.id === 'multiplayer' ? 0.9 : 0.7
                                                }}
                                            >
                                                {mode.description}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                sx={{ 
                                                    px: 6,
                                                    py: 2,
                                                    fontSize: '1.1rem',
                                                    backgroundColor: mode.id === 'multiplayer' ? 'white' : mode.color,
                                                    color: mode.id === 'multiplayer' ? mode.color : 'white',
                                                    '&:hover': {
                                                        backgroundColor: mode.id === 'multiplayer' ? 'rgba(255,255,255,0.9)' : mode.color,
                                                        filter: mode.id === 'multiplayer' ? 'none' : 'brightness(0.9)',
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(mode.path);
                                                }}
                                            >
                                                {t('games.playNow')}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default Games;
