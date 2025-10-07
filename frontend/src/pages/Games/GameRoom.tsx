import { Add, Close } from '@mui/icons-material';
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
    GAME_METADATA,
    GAME_SPEEDS,
    PRESET_TENSE_GROUPS,
    PRESET_VERB_GROUPS,
    SPECIAL_TENSES,
    TENSE_DISPLAY_NAMES
} from '../../constants/gameConstants';
import {
    addCustomTenseGroup,
    addCustomVerbGroup,
    removeCustomTenseGroup,
    removeCustomVerbGroup,
    setCurrentTenses,
    setCurrentVerbs,
    setOngoingGameInfo
} from '../../store/slices/gameSlice';
import { fetchTenses, fetchVerbs } from '../../store/slices/verbSlice';
import { AppDispatch, RootState } from '../../store/store';

const GameRoom = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { gameId } = useParams<{ gameId: string }>();

    const currentVerbs = useSelector((state: RootState) => state.game.currentVerbs);
    const currentTenses = useSelector((state: RootState) => state.game.currentTenses);
    const customVerbGroups = useSelector((state: RootState) => state.game.currentCustomVerbGroups);
    const customTenseGroups = useSelector((state: RootState) => state.game.currentCustomTenseGroups);
    const ongoingGameInfo = useSelector((state: RootState) => state.game.ongoingGameInfo);
    const allVerbs = useSelector((state: RootState) => state.verb.verbs);
    const allTenses = useSelector((state: RootState) => state.verb.tenses);
    const loading = useSelector((state: RootState) => state.verb.loading);

    const [addTenseMode, setAddTenseMode] = useState(false);
    const [addVerbMode, setAddVerbMode] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const currentGame = GAME_METADATA[gameId || 'find-error'] || GAME_METADATA['find-error'];
    const gameType = gameId || 'find-error';
    const verbOptions = useMemo(() => {
        console.log('GameRoom - Computing verb options from', allVerbs.length, 'verbs');
        const options = allVerbs.map((verb) => verb.infinitive);
        console.log('GameRoom - Verb options:', options.slice(0, 10), '...');
        return options;
    }, [allVerbs]);

    // Fetch verbs and tenses when component mounts
    useEffect(() => {
        console.log('GameRoom - Component mounted, checking verbs and tenses');
        console.log('GameRoom - All verbs count:', allVerbs.length);
        console.log('GameRoom - All tenses count:', allTenses.length);

        if (allVerbs.length === 0) {
            console.log('GameRoom - Dispatching fetchVerbs...');
            dispatch(fetchVerbs());
        }
        if (allTenses.length === 0) {
            console.log('GameRoom - Dispatching fetchTenses...');
            dispatch(fetchTenses());
        }
    }, [dispatch, allVerbs.length, allTenses.length]); useEffect(() => {
        if (![5, 10, 15].includes(ongoingGameInfo.maxStep)) {
            dispatch(setOngoingGameInfo({ maxStep: 5 }));
        }
    }, [dispatch, ongoingGameInfo.maxStep]);

    const handleDeleteTense = (tense: string) => {
        dispatch(setCurrentTenses(currentTenses.filter((t) => t !== tense)));
    };

    const handleDeleteVerb = (verb: string) => {
        dispatch(setCurrentVerbs(currentVerbs.filter((v) => v !== verb)));
    };

    const handleDeleteVerbGroup = (groupTitle: string) => {
        dispatch(removeCustomVerbGroup(groupTitle));
    };

    const handleDeleteTenseGroup = (groupTitle: string) => {
        dispatch(removeCustomTenseGroup(groupTitle));
    };

    const handleSelectVerb = (verbs: string[], isSelected: boolean) => {
        if (!isSelected) {
            const newVerbs = verbs.filter((v) => !currentVerbs.includes(v));
            dispatch(setCurrentVerbs([...currentVerbs, ...newVerbs]));
        } else {
            dispatch(setCurrentVerbs(currentVerbs.filter((v) => !verbs.includes(v))));
        }
    };

    const handleSelectTense = (tenses: string[], isSelected: boolean) => {
        if (!isSelected) {
            const newTenses = tenses.filter((t) => !currentTenses.includes(t));
            dispatch(setCurrentTenses([...currentTenses, ...newTenses]));
        } else {
            dispatch(setCurrentTenses(currentTenses.filter((t) => !tenses.includes(t))));
        }
    };

    const canAdvance = () => {
        return currentVerbs.length === 0 || currentTenses.length === 0;
    };

    const handleStepsChange = (event: SelectChangeEvent) => {
        dispatch(setOngoingGameInfo({ maxStep: +event.target.value }));
    };

    const handleSpeedChange = (event: SelectChangeEvent) => {
        dispatch(setOngoingGameInfo({ maxTime: +event.target.value }));
    };

    const getTenses = (): string[] => {
        return gameType !== 'race' ? allTenses.filter((tense) => !SPECIAL_TENSES.includes(tense)) : allTenses;
    };

    const handleAddTenseGroup = () => {
        if (newGroupName && currentTenses.length > 0) {
            dispatch(addCustomTenseGroup({ title: newGroupName, tenses: [...currentTenses] }));
            setNewGroupName('');
            setAddTenseMode(false);
        }
    };

    const handleAddVerbGroup = () => {
        if (newGroupName && currentVerbs.length > 0) {
            dispatch(addCustomVerbGroup({ title: newGroupName, verbs: [...currentVerbs] }));
            setNewGroupName('');
            setAddVerbMode(false);
        }
    };

    // Show loading spinner while fetching data
    console.log('GameRoom - Render check: loading =', loading, ', allVerbs.length =', allVerbs.length);

    if (loading && allVerbs.length === 0) {
        console.log('GameRoom - Showing loading spinner');
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Chargement des verbes et temps...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography sx={{ m: 0, mb: 2, ml: 3, fontWeight: 'bold' }} variant="h4">
                {currentGame.title}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Verbs Selection */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, ml: 3 }}>
                    Sélection des Verbes
                </Typography>
                <Stack spacing={2} sx={{ ml: 3, mr: 3 }}>
                    <Autocomplete
                        multiple
                        options={verbOptions}
                        value={currentVerbs}
                        onChange={(_, newValue) => dispatch(setCurrentVerbs(newValue))}
                        renderInput={(params) => <TextField {...params} label="Choisir les verbes" placeholder="Verbes" />}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option}
                                    {...getTagProps({ index })}
                                    onDelete={() => handleDeleteVerb(option)}
                                />
                            ))
                        }
                    />

                    {/* Custom Verb Groups */}
                    {customVerbGroups.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Groupes personnalisés
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {customVerbGroups.map((group) => {
                                    const isSelected = group.verbs.every((v) => currentVerbs.includes(v));
                                    return (
                                        <Chip
                                            key={group.title}
                                            label={group.title}
                                            onClick={() => handleSelectVerb(group.verbs, isSelected)}
                                            onDelete={() => handleDeleteVerbGroup(group.title)}
                                            color={isSelected ? 'primary' : 'default'}
                                            sx={{ mb: 1 }}
                                        />
                                    );
                                })}
                            </Stack>
                        </Box>
                    )}

                    {/* Preset Verb Groups */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Groupes prédéfinis
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {PRESET_VERB_GROUPS.map((group) => {
                                const isSelected = group.verbs.every((v) => currentVerbs.includes(v));
                                return (
                                    <Chip
                                        key={group.title}
                                        label={group.title}
                                        onClick={() => handleSelectVerb(group.verbs, isSelected)}
                                        color={isSelected ? 'primary' : 'default'}
                                        sx={{ mb: 1 }}
                                    />
                                );
                            })}
                        </Stack>
                    </Box>

                    {/* Add Verb Group */}
                    {addVerbMode ? (
                        <Paper sx={{ p: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <TextField
                                    label="Nom du groupe"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    size="small"
                                    fullWidth
                                />
                                <Button variant="contained" onClick={handleAddVerbGroup} disabled={!newGroupName || currentVerbs.length === 0}>
                                    Ajouter
                                </Button>
                                <IconButton onClick={() => setAddVerbMode(false)}>
                                    <Close />
                                </IconButton>
                            </Stack>
                        </Paper>
                    ) : (
                        <Button startIcon={<Add />} onClick={() => setAddVerbMode(true)} disabled={currentVerbs.length === 0}>
                            Créer un groupe de verbes
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* Tenses Selection */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, ml: 3 }}>
                    Sélection des Temps
                </Typography>
                <Stack spacing={2} sx={{ ml: 3, mr: 3 }}>
                    <Autocomplete
                        multiple
                        options={getTenses()}
                        value={currentTenses}
                        onChange={(_, newValue) => dispatch(setCurrentTenses(newValue))}
                        renderInput={(params) => <TextField {...params} label="Choisir les temps" placeholder="Temps" />}
                        getOptionLabel={(option) => TENSE_DISPLAY_NAMES[option] || option}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={TENSE_DISPLAY_NAMES[option] || option}
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
                                Groupes personnalisés
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {customTenseGroups.map((group) => {
                                    const isSelected = group.tenses.every((t) => currentTenses.includes(t));
                                    return (
                                        <Chip
                                            key={group.title}
                                            label={group.title}
                                            onClick={() => handleSelectTense(group.tenses, isSelected)}
                                            onDelete={() => handleDeleteTenseGroup(group.title)}
                                            color={isSelected ? 'secondary' : 'default'}
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
                            Groupes prédéfinis
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {PRESET_TENSE_GROUPS.map((group) => {
                                const isSelected = group.tenses.every((t) => currentTenses.includes(t));
                                return (
                                    <Chip
                                        key={group.title}
                                        label={group.title}
                                        onClick={() => handleSelectTense(group.tenses, isSelected)}
                                        color={isSelected ? 'secondary' : 'default'}
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
                                    label="Nom du groupe"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    size="small"
                                    fullWidth
                                />
                                <Button variant="contained" onClick={handleAddTenseGroup} disabled={!newGroupName || currentTenses.length === 0}>
                                    Ajouter
                                </Button>
                                <IconButton onClick={() => setAddTenseMode(false)}>
                                    <Close />
                                </IconButton>
                            </Stack>
                        </Paper>
                    ) : (
                        <Button startIcon={<Add />} onClick={() => setAddTenseMode(true)} disabled={currentTenses.length === 0}>
                            Créer un groupe de temps
                        </Button>
                    )}
                </Stack>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, ml: 3 }}>
                    Paramètres du jeu
                </Typography>
                <Stack direction="row" spacing={2} sx={{ ml: 3, mr: 3 }}>
                    <FormControl variant="filled" sx={{ minWidth: 200 }}>
                        <InputLabel>Nombre de questions</InputLabel>
                        <Select value={ongoingGameInfo.maxStep.toString()} onChange={handleStepsChange}>
                            <MenuItem value="5">5 questions</MenuItem>
                            <MenuItem value="10">10 questions</MenuItem>
                            <MenuItem value="15">15 questions</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl variant="filled" sx={{ minWidth: 200 }}>
                        <InputLabel>Vitesse</InputLabel>
                        <Select value={ongoingGameInfo.maxTime.toString()} onChange={handleSpeedChange}>
                            {GAME_SPEEDS.map((speed) => (
                                <MenuItem key={speed.value} value={speed.value}>
                                    {speed.name} ({speed.value}s)
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                    disabled={canAdvance()}
                    sx={{ minWidth: 150 }}
                    size="large"
                    component={Link}
                    to={'/games/' + currentGame.url}
                    variant="contained"
                    color="warning"
                >
                    Commencer
                </Button>
            </Box>
        </Container>
    );
};

export default GameRoom;
