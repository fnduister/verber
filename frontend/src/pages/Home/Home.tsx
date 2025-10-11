import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';

const Home: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Typography variant="h1" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
                        {isAuthenticated && user?.username 
                            ? `${t('home.welcomeBack')}, ${user.username}!`
                            : t('home.title')
                        }
                    </Typography>
                    <Typography variant="h5" component="p" sx={{ mb: 6, color: 'text.secondary' }}>
                        {t('home.subtitle')}
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Box sx={{ mb: 8 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{ mr: 2, px: 4, py: 2 }}
                        >
                            {t('home.getStarted')}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{ px: 4, py: 2 }}
                        >
                            {t('home.signIn')}
                        </Button>
                    </Box>
                </motion.div>

                <Grid container spacing={4} sx={{ mt: 4 }}>
                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Card sx={{ height: '100%' }}>
                                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="h5" component="h3" sx={{ mb: 2, color: 'primary.main' }}>
                                        {t('home.features.interactiveGames.title')}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {t('home.features.interactiveGames.description')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <Card sx={{ height: '100%' }}>
                                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="h5" component="h3" sx={{ mb: 2, color: 'primary.main' }}>
                                        {t('home.features.multiplayer.title')}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {t('home.features.multiplayer.description')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <Card sx={{ height: '100%' }}>
                                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="h5" component="h3" sx={{ mb: 2, color: 'primary.main' }}>
                                        {t('home.features.trackProgress.title')}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {t('home.features.trackProgress.description')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default Home;