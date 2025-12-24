import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography
} from '@mui/material';
import { useState } from 'react';

interface Player {
    id: number;
    username: string;
    avatar: string;
    level: number;
    is_online: boolean;
}

interface InvitePlayersDialogProps {
    open: boolean;
    onClose: () => void;
    onSendInvite: (playerId: number) => Promise<void>;
    onlinePlayers: Player[];
    loading?: boolean;
}

const InvitePlayersDialog: React.FC<InvitePlayersDialogProps> = ({
    open,
    onClose,
    onSendInvite,
    onlinePlayers,
    loading = false
}) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
    const [sending, setSending] = useState(false);

    const handleSendInvite = async () => {
        if (selectedPlayerId === null) return;
        
        setSending(true);
        try {
            await onSendInvite(selectedPlayerId);
            setSelectedPlayerId(null); // Reset selection
            onClose(); // Close dialog after sending
        } catch (error) {
            console.error('Failed to send invite:', error);
        } finally {
            setSending(false);
        }
    };

    const handleClose = () => {
        if (!sending) {
            setSelectedPlayerId(null);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <PersonAddIcon />
                    Invite Player
                </Box>
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : onlinePlayers.length === 0 ? (
                    <Typography color="text.secondary" align="center" py={4}>
                        No online players available to invite
                    </Typography>
                ) : (
                    <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Select a player to invite to your game:
                        </Typography>
                        <RadioGroup
                            value={selectedPlayerId}
                            onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
                        >
                            {onlinePlayers.map((player) => (
                                <FormControlLabel
                                    key={player.id}
                                    value={player.id}
                                    control={<Radio />}
                                    label={
                                        <Box display="flex" alignItems="center" gap={2} py={0.5}>
                                            <Avatar
                                                src={player.avatar}
                                                alt={player.username}
                                                sx={{ width: 40, height: 40 }}
                                            >
                                                {player.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body1">
                                                    {player.username}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Level {player.level}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    }
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        mb: 1,
                                        mx: 0,
                                        px: 2,
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                    }}
                                />
                            ))}
                        </RadioGroup>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={sending}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSendInvite}
                    disabled={selectedPlayerId === null || sending}
                    variant="contained"
                    startIcon={sending ? <CircularProgress size={16} /> : <PersonAddIcon />}
                >
                    {sending ? 'Sending...' : 'Send Invite'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InvitePlayersDialog;
