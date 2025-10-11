import { VolumeOff, VolumeUp } from '@mui/icons-material';
import {
    Box,
    Button,
    FormControlLabel,
    Paper,
    Slider,
    Stack,
    Switch,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../hooks/useAudio';

interface AudioSettingsProps {
    compact?: boolean;
    showTitle?: boolean;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ 
    compact = false, 
    showTitle = true 
}) => {
    const { volume, enabled, setVolume, setEnabled, testAudio, isLoading } = useAudio();

    const { t } = useTranslation();

    const handleVolumeChange = (_: Event, newValue: number | number[]) => {
        setVolume(newValue as number);
    };

    const handleTestSuccess = () => {
        console.log('🎛️ AudioSettings: Testing success sound');
        testAudio('success');
    };

    const handleTestFailure = () => {
        console.log('🎛️ AudioSettings: Testing failure sound');
        testAudio('failure');
    };

    if (compact) {
        return (
            <Stack direction="row" spacing={2} alignItems="center">
                <FormControlLabel
                    control={
                        <Switch
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            disabled={isLoading}
                        />
                    }
                    label={t('gameRoom.sound')}
                />
                {enabled && (
                    <>
                        <VolumeOff />
                        <Slider
                            value={volume}
                            onChange={handleVolumeChange}
                            min={0}
                            max={1}
                            step={0.1}
                            sx={{ width: 100 }}
                            disabled={isLoading}
                        />
                        <VolumeUp />
                    </>
                )}
            </Stack>
        );
    }

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            {showTitle && (
                <Typography variant="h6" gutterBottom>
                    Paramètres Audio
                </Typography>
            )}
            
            <Stack spacing={3}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            disabled={isLoading}
                        />
                    }
                    label="Activer les effets sonores"
                />

                {enabled && (
                    <>
                        <Box>
                            <Typography gutterBottom>Volume</Typography>
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
                            <Typography variant="body2" color="text.secondary">
                                Volume: {Math.round(volume * 100)}%
                            </Typography>
                        </Box>

                        <Box>
                            <Typography gutterBottom>Test des sons</Typography>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={handleTestSuccess}
                                    disabled={isLoading}
                                    size="small"
                                >
                                    Tester Succès
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleTestFailure}
                                    disabled={isLoading}
                                    size="small"
                                >
                                    Tester Échec
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        console.log('🔊 Force testing audio with user interaction');
                                        testAudio('success');
                                    }}
                                    disabled={isLoading}
                                    size="small"
                                >
                                    🔊 Test Force
                                </Button>
                            </Stack>
                        </Box>
                    </>
                )}

                {isLoading && (
                    <Typography variant="body2" color="text.secondary">
                        Chargement des fichiers audio...
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
};