import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import {
    AppBar,
    Avatar,
    Box,
    Chip,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store/store';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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
                        onClick={() => navigate('/dashboard')}
                    >
                        🎯 Verber
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {user?.username}
                        </Typography>

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
                    </Box>
                </Toolbar>
            </AppBar>

            {/* User Menu */}
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
                    <Typography variant="subtitle1" fontWeight="bold">
                        {user?.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user?.username}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={`Level ${user?.level || 1}`} size="small" color="primary" />
                        <Chip label={`${user?.xp || 0} XP`} size="small" variant="outlined" />
                    </Box>
                </Box>

                <MenuItem onClick={handleProfile}>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>My Profile</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleLeaderboard}>
                    <ListItemIcon>
                        <LeaderboardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Leaderboard</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleExercises}>
                    <ListItemIcon>
                        <SportsEsportsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Exercises</ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography color="error">Logout</Typography>
                    </ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};

export default Header;
