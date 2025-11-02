import { Add, Close, Refresh } from '@mui/icons-material';
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Container,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Stack, TextField,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { PRONOUNS, TENSE_MAP } from '../../constants';
import {
    PRESET_TENSE_GROUPS,
    SPECIAL_TENSES
} from '../../constants/gameConstants';
import {
    addCustomTenseGroup,
    removeCustomTenseGroup
} from '../../store/slices/gameSlice';
import { fetchTenses, fetchVerbs } from '../../store/slices/verbSlice';
import { AppDispatch, RootState } from '../../store/store';
import { findVerbByInfinitive, getConjugation } from '../../utils/tenseUtils';

const ConjugationTables: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const allVerbs = useSelector((state: RootState) => state.verb.verbs);
    const allTenses = useSelector((state: RootState) => state.verb.tenses);
    const customTenseGroups = useSelector((state: RootState) => state.game.currentCustomTenseGroups);

    const [selectedVerb, setSelectedVerb] = useState<string>('');
    const [selectedTenses, setSelectedTenses] = useState<string[]>([]);
    const [randomTensesEnabled, setRandomTensesEnabled] = useState(false);
    const [randomTensesCount, setRandomTensesCount] = useState(3);
    const [addTenseMode, setAddTenseMode] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const verbOptions = useMemo(() => {
        return allVerbs.map((verb) => verb.infinitive);
    }, [allVerbs]);

    const availableTenses = useMemo(() => {
        return allTenses.filter((tense) => !SPECIAL_TENSES.includes(tense));
    }, [allTenses]);

    useEffect(() => {
        if (allVerbs.length === 0) {
            dispatch(fetchVerbs());
        }
        if (allTenses.length === 0) {
            dispatch(fetchTenses());
        }
    }, [dispatch, allVerbs.length, allTenses.length]);

    const handleDeleteTense = (tense: string) => {
        setSelectedTenses(selectedTenses.filter((t) => t !== tense));
    };

    const handleDeleteTenseGroup = (groupTitle: string) => {
        dispatch(removeCustomTenseGroup(groupTitle));
    };

    const handleSelectTense = (tenses: string[], isSelected: boolean) => {
        if (!isSelected) {
            const newTenses = tenses.filter((t) => !selectedTenses.includes(t));
            setSelectedTenses([...selectedTenses, ...newTenses]);
        } else {
            setSelectedTenses(selectedTenses.filter((t) => !tenses.includes(t)));
        }
    };

    const handleRandomTensesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const enabled = event.target.checked;
        setRandomTensesEnabled(enabled);
        
        if (enabled && availableTenses.length > 0) {
            randomizeTenses();
        }
    };

    const randomizeTenses = () => {
        if (availableTenses.length === 0) return;
        const shuffled = [...availableTenses].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(randomTensesCount, availableTenses.length));
        setSelectedTenses(selected);
    };

    const handleAddTenseGroup = () => {
        if (newGroupName && selectedTenses.length > 0) {
            dispatch(addCustomTenseGroup({ title: newGroupName, tenses: [...selectedTenses] }));
            setNewGroupName('');
            setAddTenseMode(false);
        }
    };

    const getVerbConjugation = (verb: string, tense: string, pronounIndex: number): string => {
        const verbData = findVerbByInfinitive(allVerbs, verb);
        if (!verbData || !verbData.conjugations) {
            return '-';
        }
        
        return getConjugation(verbData.conjugations, tense, pronounIndex) || '-';
    };

    const tensesToDisplay = selectedTenses.length > 0 ? selectedTenses : availableTenses;

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            position: 'relative'
        }}>
            <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
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
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent'
                        }}
                    >
                        {t('study.conjugation.title')}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 3, color: '#64748b' }}>
                        {t('study.conjugation.description')}
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                </motion.div>

                {/* Verb Selection */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card sx={{ 
                        mb: 3,
                        borderRadius: 3,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                    }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                📖 {t('gameRoom.verbSelection')}
                            </Typography>
                            <Autocomplete
                                options={verbOptions}
                                value={selectedVerb}
                                onChange={(_, newValue) => setSelectedVerb(newValue || '')}
                                isOptionEqualToValue={(option, value) => 
                                    option.normalize('NFD') === value.normalize('NFD')
                                }
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label={t('gameRoom.chooseVerbs')} 
                                        placeholder={t('gameRoom.verbsPlaceholder')}
                                    />
                                )}
                            />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tense Selection */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card sx={{ 
                        mb: 4,
                        borderRadius: 3,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                    }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="h6">
                                    ⏰ {t('gameRoom.tenseSelection')}
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    {randomTensesEnabled && (
                                        <>
                                            <TextField
                                                type="number"
                                                label={t('gameRoom.count')}
                                                value={randomTensesCount}
                                                onChange={(e) => setRandomTensesCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 3)))}
                                                size="small"
                                                sx={{ width: 100 }}
                                                InputProps={{ inputProps: { min: 1, max: 20 } }}
                                            />
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<Refresh />}
                                                onClick={randomizeTenses}
                                                color="primary"
                                            >
                                                {t('gameRoom.randomizeAgain')}
                                            </Button>
                                        </>
                                    )}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={randomTensesEnabled}
                                                onChange={handleRandomTensesChange}
                                                color="primary"
                                            />
                                        }
                                        label={t('gameRoom.randomTenses')}
                                    />
                                </Stack>
                            </Stack>

                            <Stack spacing={2}>
                                <Autocomplete
                                    multiple
                                    options={availableTenses}
                                    value={selectedTenses}
                                    onChange={(_, newValue) => setSelectedTenses(newValue)}
                                    filterSelectedOptions
                                    isOptionEqualToValue={(option, value) => 
                                        option.normalize('NFD') === value.normalize('NFD')
                                    }
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            label={t('gameRoom.chooseTenses')} 
                                            placeholder={t('gameRoom.tensesPlaceholder')} 
                                        />
                                    )}
                                    getOptionLabel={(option) => TENSE_MAP[option]?.displayName || option}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                label={TENSE_MAP[option]?.displayName || option}
                                                {...getTagProps({ index })}
                                                onDelete={() => handleDeleteTense(option)}
                                            />
                                        ))
                                    }
                                />

                                {/* Custom Tense Groups */}
                                {customTenseGroups.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                            {t('gameRoom.customGroups')}
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {customTenseGroups.map((group) => {
                                                const isSelected = group.tenses.every((t) => selectedTenses.includes(t));
                                                return (
                                                    <Chip
                                                        key={group.title}
                                                        label={group.title}
                                                        onClick={() => handleSelectTense(group.tenses, isSelected)}
                                                        onDelete={() => handleDeleteTenseGroup(group.title)}
                                                        color={isSelected ? 'primary' : 'default'}
                                                        sx={{ mb: 1 }}
                                                    />
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                )}

                                {/* Preset Tense Groups */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        {t('gameRoom.predefinedGroups')}
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {PRESET_TENSE_GROUPS.map((group) => {
                                            const isSelected = group.tenses.every((t) => selectedTenses.includes(t));
                                            return (
                                                <Chip
                                                    key={group.title}
                                                    label={group.title}
                                                    onClick={() => handleSelectTense(group.tenses, isSelected)}
                                                    color={isSelected ? 'primary' : 'default'}
                                                    sx={{ mb: 1 }}
                                                />
                                            );
                                        })}
                                    </Stack>
                                </Box>

                                {/* Add Tense Group */}
                                {addTenseMode ? (
                                    <Paper sx={{ p: 2 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <TextField
                                                label={t('gameRoom.groupName')}
                                                value={newGroupName}
                                                onChange={(e) => setNewGroupName(e.target.value)}
                                                size="small"
                                                fullWidth
                                            />
                                            <Button 
                                                variant="contained" 
                                                onClick={handleAddTenseGroup} 
                                                disabled={!newGroupName || selectedTenses.length === 0}
                                            >
                                                {t('common.add')}
                                            </Button>
                                            <IconButton onClick={() => setAddTenseMode(false)}>
                                                <Close />
                                            </IconButton>
                                        </Stack>
                                    </Paper>
                                ) : (
                                    <Button 
                                        startIcon={<Add />} 
                                        onClick={() => setAddTenseMode(true)} 
                                        disabled={selectedTenses.length === 0}
                                    >
                                        {t('gameRoom.addTenseGroup')}
                                    </Button>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Conjugation Tables */}
                {selectedVerb && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card sx={{ 
                            borderRadius: 3,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                        }}>
                            <CardContent>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        mb: 3,
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        color: 'transparent'
                                    }}
                                >
                                    📚 {selectedVerb}
                                </Typography>

                                <Grid container spacing={3}>
                                    {tensesToDisplay.map((tense) => (
                                        <Grid item xs={12} md={4} key={tense}>
                                            <Card 
                                                variant="outlined" 
                                                sx={{ 
                                                    height: '100%',
                                                    borderWidth: 2,
                                                    borderColor: '#3b82f6',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                                                        transform: 'translateY(-2px)',
                                                        transition: 'all 0.3s ease'
                                                    }
                                                }}
                                            >
                                                <CardContent>
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            mb: 2,
                                                            pb: 1,
                                                            borderBottom: 2,
                                                            borderColor: '#e0f2fe',
                                                            color: '#3b82f6',
                                                            fontWeight: 'bold',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {TENSE_MAP[tense]?.displayName || tense}
                                                    </Typography>
                                                    <Stack spacing={1}>
                                                        {PRONOUNS.map((pronoun, index) => (
                                                            <Box 
                                                                key={pronoun}
                                                                sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    py: 0.5,
                                                                    px: 1,
                                                                    borderRadius: 1,
                                                                    '&:hover': {
                                                                        backgroundColor: '#f0f9ff'
                                                                    }
                                                                }}
                                                            >
                                                                <Typography 
                                                                    variant="body2" 
                                                                    sx={{ 
                                                                        fontWeight: 'medium', 
                                                                        color: '#64748b',
                                                                        minWidth: 80
                                                                    }}
                                                                >
                                                                    {pronoun}
                                                                </Typography>
                                                                <Typography 
                                                                    variant="body1" 
                                                                    sx={{ 
                                                                        fontWeight: 'bold',
                                                                        color: '#0f172a'
                                                                    }}
                                                                >
                                                                    {getVerbConjugation(selectedVerb, tense, index)}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Empty State */}
                {!selectedVerb && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card sx={{ 
                            borderRadius: 3,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            py: 6
                        }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ color: '#94a3b8', mb: 2 }}>
                                    📖 {t('study.conjugation.selectVerb')}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#cbd5e1' }}>
                                    {t('study.conjugation.selectVerbDescription')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </Container>
        </Box>
    );
};

export default ConjugationTables;
