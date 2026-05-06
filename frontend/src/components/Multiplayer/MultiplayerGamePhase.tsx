import { Alert, Box, Button, CircularProgress } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Invite } from '../../services/api';
import { MultiplayerGame } from '../../services/multiplayerApi';
import InvitePopup from '../Invites/InvitePopup';
import MultiplayerGameResults, { FinalResultsPlayer } from './MultiplayerGameResults';
import WaitingRoom from './WaitingRoom';

type WaitingRoomPlayer = {
    id: number;
    username: string;
    avatar: string;
    level: number;
    is_online: boolean;
};

type PendingInvite = {
    id: number;
    inviteId?: number;
    receiver: NonNullable<Invite['receiver']>;
};

interface MultiplayerGamePhaseProps {
    loading: boolean;
    error: string | null;
    game: MultiplayerGame | null;
    gameStartCountdown: number | null;
    isConnected: boolean;
    currentUserId?: number;
    showFinalResults: boolean;
    finalResults: unknown;
    inviteDialogOpen: boolean;
    onlinePlayers: WaitingRoomPlayer[];
    pendingInvites: PendingInvite[];
    currentInvite: Invite | null;
    invitePopupOpen: boolean;
    onJoinGame: () => Promise<void> | void;
    onReady: () => Promise<void> | void;
    onStartGame: () => Promise<void> | void;
    onLeaveGame: () => Promise<void> | void;
    onInviteDialogClose: () => void;
    onInviteDialogOpen: () => void;
    onSendInvite: (playerId: number) => Promise<void>;
    onInvitePopupClose: () => void;
    onAcceptInvite: (inviteId: number) => Promise<void>;
    onDeclineInvite: (inviteId: number) => Promise<void>;
    children: React.ReactNode;
}

export default function MultiplayerGamePhase({
    loading,
    error,
    game,
    gameStartCountdown,
    isConnected,
    currentUserId,
    showFinalResults,
    finalResults,
    inviteDialogOpen,
    onlinePlayers,
    pendingInvites,
    currentInvite,
    invitePopupOpen,
    onJoinGame,
    onReady,
    onStartGame,
    onLeaveGame,
    onInviteDialogClose,
    onInviteDialogOpen,
    onSendInvite,
    onInvitePopupClose,
    onAcceptInvite,
    onDeclineInvite,
    children,
}: MultiplayerGamePhaseProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !game) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="80vh"
                gap={2}
            >
                <Alert severity="error">{error || t('games.multiplayer.gameNotFound')}</Alert>
                <Button variant="contained" onClick={() => navigate('/games/multiplayer')}>
                    {t('common.back')}
                </Button>
            </Box>
        );
    }

    if (game.status === 'waiting') {
        if (!Array.isArray(game.players)) {
            return (
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="80vh"
                    gap={2}
                >
                    <Alert severity="error">{t('games.multiplayer.gameNotFound')}</Alert>
                    <Button variant="contained" onClick={() => navigate('/games/multiplayer')}>
                        {t('common.back')}
                    </Button>
                </Box>
            );
        }

        return (
            <>
                <WaitingRoom
                    game={game}
                    currentUserId={currentUserId}
                    gameStartCountdown={gameStartCountdown}
                    isConnected={isConnected}
                    onJoinGame={onJoinGame}
                    onReady={onReady}
                    onStartGame={onStartGame}
                    onLeaveGame={onLeaveGame}
                    inviteDialogOpen={inviteDialogOpen}
                    onInviteDialogClose={onInviteDialogClose}
                    onInviteDialogOpen={onInviteDialogOpen}
                    onlinePlayers={onlinePlayers}
                    pendingInvites={pendingInvites}
                    onSendInvite={onSendInvite}
                />

                <InvitePopup
                    invite={currentInvite}
                    open={invitePopupOpen}
                    onClose={onInvitePopupClose}
                    onAccept={onAcceptInvite}
                    onDecline={onDeclineInvite}
                />
            </>
        );
    }

    if (showFinalResults && finalResults) {
        const results = finalResults as { players?: FinalResultsPlayer[] };
        return <MultiplayerGameResults players={results.players || []} />;
    }

    return <>{children}</>;
}