import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Invite, inviteAPI, userAPI } from '../services/api';
import { MultiplayerGame, multiplayerAPI } from '../services/multiplayerApi';
import { toastService } from '../services/toastService';

export type MultiplayerOnlinePlayer = {
    id: number;
    username: string;
    avatar: string;
    level: number;
    is_online: boolean;
};

export type MultiplayerPendingInvite = {
    id: number;
    inviteId?: number;
    receiver: NonNullable<Invite['receiver']>;
};

type InviteEventType = 'invite_sent' | 'invite_accepted' | 'invite_declined' | 'invite_expired';

interface UseMultiplayerGameSessionParams {
    gameId?: string;
    currentUserId?: number;
}

export const useMultiplayerGameSession = ({
    gameId,
    currentUserId,
}: UseMultiplayerGameSessionParams) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [game, setGame] = useState<MultiplayerGame | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [onlinePlayers, setOnlinePlayers] = useState<MultiplayerOnlinePlayer[]>([]);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [pendingInvites, setPendingInvites] = useState<MultiplayerPendingInvite[]>([]);
    const [currentInvite, setCurrentInvite] = useState<Invite | null>(null);
    const [invitePopupOpen, setInvitePopupOpen] = useState(false);

    const isPageVisible = useRef(true);
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleVisibilityChange = () => {
            isPageVisible.current = !document.hidden;
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        if (!gameId || !game || game.status !== 'in_progress') {
            return;
        }

        const sendHeartbeat = async () => {
            if (isPageVisible.current) {
                try {
                    await multiplayerAPI.sendHeartbeat(gameId);
                } catch {
                    // silent
                }
            }
        };

        sendHeartbeat();
        heartbeatInterval.current = setInterval(sendHeartbeat, 5000);

        return () => {
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
                heartbeatInterval.current = null;
            }
        };
    }, [gameId, game]);

    useEffect(() => {
        const initLobby = async () => {
            if (!gameId) {
                setError(t('games.multiplayer.gameNotFound'));
                setLoading(false);
                return;
            }

            try {
                const fetched = await multiplayerAPI.getGame(gameId);

                if (!fetched.players) {
                    fetched.players = [];
                }

                const alreadyPlayer = !!fetched.players.find((player) => player.user_id === currentUserId);

                if (fetched.status === 'waiting' && !alreadyPlayer && fetched.players.length < fetched.max_players) {
                    try {
                        const joinedPlayer = await multiplayerAPI.joinGame(gameId);
                        fetched.players.push(joinedPlayer);
                    } catch {
                        // silent
                    }
                }

                setGame(fetched);
            } catch {
                setError(t('games.multiplayer.failedToLoadGame'));
            } finally {
                setLoading(false);
            }
        };

        initLobby();
    }, [currentUserId, gameId, t]);

    useEffect(() => {
        if (game?.status !== 'waiting') {
            return;
        }

        const fetchOnlinePlayers = async () => {
            try {
                const response = await userAPI.getOnlineUsers();
                const gamePlayerIds = game.players.map((player) => player.user_id);
                const filtered = response.data.online.filter(
                    (player: { id: number }) => !gamePlayerIds.includes(player.id) && player.id !== currentUserId
                );

                setOnlinePlayers(
                    filtered.map((player: { id: number; username: string; avatar: string; level: number } & Partial<{ is_online: boolean }>) => ({
                        ...player,
                        is_online: player.is_online ?? true,
                    }))
                );
            } catch {
                // silent
            }
        };

        fetchOnlinePlayers();
        const interval = setInterval(fetchOnlinePlayers, 30000);

        return () => clearInterval(interval);
    }, [currentUserId, game]);

    const handleInviteEvent = useCallback((type: InviteEventType, data: unknown) => {
        const invite = data as Invite;
        const receiver = invite?.receiver;
        const receiverName = receiver?.username || 'player';

        if (type === 'invite_sent') {
            if (receiver) {
                setPendingInvites((prev) => {
                    const existingIndex = prev.findIndex(
                        (pendingInvite) => pendingInvite?.inviteId === invite.id || pendingInvite?.receiver?.id === receiver.id
                    );

                    if (existingIndex >= 0) {
                        const updated = [...prev];
                        updated[existingIndex] = {
                            ...updated[existingIndex],
                            id: invite.id,
                            inviteId: invite.id,
                            receiver,
                        };
                        return updated;
                    }

                    return [
                        ...prev,
                        {
                            id: invite.id,
                            inviteId: invite.id,
                            receiver,
                        },
                    ];
                });
            }

            const senderName = invite?.sender?.username;
            toastService.info(senderName ? `${senderName} invited ${receiverName}` : `Invite sent to ${receiverName}`);
            return;
        }

        if (type === 'invite_accepted') {
            setPendingInvites((prev) =>
                prev.filter(
                    (pendingInvite) =>
                        (pendingInvite?.inviteId ?? pendingInvite?.id) !== invite.id &&
                        (!receiver || pendingInvite?.receiver?.id !== receiver.id)
                )
            );
            toastService.success(`${receiverName} accepted the invite`);
            return;
        }

        if (type === 'invite_declined') {
            setPendingInvites((prev) =>
                prev.filter(
                    (pendingInvite) =>
                        (pendingInvite?.inviteId ?? pendingInvite?.id) !== invite.id &&
                        (!receiver || pendingInvite?.receiver?.id !== receiver.id)
                )
            );
            toastService.info(`${receiverName} declined the invite`);
            return;
        }

        setPendingInvites((prev) =>
            prev.filter(
                (pendingInvite) =>
                    (pendingInvite?.inviteId ?? pendingInvite?.id) !== invite.id &&
                    (!receiver || pendingInvite?.receiver?.id !== receiver.id)
            )
        );
        toastService.warning(`Invite to ${receiverName} expired`);
    }, []);

    const handleConnectionError = useCallback(() => {
        setError(t('games.multiplayer.connectionError'));
    }, [t]);

    const joinGame = useCallback(async () => {
        if (!gameId) {
            return;
        }

        try {
            await multiplayerAPI.joinGame(gameId);
        } catch {
            // silent
        }
    }, [gameId]);

    const setReady = useCallback(async () => {
        if (!gameId) {
            return;
        }

        try {
            await multiplayerAPI.setReady(gameId, true);
        } catch {
            // silent
        }
    }, [gameId]);

    const startGame = useCallback(async () => {
        if (!gameId) {
            return;
        }

        try {
            await multiplayerAPI.startGame(gameId);
        } catch {
            // silent
        }
    }, [gameId]);

    const leaveGame = useCallback(async () => {
        if (!gameId) {
            return;
        }

        try {
            await multiplayerAPI.leaveGame(gameId);
            navigate('/games/multiplayer');
        } catch {
            navigate('/games/multiplayer');
        }
    }, [gameId, navigate]);

    const sendInvite = useCallback(async (playerId: number) => {
        if (!gameId) {
            return;
        }

        try {
            await inviteAPI.sendInvite(playerId, gameId);
            const player = onlinePlayers.find((onlinePlayer) => onlinePlayer.id === playerId);

            if (player) {
                setPendingInvites((prev) => {
                    const exists = prev.some((pendingInvite) => pendingInvite?.receiver?.id === playerId);
                    if (exists) {
                        return prev;
                    }

                    return [
                        ...prev,
                        {
                            id: Date.now(),
                            receiver: player,
                        },
                    ];
                });
                toastService.success(`Invite sent to ${player.username}!`);
            }
        } catch (error: unknown) {
            const errMsg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
            toastService.error(errMsg || 'Failed to send invite');
        }
    }, [gameId, onlinePlayers]);

    const acceptInvite = useCallback(async (inviteId: number) => {
        try {
            await inviteAPI.acceptInvite(inviteId);
            setInvitePopupOpen(false);
            setCurrentInvite(null);
            toastService.success('Invite accepted! Joining game...');
        } catch (error: unknown) {
            const errMsg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
            toastService.error(errMsg || 'Failed to accept invite');
        }
    }, []);

    const declineInvite = useCallback(async (inviteId: number) => {
        try {
            await inviteAPI.declineInvite(inviteId);
            setInvitePopupOpen(false);
            setCurrentInvite(null);
            toastService.info('Invite declined');
        } catch {
            toastService.error('Failed to decline invite');
        }
    }, []);

    return {
        game,
        setGame,
        loading,
        error,
        setError,
        onlinePlayers,
        inviteDialogOpen,
        openInviteDialog: () => setInviteDialogOpen(true),
        closeInviteDialog: () => setInviteDialogOpen(false),
        pendingInvites,
        currentInvite,
        invitePopupOpen,
        closeInvitePopup: () => setInvitePopupOpen(false),
        handleInviteEvent,
        handleConnectionError,
        joinGame,
        setReady,
        startGame,
        leaveGame,
        sendInvite,
        acceptInvite,
        declineInvite,
    };
};