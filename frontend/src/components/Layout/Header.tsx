import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MailIcon from '@mui/icons-material/Mail';
import PersonIcon from '@mui/icons-material/Person';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import {
    AppBar,
    Avatar,
    Badge,
    Box, Button, Chip,
    Divider,
    IconButton, List,
    ListItem, ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Popover, Toolbar,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { inviteAPI } from '../../services/api';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store/store';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

const Header: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [inviteAnchorEl, setInviteAnchorEl] = useState<null | HTMLElement>(null);
    const [invites, setInvites] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch invites periodically
    useEffect(() => {
        if (!isAuthenticated) return;
        
        const fetchInvites = async () => {
            try {
                const response = await inviteAPI.getInvites();
                const pendingInvites = (response.data.invites || []).filter((inv: any) => inv.status === 'pending');
                setInvites(pendingInvites);
                setUnreadCount(pendingInvites.filter((inv: any) => !inv.read_at).length);
            } catch (e) {
                // Silent fail
            }
        };

        fetchInvites();
        const interval = setInterval(fetchInvites, 5000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleInvitePanelOpen = (event: React.MouseEvent<HTMLElement>) => {
        setInviteAnchorEl(event.currentTarget);
    };

    const handleInvitePanelClose = () => {
        setInviteAnchorEl(null);
    };

    const handleAcceptInvite = async (inviteId: number, gameId: string) => {
        try {
            await inviteAPI.acceptInvite(inviteId);
            // Navigate to multiplayer page (game joining will be handled there)
            navigate(`/games/multiplayer?join=${gameId}`);
            handleInvitePanelClose();
        } catch (error) {
            console.error('Failed to accept invite:', error);
        }
    };

    const handleDeclineInvite = async (inviteId: number) => {
        try {
            await inviteAPI.declineInvite(inviteId);
            // Refresh invites
            const response = await inviteAPI.getInvites();
            const pendingInvites = (response.data.invites || []).filter((inv: any) => inv.status === 'pending');
            setInvites(pendingInvites);
            setUnreadCount(pendingInvites.filter((inv: any) => !inv.read_at).length);
        } catch (error) {
            console.error('Failed to decline invite:', error);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        handleMenuClose();
        navigate('/');
    };

    const handleProfile = () => {
        navigate('/profile');
        handleMenuClose();
    };

    const handleLeaderboard = () => {
        navigate('/leaderboard');
        handleMenuClose();
    };

    const handleExercises = () => {
        navigate('/exercises');
        handleMenuClose();
    };

    return (
        <>
            <AppBar position="static" elevation={1} sx={{ backgroundColor: 'primary.main' }}>
                <Toolbar>
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
                    >
                        {t('header.appName')}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LanguageSwitcher />
                        
                        {isAuthenticated && (
                            <>
                                <IconButton
                                    onClick={handleInvitePanelOpen}
                                    size="large"
                                    sx={{
                                        color: 'white',
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                                    }}
                                >
                                    <Badge badgeContent={unreadCount} color="error">
                                        <MailIcon />
                                    </Badge>
                                </IconButton>
                                <IconButton
                                    onClick={handleMenuOpen}
                                    size="large"
                                    sx={{
                                        color: 'white',
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: 'secondary.main',
                                        }}
                                    >
                                        {user?.username?.charAt(0).toUpperCase() || <AccountCircleIcon />}
                                    </Avatar>
                                </IconButton>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* User Menu - Only show when authenticated */}
            {isAuthenticated && (
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    PaperProps={{
                        elevation: 3,
                        sx: {
                            mt: 1.5,
                            minWidth: 200,
                            '& .MuiMenuItem-root': {
                                px: 2,
                                py: 1.5,
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={t('header.level', { level: user?.level || 1 })} size="small" color="primary" />
                            <Chip label={t('header.xp', { xp: user?.xp || 0 })} size="small" variant="outlined" />
                        </Box>
                    </Box>

                    <MenuItem onClick={handleProfile}>
                        <ListItemIcon>
                            <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('header.myProfile')}</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={handleLeaderboard}>
                        <ListItemIcon>
                            <LeaderboardIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('navigation.leaderboard')}</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={handleExercises}>
                        <ListItemIcon>
                            <SportsEsportsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('navigation.exercises')}</ListItemText>
                    </MenuItem>

                    <Divider />

                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography color="error">{t('auth.logout')}</Typography>
                        </ListItemText>
                    </MenuItem>
                </Menu>
            )}

            {/* Invite Panel */}
            {isAuthenticated && (
                <Popover
                    open={Boolean(inviteAnchorEl)}
                    anchorEl={inviteAnchorEl}
                    onClose={handleInvitePanelClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: {
                            mt: 1.5,
                            width: 400,
                            maxHeight: 500,
                        },
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Game Invites ({invites.length})
                        </Typography>
                        {invites.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                No pending invites
                            </Typography>
                        ) : (
                            <List sx={{ p: 0 }}>
                                {invites.map((invite: any) => (
                                    <ListItem
                                        key={invite.id}
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: 'stretch',
                                            bgcolor: 'action.hover',
                                            borderRadius: 1,
                                            mb: 1,
                                            p: 2,
                                        }}
                                    >
                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {invite.sender?.username || 'Unknown'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Game: {invite.game?.title || invite.game_id}
                                            </Typography>
                                            {invite.game?.game_type && (
                                                <Chip
                                                    label={invite.game.game_type}
                                                    size="small"
                                                    sx={{ mt: 0.5 }}
                                                />
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckIcon />}
                                                onClick={() => handleAcceptInvite(invite.id, invite.game_id)}
                                                fullWidth
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                startIcon={<CloseIcon />}
                                                onClick={() => handleDeclineInvite(invite.id)}
                                                fullWidth
                                            >
                                                Decline
                                            </Button>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </Popover>
            )}
        </>
    );
};

export default Header;
