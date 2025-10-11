import { PlayArrow, VolumeOff, VolumeUp } from '@mui/icons-material';
import {
    Alert, Box,
    Button,
    Card,
    CardContent, Chip, Divider, FormControlLabel, Grid,
    Slider,
    Stack,
    Switch,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useAudio } from '../../hooks/useAudio';
import { audioService } from '../../services/audioService';

export const AudioTester: React.FC = () => {
    const { 
        playSuccess, 
        playFailure, 
        playAudio, 
        setVolume, 
        setEnabled, 
        volume, 
        enabled, 
        isLoading,
        testAudio 
    } = useAudio();

    const [lastPlayed, setLastPlayed] = useState<string>('');

    const handleVolumeChange = (_: Event, newValue: number | number[]) => {
        setVolume(newValue as number);
    };

    const handleTestAudio = async (type: 'success' | 'failure' | 'endgameSuccess' | 'endgameFailure', label: string) => {
        console.log(`🎛️ AudioTester: Testing ${type}`);
        setLastPlayed(label);
        
        switch (type) {
            case 'success':
                await playSuccess(false);
                break;
            case 'failure':
                await playFailure(false);
                break;
            case 'endgameSuccess':
                await playSuccess(true);
                break;
            case 'endgameFailure':
                await playFailure(true);
                break;
            default:
                await testAudio(type);
        }
    };

    const handleDirectAudioTest = async (type: 'success' | 'failure', label: string) => {
        console.log(`🎛️ AudioTester: Direct test ${type}`);
        setLastPlayed(label);
        await playAudio(type);
    };

    const handleDiagnoseAudio = () => {
        console.log('🎛️ Running audio diagnostics...');
        audioService.diagnoseAudio();
    };

    const handleTestAudioAccess = async () => {
        console.log('🎛️ Testing audio file access...');
        await audioService.testAudioAccess();
    };

    return (
        <Card sx={{ p: 3 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🎵 Test Audio System
                    {isLoading && <Chip label="Loading..." size="small" color="warning" />}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Test the game audio feedback system. Make sure your browser allows audio playback.
                </Typography>

                {!enabled && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Audio is currently disabled. Enable it below to test sounds.
                    </Alert>
                )}

                {/* Audio Controls */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Audio Settings</Typography>
                    
                    <Stack spacing={3}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={enabled}
                                    onChange={(e) => setEnabled(e.target.checked)}
                                    disabled={isLoading}
                                />
                            }
                            label={`Audio ${enabled ? 'Enabled' : 'Disabled'}`}
                        />

                        {enabled && (
                            <Box>
                                <Typography gutterBottom>Volume: {Math.round(volume * 100)}%</Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <VolumeOff />
                                    <Slider
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        sx={{ flexGrow: 1 }}
                                        disabled={isLoading}
                                    />
                                    <VolumeUp />
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Audio Tests */}
                <Box>
                    <Typography variant="h6" gutterBottom>Test Sounds</Typography>
                    
                    <Grid container spacing={2}>
                        {/* Game Success Sounds */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card variant="outlined" sx={{ p: 2, backgroundColor: 'success.50' }}>
                                    <Typography variant="subtitle1" color="success.main" gutterBottom>
                                        ✅ Success Sounds
                                    </Typography>
                                    <Stack spacing={1}>
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            startIcon={<PlayArrow />}
                                            onClick={() => handleTestAudio('success', 'Regular Success')}
                                            disabled={isLoading}
                                            fullWidth
                                        >
                                            Regular Success
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            startIcon={<PlayArrow />}
                                            onClick={() => handleTestAudio('endgameSuccess', 'Game Complete Success')}
                                            disabled={isLoading}
                                            fullWidth
                                        >
                                            Game Complete Success
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<PlayArrow />}
                                            onClick={() => handleDirectAudioTest('success', 'Direct Success Test')}
                                            disabled={isLoading}
                                            fullWidth
                                            size="small"
                                        >
                                            Force Play Success
                                        </Button>
                                    </Stack>
                                </Card>
                            </motion.div>
                        </Grid>

                        {/* Game Failure Sounds */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card variant="outlined" sx={{ p: 2, backgroundColor: 'error.50' }}>
                                    <Typography variant="subtitle1" color="error.main" gutterBottom>
                                        ❌ Failure Sounds
                                    </Typography>
                                    <Stack spacing={1}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<PlayArrow />}
                                            onClick={() => handleTestAudio('failure', 'Regular Failure')}
                                            disabled={isLoading}
                                            fullWidth
                                        >
                                            Regular Failure
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<PlayArrow />}
                                            onClick={() => handleTestAudio('endgameFailure', 'Game Over Failure')}
                                            disabled={isLoading}
                                            fullWidth
                                        >
                                            Game Over Failure
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            startIcon={<PlayArrow />}
                                            onClick={() => handleDirectAudioTest('failure', 'Direct Failure Test')}
                                            disabled={isLoading}
                                            fullWidth
                                            size="small"
                                        >
                                            Force Play Failure
                                        </Button>
                                    </Stack>
                                </Card>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Diagnostic Section */}
                <Box>
                    <Typography variant="h6" gutterBottom>Diagnostics</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Use these tools to diagnose audio loading issues. Check the browser console for detailed output.
                    </Typography>
                    
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Button
                            variant="outlined"
                            onClick={handleDiagnoseAudio}
                            size="small"
                        >
                            Check Audio Status
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleTestAudioAccess}
                            size="small"
                        >
                            Test File Access
                        </Button>
                    </Stack>
                </Box>

                {/* Last Played Indicator */}
                {lastPlayed && (
                    <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Last played: <strong>{lastPlayed}</strong>
                        </Typography>
                    </Box>
                )}

                {/* Debug Information */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        💡 <strong>Debug Info:</strong> Open browser console (F12) to see detailed audio logs. 
                        Click any test button above after user interaction to bypass browser autoplay restrictions.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};