import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 8, textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Typography variant="h1" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
                        Welcome to Verber
                    </Typography>
                    <Typography variant="h5" component="p" sx={{ mb: 6, color: 'text.secondary' }}>
                        Learn French verbs through interactive games and challenges
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
                            Get Started
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{ px: 4, py: 2 }}
                        >
                            Sign In
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
                                        🎮 Interactive Games
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Learn verbs through fun drag-and-drop games, matching exercises, and interactive challenges.
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
                                        👥 Multiplayer Challenges
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Compete with friends in real-time verb challenges and climb the leaderboards.
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
                                        📈 Track Progress
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Monitor your learning journey with detailed statistics and personalized progress tracking.
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