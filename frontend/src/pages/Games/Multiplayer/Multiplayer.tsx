import {
    Add, EmojiEvents, FiberManualRecord, FilterList,
    Group, PersonAdd, Refresh,
    Search, Star, StarBorder,
    Timer
} from '@mui/icons-material';
import {
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
    ListItemButton,
    ListItemText,
    MenuItem,
    Paper,
    Select, Stack,
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
import { toastService } from '../../../services/toastService';
import { RootState } from '../../../store/store';
import { getFavoritePlayerIds, toggleFavoritePlayer } from '../../../utils/favoritePlayers';
import { mapMultiplayerErrorMessage } from '../../../utils/multiplayerErrorMessages';

interface Player {
    id: number;
    username: string;
    avatar: string;
    level: number;
    is_online: boolean;
}

const MULTIPLAYER_ROUTE_BY_GAME_TYPE: Record<string, string> = {
    'find-error': 'find-error',
    matching: 'matching',
    'write-me': 'write-me',
    race: 'race',
    'random-verb': 'random-verb',
    sentence: 'sentence',
    participe: 'participe',
};

const SUPPORTED_MULTIPLAYER_GAMES = GAME_TYPES.filter((game) => Boolean(MULTIPLAYER_ROUTE_BY_GAME_TYPE[game.id]));

const Multiplayer: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [waitingRooms, setWaitingRooms] = useState<MultiplayerGame[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<MultiplayerGame[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);
    const [offlinePlayers, setOfflinePlayers] = useState<Player[]>([]);
    const [currentInvite, setCurrentInvite] = useState<Invite | null>(null);
    const [invitePopupOpen, setInvitePopupOpen] = useState(false);
    const [sendingInvite, setSendingInvite] = useState<number | null>(null);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [selectedRoomForInvite, setSelectedRoomForInvite] = useState<string | null>(null);
    const [favoritePlayerIds, setFavoritePlayerIds] = useState<number[]>(() => getFavoritePlayerIds());
    
    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGameType, setFilterGameType] = useState('all');
    const [filterPlayers, setFilterPlayers] = useState('all');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    
    // Create game form state
    const [selectedGameType, setSelectedGameType] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [difficulty, setDifficulty] = useState('medium');
    const [duration, setDuration] = useState(10);

    const hasCreatedGame = Boolean(currentUser && waitingRooms.some((game) => game.host?.id === currentUser.id));

    const fetchWaitingRooms = async () => {
        setIsLoading(true);
        try {
            const games = await multiplayerAPI.getWaitingRooms();
            // Show currently supported multiplayer game types.
            const supportedGames = (games || []).filter((game) => Boolean(MULTIPLAYER_ROUTE_BY_GAME_TYPE[game.game_type]));
            setWaitingRooms(supportedGames);
        } catch (error: any) {
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
        }
    };

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
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
            return () => {
                clearInterval(interval);
            };
        }
        // Use the same base URL as API calls
        const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
        const wsBaseUrl = apiBaseUrl.replace('http://', 'ws://').replace('https://', 'wss://').replace('/api', '');
        let reconnectAttempts = 0;
        let ws: WebSocket | null = null;
        let stopped = false;

        const connectWS = () => {
            // Use latest token on each reconnect attempt to avoid looping with an expired JWT.
            const latestToken = localStorage.getItem('token');
            if (!latestToken) {
                return;
            }

            const wsUrl = `${wsBaseUrl}/ws/multiplayer?token=${latestToken}`;
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                reconnectAttempts = 0;
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
                        const inviterName = payload?.sender_username || payload?.sender?.username || 'Someone';
                        toastService.info(`Invite received from ${inviterName}`);
                    }

                    if (message.type === 'presence_update' && payload) {
                        fetchRecentPlayers();
                        fetchWaitingRooms();
                    }

                    if (message.type === 'game_created' || message.type === 'game_updated') {
                        fetchWaitingRooms();
                    }
                } catch (error) {
                }
            };

            ws.onerror = () => {
            };

            ws.onclose = () => {
                if (stopped) return;
                reconnectAttempts += 1;
                const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
                setTimeout(connectWS, delay);
            };
        };

        connectWS();

        return () => {
            stopped = true;
            clearInterval(interval);
            if (ws) ws.close();
        };
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser?.id) {
            return;
        }

        setFavoritePlayerIds((prev) => prev.filter((playerId) => playerId !== currentUser.id));
    }, [currentUser?.id]);

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
        if (!selectedGameType) {
            return;
        }
        // Store game creation data in session storage
        sessionStorage.setItem('multiplayerGameData', JSON.stringify({
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
            const routeGameType = game?.game_type ? MULTIPLAYER_ROUTE_BY_GAME_TYPE[game.game_type] : undefined;
            
            // Check if game type is supported for multiplayer
            if (!routeGameType) {
                alert(t('games.multiplayer.modeNotAvailable', { game: game?.game_type }));
                return;
            }

            await multiplayerAPI.joinGame(gameId);
            
            // Navigate to multiplayer game room by game type
            navigate(`/games/multiplayer/${routeGameType}/${gameId}`);
        } catch (error: any) {
            const backendError = error?.response?.data?.error;
            const friendly = mapMultiplayerErrorMessage(backendError);

            if (error?.response?.status === 400 && backendError?.includes('already in game')) {
                // Player already joined, navigate to game
                const game = waitingRooms.find(r => r.id === gameId);
                const joinedRouteGameType = game?.game_type ? MULTIPLAYER_ROUTE_BY_GAME_TYPE[game.game_type] : undefined;
                if (joinedRouteGameType) {
                    navigate(`/games/multiplayer/${joinedRouteGameType}/${gameId}`);
                }
            } else if (friendly) {
                toastService.error(friendly);
            } else {
                toastService.error(t('games.multiplayer.failedToJoinGame') + ': ' + (backendError || error.message || t('common.error')));
            }
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        return DIFFICULTY_COLORS[difficulty] || 'default';
    };

    const getGameInfo = (gameType: string) => {
        return GAME_TYPES.find(g => g.id === gameType);
    };

    const handleToggleFavorite = (playerId: number) => {
        setFavoritePlayerIds(toggleFavoritePlayer(playerId));
    };

    const visibleOnlinePlayers = onlinePlayers.filter((player) => player.id !== currentUser?.id);
    const visibleOfflinePlayers = offlinePlayers.filter((player) => player.id !== currentUser?.id);
    const favoriteOnlinePlayers = visibleOnlinePlayers.filter((player) => favoritePlayerIds.includes(player.id));
    const otherOnlinePlayers = visibleOnlinePlayers.filter((player) => !favoritePlayerIds.includes(player.id));
    const favoriteOfflinePlayers = visibleOfflinePlayers.filter((player) => favoritePlayerIds.includes(player.id));
    const otherOfflinePlayers = visibleOfflinePlayers.filter((player) => !favoritePlayerIds.includes(player.id));

    const handleInvitePlayer = async (playerId: number, gameId?: string) => {
        const targetGameId = gameId || selectedRoomForInvite || waitingRooms[0]?.id;
        
        if (!targetGameId) {
            alert(t('games.multiplayer.createOrJoinFirst'));
            return;
        }

        // Check if player is already in the game
        const game = waitingRooms.find(r => r.id === targetGameId);
        const isPlayerInGame = game?.players?.some(p => p.user_id === playerId);
        if (isPlayerInGame) {
            alert(t('games.multiplayer.playerAlreadyInGame'));
            return;
        }

        setSendingInvite(playerId);
        try {
            await inviteAPI.sendInvite(playerId, targetGameId);
            // Find player name for success message
            const player = onlinePlayers.find(p => p.id === playerId);
            toastService.success(t('games.multiplayer.inviteSentTo', { name: player?.username || t('games.multiplayer.player') }));
        } catch (error: any) {
            toastService.error(error.response?.data?.error || t('games.multiplayer.failedToSendInvite'));
        } finally {
            setSendingInvite(null);
        }
    };

    const handleOpenInviteDialog = (roomId: string) => {
        setSelectedRoomForInvite(roomId);
        setInviteDialogOpen(true);
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
            const backendError = error?.response?.data?.error;
            const friendly = mapMultiplayerErrorMessage(backendError);
            toastService.error(friendly || backendError || t('games.multiplayer.failedToAcceptInvite'));
        }
    };

    const handleDeclineInvite = async (inviteId: number) => {
        try {
            await inviteAPI.declineInvite(inviteId);
        } catch (error: any) {
        }
    };

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
                                                {t('games.multiplayer.onlinePlayers')} ({visibleOnlinePlayers.length})
                                            </Typography>
                                            <IconButton size="small" onClick={fetchRecentPlayers}>
                                                <Refresh fontSize="small" />
                                            </IconButton>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        
                                        {visibleOnlinePlayers.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                                {t('games.multiplayer.noOnlinePlayers')}
                                            </Typography>
                                        ) : (
                                            <List dense>
                                                {favoriteOnlinePlayers.length > 0 && (
                                                    <>
                                                        <ListItem sx={{ px: 0, pb: 0.5 }}>
                                                            <Chip
                                                                icon={<Star sx={{ color: '#f59e0b !important' }} />}
                                                                label={`${t('games.multiplayer.favorites')} (${favoriteOnlinePlayers.length})`}
                                                                size="small"
                                                                sx={{ fontWeight: 'bold' }}
                                                            />
                                                        </ListItem>
                                                        {favoriteOnlinePlayers.map((player) => (
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
                                                                        fontWeight: 600 
                                                                    }}
                                                                    secondaryTypographyProps={{ 
                                                                        variant: 'caption' 
                                                                    }}
                                                                />
                                                                <Tooltip title={t('games.multiplayer.removeFavorite')}>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleToggleFavorite(player.id)}
                                                                        sx={{ color: '#f59e0b' }}
                                                                    >
                                                                        <Star fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                {currentUser && player.id !== currentUser.id && (
                                                                    <Tooltip title={t('games.multiplayer.inviteToGame')}>
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
                                                        {otherOnlinePlayers.length > 0 && <Divider sx={{ my: 1 }} />}
                                                    </>
                                                )}
                                                {otherOnlinePlayers.map((player) => (
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
                                                        <Tooltip title={favoritePlayerIds.includes(player.id) ? t('games.multiplayer.removeFavorite') : t('games.multiplayer.addFavorite')}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleToggleFavorite(player.id)}
                                                                sx={{ color: favoritePlayerIds.includes(player.id) ? '#f59e0b' : 'text.secondary' }}
                                                            >
                                                                {favoritePlayerIds.includes(player.id) ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                                                            </IconButton>
                                                        </Tooltip>
                                                        {currentUser && player.id !== currentUser.id && (
                                                            <Tooltip title={t('games.multiplayer.inviteToGame')}>
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
                                        
                                        {visibleOfflinePlayers.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                                {t('games.multiplayer.noOfflinePlayers')}
                                            </Typography>
                                        ) : (
                                            <List dense>
                                                {favoriteOfflinePlayers.length > 0 && (
                                                    <>
                                                        <ListItem sx={{ px: 0, pb: 0.5 }}>
                                                            <Chip
                                                                icon={<Star sx={{ color: '#f59e0b !important' }} />}
                                                                label={`${t('games.multiplayer.favorites')} (${favoriteOfflinePlayers.length})`}
                                                                size="small"
                                                                sx={{ fontWeight: 'bold' }}
                                                            />
                                                        </ListItem>
                                                        {favoriteOfflinePlayers.map((player) => (
                                                            <ListItem key={player.id} sx={{ px: 0 }}>
                                                                <ListItemAvatar>
                                                                    <Avatar 
                                                                        src={player.avatar} 
                                                                        sx={{ 
                                                                            width: 36, 
                                                                            height: 36,
                                                                            opacity: 0.75 
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
                                                                        fontWeight: 600,
                                                                        sx: { opacity: 0.85 }
                                                                    }}
                                                                    secondaryTypographyProps={{ 
                                                                        variant: 'caption',
                                                                        sx: { opacity: 0.65 }
                                                                    }}
                                                                />
                                                                <Tooltip title={t('games.multiplayer.removeFavorite')}>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleToggleFavorite(player.id)}
                                                                        sx={{ color: '#f59e0b' }}
                                                                    >
                                                                        <Star fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </ListItem>
                                                        ))}
                                                        {otherOfflinePlayers.length > 0 && <Divider sx={{ my: 1 }} />}
                                                    </>
                                                )}
                                                {otherOfflinePlayers.map((player) => (
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
                                                        <Tooltip title={favoritePlayerIds.includes(player.id) ? t('games.multiplayer.removeFavorite') : t('games.multiplayer.addFavorite')}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleToggleFavorite(player.id)}
                                                                sx={{ color: favoritePlayerIds.includes(player.id) ? '#f59e0b' : 'text.secondary' }}
                                                            >
                                                                {favoritePlayerIds.includes(player.id) ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                                                            </IconButton>
                                                        </Tooltip>
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
                                                disabled={hasCreatedGame}
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
                                                    <InputLabel>{t('games.multiplayer.gameType')}</InputLabel>
                                                    <Select
                                                        value={filterGameType}
                                                        label={t('games.multiplayer.gameType')}
                                                        onChange={(e) => setFilterGameType(e.target.value)}
                                                    >
                                                        <MenuItem value="all">{t('games.multiplayer.allTypes')}</MenuItem>
                                                        {SUPPORTED_MULTIPLAYER_GAMES.map((game) => (
                                                            <MenuItem key={game.id} value={game.id}>
                                                                {t(`games.${game.id}.title`)}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={4} md={2}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>{t('games.multiplayer.players')}</InputLabel>
                                                    <Select
                                                        value={filterPlayers}
                                                        label={t('games.multiplayer.players')}
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
                                                    <InputLabel>{t('games.difficulty.label')}</InputLabel>
                                                    <Select
                                                        value={filterDifficulty}
                                                        label={t('games.difficulty.label')}
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
                                                <Grid container spacing={2.5}>
                                                    {filteredRooms.map((room) => {
                                                        const gameInfo = getGameInfo(room.game_type);
                                                        return (
                                                            <Grid item xs={12} sm={6} md={6} lg={4} key={room.id}>
                                                                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                                    <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
                                                                            {gameInfo && (
                                                                                <Box
                                                                                    sx={{
                                                                                        color: gameInfo.color,
                                                                                        fontSize: 22,
                                                                                        p: 0.75,
                                                                                        borderRadius: 2,
                                                                                        backgroundColor: `${gameInfo.color}14`,
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        flexShrink: 0,
                                                                                    }}
                                                                                >
                                                                                    {gameInfo.icon}
                                                                                </Box>
                                                                            )}
                                                                            <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                                                                {room.title}
                                                                            </Typography>
                                                                        </Box>

                                                                        <Box sx={{ mb: 2.25 }}>
                                                                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1.25 }}>
                                                                                <Chip
                                                                                    icon={<Group />}
                                                                                    label={`${room.players.length}/${room.max_players}`}
                                                                                    size="small"
                                                                                    color="primary"
                                                                                    variant="outlined"
                                                                                />
                                                                            </Stack>
                                                                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                                                {room.players.length > 0 ? (
                                                                                    room.players.map((player) => (
                                                                                        <Chip
                                                                                            key={player.user_id}
                                                                                            avatar={<Avatar src={player.user.avatar}>{player.user.username[0].toUpperCase()}</Avatar>}
                                                                                            icon={player.user_id === room.host.id ? <EmojiEvents sx={{ fontSize: 16 }} /> : undefined}
                                                                                            label={player.user.username}
                                                                                            size="small"
                                                                                            color={player.user_id === room.host.id ? 'primary' : 'default'}
                                                                                            variant={player.user_id === room.host.id ? 'filled' : 'outlined'}
                                                                                            sx={{
                                                                                                '& .MuiChip-label': { fontWeight: player.user_id === room.host.id ? 700 : 500 },
                                                                                            }}
                                                                                        />
                                                                                    ))
                                                                                ) : (
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        {t('games.multiplayer.noPlayersYet')}
                                                                                    </Typography>
                                                                                )}
                                                                            </Stack>
                                                                        </Box>

                                                                        <Divider sx={{ mb: 2, borderColor: 'rgba(0,0,0,0.08)' }} />

                                                                        <Box>
                                                                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                                                <Chip
                                                                                    label={t(`games.difficulty.${room.difficulty.toLowerCase()}`)}
                                                                                    size="small"
                                                                                    color={getDifficultyColor(room.difficulty) as any}
                                                                                />
                                                                                <Chip
                                                                                    icon={<Timer />}
                                                                                    label={`${room.config.max_time}s / ${t('games.common.question').toLowerCase()}`}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                />
                                                                                <Chip
                                                                                    label={`${room.max_steps} ${t('gameRoom.questions')}`}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                />
                                                                            </Stack>
                                                                        </Box>
                                                                    </CardContent>
                                                                    <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                                                                        {currentUser && room.host.id === currentUser.id ? (
                                                                            <>
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    fullWidth
                                                                                    onClick={() => handleOpenInviteDialog(room.id)}
                                                                                    startIcon={<PersonAdd />}
                                                                                >
                                                                                    {t('games.multiplayer.invite')}
                                                                                </Button>
                                                                                <Button
                                                                                    variant="contained"
                                                                                    fullWidth
                                                                                    onClick={() => handleJoinRoom(room.id)}
                                                                                    sx={{
                                                                                        backgroundColor: gameInfo?.color || '#667eea',
                                                                                        '&:hover': {
                                                                                            backgroundColor: gameInfo?.color || '#667eea',
                                                                                            filter: 'brightness(0.9)',
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    {t('games.multiplayer.joinRoom')}
                                                                                </Button>
                                                                            </>
                                                                        ) : (
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
                                                                        )}
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
                        {hasCreatedGame && (
                            <Typography variant="body2" color="warning.main">
                                You already created a game. Leave or finish it before creating another one.
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                            Game name is auto-generated from a god list.
                        </Typography>
                        
                        <FormControl fullWidth>
                            <InputLabel>{t('games.multiplayer.selectGame')}</InputLabel>
                            <Select
                                value={selectedGameType}
                                label={t('games.multiplayer.selectGame')}
                                onChange={(e) => setSelectedGameType(e.target.value)}
                            >
                                {SUPPORTED_MULTIPLAYER_GAMES.map((game) => (
                                        <MenuItem key={game.id} value={game.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ color: game.color }}>{game.icon}</Box>
                                                {t(`games.${game.id}.title`)}
                                            </Box>
                                        </MenuItem>
                                    ))}
                            </Select>
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
                        disabled={!selectedGameType || hasCreatedGame}
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

            {/* Invite Players Dialog */}
            <Dialog 
                open={inviteDialogOpen} 
                onClose={() => {
                    setInviteDialogOpen(false);
                    setSelectedRoomForInvite(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <PersonAdd />
                        Invite Players to Game
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select online players to invite to your waiting room:
                    </Typography>
                    {onlinePlayers.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                            No online players available to invite
                        </Typography>
                    ) : (
                        <List>
                            {onlinePlayers.map((player) => {
                                const selectedRoom = waitingRooms.find(r => r.id === selectedRoomForInvite);
                                const isPlayerInRoom = selectedRoom?.players?.some(p => p.user_id === player.id);
                                
                                return (
                                    <ListItem
                                        key={player.id}
                                        disablePadding
                                        secondaryAction={
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleInvitePlayer(player.id, selectedRoomForInvite!)}
                                                disabled={sendingInvite === player.id || isPlayerInRoom}
                                            >
                                                {isPlayerInRoom ? 'In Game' : sendingInvite === player.id ? 'Sending...' : 'Invite'}
                                            </Button>
                                        }
                                    >
                                        <ListItemButton onClick={() => !isPlayerInRoom && handleInvitePlayer(player.id, selectedRoomForInvite!)}>
                                            <ListItemAvatar>
                                                <Avatar src={player.avatar}>
                                                    {player.username[0].toUpperCase()}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={player.username}
                                                secondary={`Level ${player.level}`}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setInviteDialogOpen(false);
                                setSelectedRoomForInvite(null);
                            }}
                        >
                            Done
                        </Button>
                    </Box>
                </DialogContent>
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
        </Box>
    );
};

export default Multiplayer;
