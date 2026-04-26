import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
    Alert, Avatar, Box, Button, Chip, Container, Divider,
    Grid, Paper, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MultiplayerGame } from '../../services/multiplayerApi';
import InvitePlayersDialog from './InvitePlayersDialog';

interface Player {
    id: number;
    username: string;
    avatar: string;
    level: number;
    is_online: boolean;
}

interface PendingInvite {
    id: number;
    receiver: {
        id: number;
        username: string;
        avatar: string;
        level: number;
    };
}

interface WaitingRoomProps {
    game: MultiplayerGame;
    currentUserId?: number;
    gameStartCountdown: number | null;
    isConnected: boolean;
    onJoinGame: () => void;
    onReady: () => void;
    onStartGame: () => void;
    onLeaveGame: () => void;
    
    // Invite functionality
    inviteDialogOpen: boolean;
    onInviteDialogClose: () => void;
    onInviteDialogOpen: () => void;
    onlinePlayers: Player[];
    pendingInvites: PendingInvite[];
    onSendInvite: (playerId: number) => Promise<void>;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
    game,
    currentUserId,
    gameStartCountdown,
    isConnected,
    onJoinGame,
    onReady,
    onStartGame,
    onLeaveGame,
    inviteDialogOpen,
    onInviteDialogClose,
    onInviteDialogOpen,
    onlinePlayers,
    pendingInvites,
    onSendInvite
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const currentPlayer = game.players.find((p) => p.user_id === currentUserId);
    const gameFull = game.players.length === game.max_players;
    const allReady = gameFull && game.players.every((p) => p.is_ready);
    const canJoin = !currentPlayer && game.players.length < game.max_players;
    const emptySlots = game.max_players - game.players.length;

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 4
        }}>
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Paper sx={{ p: 4, position: 'relative' }}>
                        {/* Countdown Overlay */}
                        {gameStartCountdown !== null && gameStartCountdown > 0 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1000,
                                    borderRadius: 1,
                                }}
                            >
                                <motion.div
                                    key={gameStartCountdown}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Typography
                                        variant="h1"
                                        sx={{
                                            fontSize: '10rem',
                                            fontWeight: 'bold',
                                            color: 'white',
                                            textShadow: '0 0 30px rgba(102, 126, 234, 0.8)',
                                        }}
                                    >
                                        {gameStartCountdown}
                                    </Typography>
                                </motion.div>
                            </Box>
                        )}
                        
                        {/* Header with Back Button */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/games/multiplayer')}
                                variant="outlined"
                                sx={{ mr: 2 }}
                            >
                                {t('common.back')}
                            </Button>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {game.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('games.multiplayer.hostedBy', { name: game.host.username })}
                                </Typography>
                            </Box>
                            <Chip 
                                label={allReady ? t('games.multiplayer.allReady') : t('games.multiplayer.waitingForPlayers')}
                                color={allReady ? 'success' : 'warning'}
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        {/* Game Info */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={3}>
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {t('games.multiplayer.maxPlayers')}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {game.players.length} / {game.max_players}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {t('games.difficulty.label')}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {t(`games.difficulty.${game.difficulty.toLowerCase()}`)}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {t('gameRoom.numberOfQuestions')}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {game.max_steps}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {t('gameRoom.timePerQuestion')}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {game.config.max_time}s
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Game Configuration */}
                        {game.config && (game.config.verbs || game.config.tenses) && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    {t('games.multiplayer.gameConfiguration')}
                                </Typography>
                                <Grid container spacing={2}>
                                    {game.config.verbs && game.config.verbs.length > 0 && (
                                        <Grid item xs={12} md={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    {t('common.verbs')} ({game.config.verbs.length})
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                                    {game.config.verbs.slice(0, 10).map((verb, idx) => (
                                                        <Chip key={idx} label={verb} size="small" variant="outlined" />
                                                    ))}
                                                    {game.config.verbs.length > 10 && (
                                                        <Chip label={`+${game.config.verbs.length - 10}`} size="small" color="primary" />
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    )}
                                    {game.config.tenses && game.config.tenses.length > 0 && (
                                        <Grid item xs={12} md={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    {t('common.tenses')} ({game.config.tenses.length})
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                                    {game.config.tenses.slice(0, 10).map((tense, idx) => (
                                                        <Chip key={idx} label={tense} size="small" variant="outlined" />
                                                    ))}
                                                    {game.config.tenses.length > 10 && (
                                                        <Chip label={`+${game.config.tenses.length - 10}`} size="small" color="secondary" />
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}

                        {/* Players Grid */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {t('games.multiplayer.players')}
                                </Typography>
                            </Box>
                            <Grid container spacing={2}>
                                {/* Actual Players */}
                                {game.players.map((player, index) => (
                                    <Grid item xs={12} sm={6} md={game.max_players <= 4 ? 6 : 4} key={player.user_id}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <Paper 
                                                elevation={3}
                                                sx={{ 
                                                    p: 2,
                                                    background: player.is_ready 
                                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                        : 'white',
                                                    color: player.is_ready ? 'white' : 'inherit',
                                                    border: player.user_id === currentUserId ? '3px solid #f59e0b' : 'none',
                                                    position: 'relative',
                                                    overflow: 'visible'
                                                }}
                                            >
                                                {player.is_host && (
                                                    <Chip 
                                                        label={t('games.multiplayer.host')}
                                                        size="small"
                                                        sx={{ 
                                                            position: 'absolute',
                                                            top: -10,
                                                            right: 8,
                                                            bgcolor: '#f59e0b',
                                                            color: 'white',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                )}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar 
                                                        src={player.user.avatar} 
                                                        sx={{ width: 56, height: 56 }}
                                                    >
                                                        {player.user.username[0].toUpperCase()}
                                                    </Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                            {player.user.username}
                                                            {player.user_id === currentUserId && ` (${t('games.multiplayer.you')})`}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                            {t('games.multiplayer.level', { level: player.user.level })}
                                                        </Typography>
                                                    </Box>
                                                    {player.is_ready ? (
                                                        <CheckCircleIcon sx={{ fontSize: 32, color: player.is_ready ? 'white' : 'success.main' }} />
                                                    ) : (
                                                        <RadioButtonUncheckedIcon sx={{ fontSize: 32, opacity: 0.3 }} />
                                                    )}
                                                </Box>
                                            </Paper>
                                        </motion.div>
                                    </Grid>
                                ))}
                                
                                {/* Empty Slots - Show pending invites or invite button */}
                                {Array.from({ length: emptySlots }).map((_, index) => {
                                    const pendingInvite = pendingInvites[index];
                                    
                                    return (
                                        <Grid item xs={12} sm={6} md={game.max_players <= 4 ? 6 : 4} key={`empty-${index}`}>
                                            {pendingInvite ? (
                                                // Show pending invite with player info
                                                <Paper 
                                                    elevation={1}
                                                    sx={{ 
                                                        p: 2,
                                                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                                        border: '2px dashed #f59e0b',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        minHeight: 88
                                                    }}
                                                >
                                                    <Avatar
                                                        src={pendingInvite.receiver.avatar}
                                                        alt={pendingInvite.receiver.username}
                                                        sx={{ width: 48, height: 48 }}
                                                    >
                                                        {pendingInvite.receiver.username.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box flex={1}>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {pendingInvite.receiver.username}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {t('games.multiplayer.level', { level: pendingInvite.receiver.level })}
                                                        </Typography>
                                                        <Box mt={0.5}>
                                                            <Chip 
                                                                label={t('games.multiplayer.invitePending')}
                                                                size="small"
                                                                color="warning"
                                                                sx={{ fontSize: '0.7rem' }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            ) : (
                                                // Show invite button for empty slot
                                                <Paper 
                                                    elevation={1}
                                                    sx={{ 
                                                        p: 2,
                                                        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                                        border: '2px dashed #d1d5db',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        minHeight: 88,
                                                        gap: 1
                                                    }}
                                                >
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('games.multiplayer.waitingForPlayer')}
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<PersonAddIcon />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            onInviteDialogOpen();
                                                        }}
                                                        disabled={onlinePlayers.length === 0}
                                                        sx={{
                                                            background: onlinePlayers.length > 0 
                                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                                                : 'rgba(0, 0, 0, 0.12)',
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            boxShadow: onlinePlayers.length > 0 ? 2 : 0,
                                                            position: 'relative',
                                                            zIndex: 20,
                                                            '&:hover': {
                                                                background: onlinePlayers.length > 0 
                                                                    ? 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)' 
                                                                    : 'rgba(0, 0, 0, 0.12)',
                                                                boxShadow: onlinePlayers.length > 0 ? 4 : 0,
                                                            },
                                                            '&.Mui-disabled': {
                                                                background: 'rgba(0, 0, 0, 0.12)',
                                                                color: 'rgba(0, 0, 0, 0.26)'
                                                            }
                                                        }}
                                                    >
                                                        {t('games.multiplayer.invite')} ({onlinePlayers.length})
                                                    </Button>
                                                </Paper>
                                            )}
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>

                        {!isConnected && (
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                {t('games.multiplayer.connecting')}
                            </Alert>
                        )}

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            {canJoin && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={onJoinGame}
                                    disabled={!isConnected}
                                    sx={{ 
                                        minWidth: 200,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                                        }
                                    }}
                                >
                                    {t('games.multiplayer.joinGame')}
                                </Button>
                            )}
                            {!canJoin && currentPlayer && !currentPlayer.is_ready && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={onReady}
                                    disabled={!isConnected}
                                    sx={{ 
                                        minWidth: 200,
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                        }
                                    }}
                                >
                                    {t('games.multiplayer.ready')}
                                </Button>
                            )}
                            {/* Show Start Game button for host when at least 2 players ready (but not in 2-player games when full) */}
                            {currentPlayer?.is_host && !allReady && game.players.length >= 2 && !(game.max_players === 2 && game.players.length === 2) && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={onStartGame}
                                    disabled={!isConnected || game.players.filter(p => p.is_ready).length < 2}
                                    sx={{ 
                                        minWidth: 200,
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                        },
                                        '&:disabled': {
                                            background: 'rgba(0, 0, 0, 0.12)',
                                        }
                                    }}
                                >
                                    {game.players.filter(p => p.is_ready).length >= 2 
                                        ? t('games.multiplayer.startGame')
                                        : t('games.multiplayer.needMorePlayers')}
                                </Button>
                            )}
                            {currentPlayer?.is_ready && !allReady && !currentPlayer?.is_host && (
                                <Typography variant="body1" color="success.main">
                                    {t('games.multiplayer.waitingForOthers')}
                                </Typography>
                            )}
                            {allReady && (
                                <Typography variant="body1" color="success.main" sx={{ fontWeight: 'bold' }}>
                                    {t('games.multiplayer.allReady')}
                                </Typography>
                            )}
                            <Button 
                                variant="outlined" 
                                size="large"
                                onClick={onLeaveGame}
                                sx={{ minWidth: 150 }}
                            >
                                {t('common.leave')}
                            </Button>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>

            {/* Invite Players Dialog */}
            <InvitePlayersDialog
                open={inviteDialogOpen}
                onClose={onInviteDialogClose}
                onlinePlayers={onlinePlayers}
                onSendInvite={onSendInvite}
            />
        </Box>
    );
};

export default WaitingRoom;
