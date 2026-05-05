import { Close, EmojiEvents, Group, SportsEsports } from '@mui/icons-material';
import {
    Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { Invite } from '../../services/api';

interface InvitePopupProps {
  invite: Invite | null;
  open: boolean;
  onClose: () => void;
  onAccept: (inviteId: number) => void;
  onDecline: (inviteId: number) => void;
}

const InvitePopup: React.FC<InvitePopupProps> = ({
  invite,
  open,
  onClose,
  onAccept,
  onDecline,
}) => {
  if (!invite) return null;

  const handleAccept = () => {
    onAccept(invite.id);
    onClose();
  };

  const handleDecline = () => {
    onDecline(invite.id);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
        transition: { duration: 0.3, ease: 'easeOut' },
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.5)',
          overflow: 'visible',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SportsEsports sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold">Game Invite!</Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 2 }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Sender Info Card */}
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              p: 2.5,
              mb: 2,
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2.5}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={invite.sender?.avatar}
                  sx={{
                    width: 64,
                    height: 64,
                    border: '3px solid white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  {invite.sender?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    bgcolor: '#fbbf24',
                    borderRadius: '50%',
                    p: 0.5,
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 16, color: 'white' }} />
                </Box>
              </Box>
              <Box flex={1}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {invite.sender?.username}
                </Typography>
                <Chip
                  label={`Level ${invite.sender?.level}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(251,191,36,0.9)',
                    color: 'white',
                    fontWeight: 'bold',
                    height: 24,
                  }}
                />
              </Box>
            </Stack>

            <Typography
              variant="body1"
              sx={{
                mt: 2,
                fontSize: '1.1rem',
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              wants you to join their game!
            </Typography>
          </Box>

          {/* Game Info Card */}
          {invite.game && (
            <Box
              sx={{
                bgcolor: 'rgba(0,0,0,0.25)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                p: 2.5,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                mb={1.5}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <SportsEsports sx={{ fontSize: 20 }} />
                {invite.game.title}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={invite.game.game_type.replace('-', ' ').toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(147,51,234,0.8)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<Group sx={{ fontSize: 16, color: 'white !important' }} />}
                  label={`${invite.game.max_players} players max`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(59,130,246,0.8)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Box>
          )}
        </motion.div>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, gap: 1.5 }}>
        <Button
          onClick={handleDecline}
          fullWidth
          size="large"
          sx={{
            color: 'white',
            borderColor: 'rgba(255,255,255,0.4)',
            borderWidth: 2,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              borderColor: 'white',
              borderWidth: 2,
              bgcolor: 'rgba(255,255,255,0.15)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s ease',
          }}
          variant="outlined"
        >
          Decline
        </Button>
        <Button
          onClick={handleAccept}
          fullWidth
          size="large"
          variant="contained"
          sx={{
            bgcolor: 'white',
            color: '#667eea',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(255,255,255,0.3)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.95)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 25px rgba(255,255,255,0.4)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Accept & Join Game
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitePopup;
