import {
    Add, FiberManualRecord, FilterList,
    Group, PersonAdd, Refresh,
    Search,
    Timer
} from '@mui/icons-material';
import {
    Alert,
    Avatar, Badge, Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import InvitePopup from '../../../components/Invites/InvitePopup';
import { DIFFICULTY_COLORS, GAME_TYPES } from '../../../constants/gameConstants';
import { Invite, inviteAPI, userAPI } from '../../../services/api';
import { multiplayerAPI, MultiplayerGame } from '../../../services/multiplayerApi';
import { RootState } from '../../../store/store';

interface Player {
    id: number;
    username: string;
    avatar: string;
    level: number;
    is_online: boolean;
}

const Multiplayer: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const currentVerbs = useSelector((state: RootState) => state.verb.verbs);
    const currentTenses = useSelector((state: RootState) => state.verb.tenses);
    
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [waitingRooms, setWaitingRooms] = useState<MultiplayerGame[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<MultiplayerGame[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);
    const [offlinePlayers, setOfflinePlayers] = useState<Player[]>([]);
    const [currentInvite, setCurrentInvite] = useState<Invite | null>(null);
    const [invitePopupOpen, setInvitePopupOpen] = useState(false);
    const [sendingInvite, setSendingInvite] = useState<number | null>(null);
    const [inviteSentSnackbar, setInviteSentSnackbar] = useState(false);
    const [invitedPlayerName, setInvitedPlayerName] = useState('');
    
    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGameType, setFilterGameType] = useState('all');
    const [filterPlayers, setFilterPlayers] = useState('all');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    
    // Create game form state
    const [newGameTitle, setNewGameTitle] = useState('');
    const [selectedGameType, setSelectedGameType] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [difficulty, setDifficulty] = useState('medium');
    const [duration, setDuration] = useState(10);

    const fetchWaitingRooms = async () => {
        setIsLoading(true);
        try {
            const games = await multiplayerAPI.getWaitingRooms();
            // Only show find-error games (other types not yet supported)
            const supportedGames = (games || []).filter(game => game.game_type === 'find-error');
            setWaitingRooms(supportedGames);
        } catch (error: any) {
            console.error('Failed to fetch waiting rooms:', error);
            if (error?.response?.status === 401) {
                // Token expired or invalid, redirect to login
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecentPlayers = async () => {
        try {
            // Fetch authoritative online users from hub/presence
            const onlineResponse = await userAPI.getOnlineUsers();
            setOnlinePlayers(onlineResponse.data.online || []);
            
            // Fetch recent players for offline list
            const recentResponse = await userAPI.getRecentPlayers(20);
            setOfflinePlayers(recentResponse.data.offline || []);
        } catch (error) {
            console.error('Failed to fetch players:', error);
        }
    };

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No auth token found, redirecting to login');
            navigate('/login');
            return;
        }
    }, [navigate]);

    useEffect(() => {
        fetchWaitingRooms();
        fetchRecentPlayers();
        // Presence ping interval
        const ping = async () => {
            try { await userAPI.presencePing(); } catch (e) { /* silent */ }
        };
        ping();
        const interval = setInterval(ping, 30000); // every 30s
        
        // WebSocket connection for invites and presence updates with reconnection
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('Multiplayer: No auth token yet, skipping WS connect. Will retry when user is available.');
            return () => {
                clearInterval(interval);
            };
        }
        // Use the same base URL as API calls
        const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
        const wsBaseUrl = apiBaseUrl.replace('http://', 'ws://').replace('https://', 'wss://').replace('/api', '');
        const wsUrl = `${wsBaseUrl}/ws/multiplayer?token=${token}`;
        console.log('Connecting to WebSocket:', wsUrl);
        let reconnectAttempts = 0;
        let ws: WebSocket | null = null;

        const connectWS = () => {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                reconnectAttempts = 0;
                console.log('Connected to multiplayer WebSocket for invites and presence');
                // Initial refresh when socket connects
                fetchRecentPlayers();
                fetchWaitingRooms();
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    const payload = message.data || message.payload;

                    if (message.type === 'invite_received' && payload) {
                        setCurrentInvite(payload);
                        setInvitePopupOpen(true);
                    }

                    if (message.type === 'presence_update' && payload) {
                        console.log('Presence update received:', payload);
                        fetchRecentPlayers();
                        fetchWaitingRooms();
                    }

                    if (message.type === 'game_created' || message.type === 'game_updated') {
                        console.log('Game list update received:', message.type);
                        fetchWaitingRooms();
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                console.error('WebSocket URL was:', wsUrl);
                console.error('WebSocket readyState:', ws?.readyState);
            };

            ws.onclose = () => {
                reconnectAttempts += 1;
                const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
                console.warn(`WebSocket closed; reconnecting in ${delay}ms`);
                setTimeout(connectWS, delay);
            };
        };

        connectWS();

        return () => {
            clearInterval(interval);
            if (ws) ws.close();
        };
    }, [currentUser]);

    useEffect(() => {
        // Apply filters
        let filtered = [...waitingRooms];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(room =>
                room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.host.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Game type filter
        if (filterGameType !== 'all') {
            filtered = filtered.filter(room => room.game_type === filterGameType);
        }

        // Players filter
        if (filterPlayers !== 'all') {
            if (filterPlayers === 'available') {
                filtered = filtered.filter(room => room.players.length < room.max_players);
            } else if (filterPlayers === 'full') {
                filtered = filtered.filter(room => room.players.length >= room.max_players);
            }
        }

        // Difficulty filter
        if (filterDifficulty !== 'all') {
            filtered = filtered.filter(room => room.difficulty.toLowerCase() === filterDifficulty);
        }

        setFilteredRooms(filtered);
    }, [waitingRooms, searchQuery, filterGameType, filterPlayers, filterDifficulty]);

    const handleCreateGame = () => {
        if (!newGameTitle.trim() || !selectedGameType) {
            return;
        }
        // Store game creation data in session storage
        sessionStorage.setItem('multiplayerGameData', JSON.stringify({
            title: newGameTitle.trim(),
            game_type: selectedGameType,
            max_players: maxPlayers,
            difficulty,
            duration,
        }));
        
        // Navigate to game room for configuration
        navigate(`/game-room/${selectedGameType}?mode=multiplayer`);
        setOpenCreateDialog(false);
    };

    const handleJoinRoom = async (gameId: string) => {
        try {
            const game = waitingRooms.find(r => r.id === gameId);
            
            // Check if game type is supported for multiplayer
            if (game?.game_type !== 'find-error') {
                alert(`Multiplayer mode for "${game?.game_type}" is not yet available. Only "Find Error" is currently supported.`);
                return;
            }

            await multiplayerAPI.joinGame(gameId);
            
            // Navigate to multiplayer game room
            navigate(`/games/multiplayer/find-error/${gameId}`);
        } catch (error: any) {
            console.error('Failed to join game:', error);
            if (error?.response?.status === 400 && error?.response?.data?.error?.includes('already in game')) {
                // Player already joined, navigate to game
                navigate(`/games/multiplayer/find-error/${gameId}`);
            } else {
                alert('Failed to join game: ' + (error?.response?.data?.error || error.message || 'Unknown error'));
            }
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        return DIFFICULTY_COLORS[difficulty] || 'default';
    };

    const getGameInfo = (gameType: string) => {
        return GAME_TYPES.find(g => g.id === gameType);
    };

    const handleInvitePlayer = async (playerId: number) => {
        if (!waitingRooms[0]) {
            alert('Create or join a game first before inviting players');
            return;
        }

        // Check if player is already in the game
        const game = waitingRooms[0];
        const isPlayerInGame = game.players?.some(p => p.user_id === playerId);
        if (isPlayerInGame) {
            alert('This player is already in the game!');
            return;
        }

        setSendingInvite(playerId);
        try {
            await inviteAPI.sendInvite(playerId, waitingRooms[0].id);
            // Find player name for success message
            const player = onlinePlayers.find(p => p.id === playerId);
            setInvitedPlayerName(player?.username || 'Player');
            setInviteSentSnackbar(true);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to send invite');
        } finally {
            setSendingInvite(null);
        }
    };

    const handleAcceptInvite = async (inviteId: number) => {
        try {
            const response = await inviteAPI.acceptInvite(inviteId);
            const invite = response.data;
            // Join the game
            if (invite.game_id) {
                await handleJoinRoom(invite.game_id);
            }
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to accept invite');
        }
    };

    const handleDeclineInvite = async (inviteId: number) => {
        try {
            await inviteAPI.declineInvite(inviteId);
        } catch (error: any) {
            console.error('Failed to decline invite:', error);
        }
    };

    // WebSocket listener for invite notifications
    useEffect(() => {
        // TODO: Add WebSocket connection and listener for 'invite_received' events
        // For now, this is a placeholder
        const handleInviteReceived = (data: any) => {
            setCurrentInvite(data);
            setInvitePopupOpen(true);
        };

        // When WebSocket is implemented, add listener here
        // ws.on('invite_received', handleInviteReceived);

        return () => {
            // Cleanup WebSocket listener
        };
    }, []);

    return (
        <Box sx={{ 
            flexGrow: 1, 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <Container maxWidth="lg">
                <Box sx={{ py: 6 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
                            👥 {t('games.multiplayer.title')}
                        </Typography>
                        <Typography variant="h5" component="p" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
                            {t('games.multiplayer.subtitle')}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/games')}
                                sx={{ 
                                    mr: 2,
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    '&:hover': {
                                        borderColor: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                ← {t('common.back')}
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/games/singleplayer')}
                                sx={{ 
                                    backgroundColor: 'white',
                                    color: '#764ba2',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                    }
                                }}
                            >
                                {t('games.singlePlayer.switchTo')} →
                            </Button>
                        </Box>
                    </motion.div>

                    <Grid container spacing={3}>
                        {/* Players Sidebar */}
                        <Grid item xs={12} md={3}>
                            <Stack spacing={2}>
                                {/* Online Players Box */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <Paper sx={{ p: 2, position: 'sticky', top: 16 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <FiberManualRecord sx={{ mr: 1, color: '#4ade80', fontSize: 16 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1, fontSize: '1rem' }}>
                                                {t('games.multiplayer.onlinePlayers')} ({onlinePlayers.length})
                                            </Typography>
                                            <IconButton size="small" onClick={fetchRecentPlayers}>
                                                <Refresh fontSize="small" />
                                            </IconButton>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        
                                        {onlinePlayers.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                                {t('games.multiplayer.noOnlinePlayers')}
                                            </Typography>
                                        ) : (
                                            <List dense>
                                                {onlinePlayers.map((player) => (
                                                    <ListItem key={player.id} sx={{ px: 0 }}>
                                                        <ListItemAvatar>
                                                            <Badge
                                                                overlap="circular"
                                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                                badgeContent={
                                                                    <FiberManualRecord 
                                                                        sx={{ 
                                                                            color: '#4ade80',
                                                                            fontSize: 12,
                                                                            border: '2px solid white',
                                                                            borderRadius: '50%'
                                                                        }} 
                                                                    />
                                                                }
                                                            >
                                                                <Avatar 
                                                                    src={player.avatar} 
                                                                    sx={{ width: 36, height: 36 }}
                                                                >
                                                                    {player.username[0].toUpperCase()}
                                                                </Avatar>
                                                            </Badge>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={player.username}
                                                            secondary={t('games.multiplayer.level', { level: player.level })}
                                                            primaryTypographyProps={{ 
                                                                variant: 'body2',
                                                                fontWeight: 500 
                                                            }}
                                                            secondaryTypographyProps={{ 
                                                                variant: 'caption' 
                                                            }}
                                                        />
                                                        {currentUser && player.id !== currentUser.id && (
                                                            <Tooltip title="Invite to game">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleInvitePlayer(player.id)}
                                                                    disabled={sendingInvite === player.id}
                                                                    sx={{
                                                                        color: 'primary.main',
                                                                        '&:hover': { bgcolor: 'primary.light' }
                                                                    }}
                                                                >
                                                                    <PersonAdd fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </ListItem>
                                                ))}
                                            </List>
                                        )}
                                    </Paper>
                                </motion.div>

                                {/* Offline Players Box */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <Paper sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <FiberManualRecord sx={{ mr: 1, color: '#9ca3af', fontSize: 16 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                                {t('games.multiplayer.offlinePlayers')} ({offlinePlayers.length})
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        
                                        {offlinePlayers.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                                {t('games.multiplayer.noOfflinePlayers')}
                                            </Typography>
                                        ) : (
                                            <List dense>
                                                {offlinePlayers.map((player) => (
                                                    <ListItem key={player.id} sx={{ px: 0 }}>
                                                        <ListItemAvatar>
                                                            <Avatar 
                                                                src={player.avatar} 
                                                                sx={{ 
                                                                    width: 36, 
                                                                    height: 36,
                                                                    opacity: 0.6 
                                                                }}
                                                            >
                                                                {player.username[0].toUpperCase()}
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={player.username}
                                                            secondary={t('games.multiplayer.level', { level: player.level })}
                                                            primaryTypographyProps={{ 
                                                                variant: 'body2',
                                                                fontWeight: 500,
                                                                sx: { opacity: 0.7 }
                                                            }}
                                                            secondaryTypographyProps={{ 
                                                                variant: 'caption',
                                                                sx: { opacity: 0.6 }
                                                            }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        )}
                                    </Paper>
                                </motion.div>
                            </Stack>
                        </Grid>

                        {/* Main Content */}
                        <Grid item xs={12} md={9}>
                            <Stack spacing={3}>
                                {/* Create New Game Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <Card>
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Add sx={{ fontSize: 40, color: '#667eea', mr: 2 }} />
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {t('games.multiplayer.createNew')}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('games.multiplayer.createDescription')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                startIcon={<Add />}
                                                onClick={() => setOpenCreateDialog(true)}
                                                sx={{ 
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                                                    }
                                                }}
                                            >
                                                {t('games.multiplayer.createButton')}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Filters and Search */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                    <Paper sx={{ p: 2 }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} md={4}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    placeholder={t('games.multiplayer.searchPlaceholder')}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Search />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4} md={2}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Game Type</InputLabel>
                                                    <Select
                                                        value={filterGameType}
                                                        label="Game Type"
                                                        onChange={(e) => setFilterGameType(e.target.value)}
                                                    >
                                                        <MenuItem value="all">{t('games.multiplayer.allTypes')}</MenuItem>
                                                        {GAME_TYPES.map((game) => (
                                                            <MenuItem key={game.id} value={game.id}>
                                                                {t(`games.${game.id}.title`)}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={4} md={2}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Players</InputLabel>
                                                    <Select
                                                        value={filterPlayers}
                                                        label="Players"
                                                        onChange={(e) => setFilterPlayers(e.target.value)}
                                                    >
                                                        <MenuItem value="all">{t('games.multiplayer.allGames')}</MenuItem>
                                                        <MenuItem value="available">{t('games.multiplayer.hasSpace')}</MenuItem>
                                                        <MenuItem value="full">{t('games.multiplayer.full')}</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={4} md={2}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Difficulty</InputLabel>
                                                    <Select
                                                        value={filterDifficulty}
                                                        label="Difficulty"
                                                        onChange={(e) => setFilterDifficulty(e.target.value)}
                                                    >
                                                        <MenuItem value="all">{t('games.multiplayer.allLevels')}</MenuItem>
                                                        <MenuItem value="easy">{t('games.difficulty.easy')}</MenuItem>
                                                        <MenuItem value="medium">{t('games.difficulty.medium')}</MenuItem>
                                                        <MenuItem value="hard">{t('games.difficulty.hard')}</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={12} md={2}>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title={t('common.refresh')}>
                                                        <IconButton onClick={fetchWaitingRooms} disabled={isLoading} size="small">
                                                            <Refresh />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Chip 
                                                        icon={<FilterList />}
                                                        label={t('games.multiplayer.gamesCount', { count: filteredRooms.length })}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </motion.div>

                                {/* Available Games */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                >
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                                {t('games.multiplayer.waitingRooms')}
                                            </Typography>
                                            
                                            {filteredRooms.length === 0 ? (
                                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                                    <Group sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                                        {waitingRooms.length === 0 
                                                            ? t('games.multiplayer.noWaitingRooms')
                                                            : t('games.multiplayer.noMatchingGames')
                                                        }
                                                    </Typography>
                                                    {waitingRooms.length === 0 && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                            {t('games.multiplayer.beFirstToCreate')}
                                                        </Typography>
                                                    )}
                                                    {waitingRooms.length > 0 && (
                                                        <Button
                                                            variant="outlined"
                                                            onClick={() => {
                                                                setSearchQuery('');
                                                                setFilterGameType('all');
                                                                setFilterPlayers('all');
                                                                setFilterDifficulty('all');
                                                            }}
                                                        >
                                                            {t('games.multiplayer.clearFilters')}
                                                        </Button>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Grid container spacing={2}>
                                                    {filteredRooms.map((room) => {
                                                        const gameInfo = getGameInfo(room.game_type);
                                                        return (
                                                            <Grid item xs={12} sm={6} md={4} lg={2} key={room.id}>
                                                                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                                    <CardContent sx={{ flexGrow: 1 }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                                                            <Box sx={{ flexGrow: 1 }}>
                                                                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                                                                    {room.title}
                                                                                </Typography>
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    {t('games.multiplayer.hostedBy', { name: room.host.username })}
                                                                                </Typography>
                                                                            </Box>
                                                                            {gameInfo && (
                                                                                <Box sx={{ color: gameInfo.color, fontSize: 32 }}>
                                                                                    {gameInfo.icon}
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                        
                                                                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                                            <Chip 
                                                                                icon={<Group />}
                                                                                label={`${room.players.length}/${room.max_players}`}
                                                                                size="small"
                                                                                color={room.players.length === room.max_players ? 'error' : 'primary'}
                                                                            />
                                                                            <Chip 
                                                                                label={t(`games.difficulty.${room.difficulty.toLowerCase()}`)}
                                                                                size="small"
                                                                                color={getDifficultyColor(room.difficulty) as any}
                                                                            />
                                                                            <Chip 
                                                                                icon={<Timer />}
                                                                                label={`${Math.floor(room.config.max_time / 60)} min`}
                                                                                size="small"
                                                                                variant="outlined"
                                                                            />
                                                                        </Stack>
                                                                    </CardContent>
                                                                    <CardActions sx={{ px: 2, pb: 2 }}>
                                                                        <Button
                                                                            variant="contained"
                                                                            fullWidth
                                                                            onClick={() => handleJoinRoom(room.id)}
                                                                            disabled={room.players.length >= room.max_players}
                                                                            sx={{
                                                                                backgroundColor: gameInfo?.color || '#667eea',
                                                                                '&:hover': {
                                                                                    backgroundColor: gameInfo?.color || '#667eea',
                                                                                    filter: 'brightness(0.9)',
                                                                                }
                                                                            }}
                                                                        >
                                                                            {room.players.length >= room.max_players 
                                                                                ? t('games.multiplayer.roomFull')
                                                                                : t('games.multiplayer.joinRoom')
                                                                            }
                                                                        </Button>
                                                                    </CardActions>
                                                                </Card>
                                                            </Grid>
                                                        );
                                                    })}
                                                </Grid>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Container>

            {/* Create Game Dialog */}
            <Dialog 
                open={openCreateDialog} 
                onClose={() => setOpenCreateDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}>
                    {t('games.multiplayer.createNew')}
                </DialogTitle>
                <DialogContent sx={{ mt: 3 }}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label={t('games.multiplayer.gameTitle')}
                            value={newGameTitle}
                            onChange={(e) => setNewGameTitle(e.target.value)}
                            placeholder={t('games.multiplayer.gameTitlePlaceholder')}
                        />
                        
                        <FormControl fullWidth>
                            <InputLabel>{t('games.multiplayer.selectGame')}</InputLabel>
                            <Select
                                value={selectedGameType}
                                label={t('games.multiplayer.selectGame')}
                                onChange={(e) => setSelectedGameType(e.target.value)}
                            >
                                {GAME_TYPES
                                    .filter(game => game.id === 'find-error') // Only show supported game types
                                    .map((game) => (
                                        <MenuItem key={game.id} value={game.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ color: game.color }}>{game.icon}</Box>
                                                {t(`games.${game.id}.title`)}
                                            </Box>
                                        </MenuItem>
                                    ))}
                            </Select>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                {t('games.multiplayer.moreComing') || 'More game types coming soon!'}
                            </Typography>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>{t('games.multiplayer.maxPlayers')}</InputLabel>
                            <Select
                                value={maxPlayers}
                                label={t('games.multiplayer.maxPlayers')}
                                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                            >
                                <MenuItem value={2}>2 {t('games.multiplayer.players')}</MenuItem>
                                <MenuItem value={4}>4 {t('games.multiplayer.players')}</MenuItem>
                                <MenuItem value={6}>6 {t('games.multiplayer.players')}</MenuItem>
                                <MenuItem value={8}>8 {t('games.multiplayer.players')}</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>{t('games.difficulty.label')}</InputLabel>
                            <Select
                                value={difficulty}
                                label={t('games.difficulty.label')}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <MenuItem value="easy">{t('games.difficulty.easy')}</MenuItem>
                                <MenuItem value="medium">{t('games.difficulty.medium')}</MenuItem>
                                <MenuItem value="hard">{t('games.difficulty.hard')}</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>{t('games.multiplayer.duration')}</InputLabel>
                            <Select
                                value={duration}
                                label={t('games.multiplayer.duration')}
                                onChange={(e) => setDuration(Number(e.target.value))}
                            >
                                <MenuItem value={5}>5 {t('common.minutes')}</MenuItem>
                                <MenuItem value={10}>10 {t('common.minutes')}</MenuItem>
                                <MenuItem value={15}>15 {t('common.minutes')}</MenuItem>
                                <MenuItem value={20}>20 {t('common.minutes')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenCreateDialog(false)}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateGame}
                        disabled={!newGameTitle.trim() || !selectedGameType}
                        sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                            }
                        }}
                    >
                        {t('games.multiplayer.create')}
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Invite Popup */}
            {currentInvite && (
                <InvitePopup
                    invite={currentInvite}
                    open={invitePopupOpen}
                    onClose={() => setInvitePopupOpen(false)}
                    onAccept={handleAcceptInvite}
                    onDecline={handleDeclineInvite}
                />
            )}
            
            {/* Invite Sent Confirmation Snackbar */}
            <Snackbar
                open={inviteSentSnackbar}
                autoHideDuration={3000}
                onClose={() => setInviteSentSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setInviteSentSnackbar(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Invite sent to {invitedPlayerName}!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Multiplayer;
