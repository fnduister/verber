import { AutoStories } from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Container,
    Divider,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';

const VerbPractice: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            position: 'relative'
        }}>
            <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
                zIndex: 0
            }} />
            
            <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            mb: 1,
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent'
                        }}
                    >
                        {t('study.practice.title')}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 3, color: '#64748b' }}>
                        {t('study.practice.description')}
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card sx={{ 
                        borderRadius: 3,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        textAlign: 'center',
                        py: 8
                    }}>
                        <CardContent>
                            <AutoStories 
                                sx={{ 
                                    fontSize: 120, 
                                    color: '#10b981',
                                    mb: 3,
                                    opacity: 0.3
                                }} 
                            />
                            <Typography variant="h4" sx={{ mb: 2, color: '#64748b' }}>
                                🚧 Coming Soon
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 600, mx: 'auto' }}>
                                This feature is under development. Soon you'll be able to practice specific verbs 
                                with interactive exercises and personalized feedback.
                            </Typography>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};

export default VerbPractice;
