import {
    AutoStories,
    Book
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
import { useNavigate } from 'react-router-dom';

const Study: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const studyOptions = [
        {
            id: 'conjugation',
            title: t('study.conjugation.title'),
            description: t('study.conjugation.description'),
            icon: <Book sx={{ fontSize: 64 }} />,
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            path: '/study/conjugation'
        },
        {
            id: 'practice',
            title: t('study.practice.title'),
            description: t('study.practice.description'),
            icon: <AutoStories sx={{ fontSize: 64 }} />,
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            path: '/study/practice'
        }
    ];

    return (
        <Box sx={{ 
            flexGrow: 1, 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
        }}>
            <Container maxWidth="lg">
                <Box sx={{ py: 6 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                            📚 {t('study.title')}
                        </Typography>
                        <Typography variant="h5" component="p" sx={{ mb: 6, color: 'text.secondary', textAlign: 'center' }}>
                            {t('study.subtitle')}
                        </Typography>
                    </motion.div>

                    <Grid container spacing={4}>
                        {studyOptions.map((option, index) => (
                            <Grid item xs={12} md={6} key={option.id}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                >
                                    <Card 
                                        sx={{ 
                                            height: '100%',
                                            minHeight: 320,
                                            background: option.gradient,
                                            color: 'white',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                                            }
                                        }}
                                    >
                                        <CardActionArea 
                                            onClick={() => navigate(option.path)}
                                            sx={{ height: '100%', p: 4 }}
                                        >
                                            <CardContent sx={{ textAlign: 'center' }}>
                                                <Box sx={{ mb: 3, opacity: 0.9 }}>
                                                    {option.icon}
                                                </Box>
                                                <Typography variant="h3" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                                                    {option.title}
                                                </Typography>
                                                <Typography variant="h6" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                                                    {option.description}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
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

export default Study;
