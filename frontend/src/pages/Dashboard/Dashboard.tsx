import {
    EmojiEvents,
    GamepadOutlined,
    MenuBook,
    School,
    SportsEsports
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Container,
    Grid,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const mainSections = [
        {
            id: 'study',
            title: t('dashboard.study.title'),
            description: t('dashboard.study.description'),
            icon: <School sx={{ fontSize: 80 }} />,
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            path: '/study'
        },
        {
            id: 'play',
            title: t('dashboard.play.title'),
            description: t('dashboard.play.description'),
            icon: <SportsEsports sx={{ fontSize: 80 }} />,
            color: '#ec4899',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            path: '/games'
        }
    ];

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <Container maxWidth="lg">
                <Box sx={{ py: 6 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                            {t('dashboard.welcomeBack', { username: user?.username })}
                        </Typography>
                        <Typography variant="h5" component="p" sx={{ mb: 6, color: 'text.secondary', textAlign: 'center' }}>
                            {t('dashboard.chooseActivity')}
                        </Typography>
                    </motion.div>

                    {/* Main Sections: Study & Play */}
                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        {mainSections.map((section, index) => (
                            <Grid item xs={12} md={6} key={section.id}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                >
                                    <Card 
                                        sx={{ 
                                            height: '100%',
                                            background: section.gradient,
                                            color: 'white',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                                            }
                                        }}
                                    >
                                        <CardActionArea 
                                            onClick={() => navigate(section.path)}
                                            sx={{ height: '100%', p: 4 }}
                                        >
                                            <CardContent sx={{ textAlign: 'center' }}>
                                                <Box sx={{ mb: 3, opacity: 0.9 }}>
                                                    {section.icon}
                                                </Box>
                                                <Typography variant="h3" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                                                    {section.title}
                                                </Typography>
                                                <Typography variant="h6" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                                                    {section.description}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Quick Stats Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                    <EmojiEvents sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {user?.level || 1}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('dashboard.currentLevel')}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                    <GamepadOutlined sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {user?.xp || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('dashboard.totalXP')}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ textAlign: 'center', p: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                    <MenuBook sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                        956
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('dashboard.verbsAvailable')}
                                    </Typography>
                                </Card>
                            </Grid>
                        </Grid>
                    </motion.div>
                </Box>
            </Container>
        </Box>
    );
};

export default Dashboard;