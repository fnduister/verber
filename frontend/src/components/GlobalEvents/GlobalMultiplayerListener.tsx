import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { multiplayerAPI } from '../../services/multiplayerApi';
import { toastService } from '../../services/toastService';
import { RootState } from '../../store/store';

const ROUTE_BY_GAME_TYPE: Record<string, string> = {
  'find-error': 'find-error',
  matching: 'matching',
  'write-me': 'write-me',
  race: 'race',
  'random-verb': 'random-verb',
  sentence: 'sentence',
  participe: 'participe',
};

const buildWsUrl = (token: string) => {
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const wsBaseUrl = apiBaseUrl
    .replace('http://', 'ws://')
    .replace('https://', 'wss://')
    .replace('/api', '');
  return `${wsBaseUrl}/ws/multiplayer?token=${token}`;
};

export const GlobalMultiplayerListener: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const handledStatusRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      return;
    }

    let stopped = false;

    const connect = () => {
      // Always read the freshest token because axios may have refreshed it after a 401.
      const latestToken = localStorage.getItem('token') || token;
      if (!latestToken) {
        return;
      }

      const wsUrl = buildWsUrl(latestToken);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        // console.log('[GlobalWS] Connected', wsUrl);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const payload = message.data || message.payload;

          if (!payload) return;

          if (message.type === 'invite_received') {
            const inviterName = payload?.sender_username || payload?.sender?.username || 'Someone';
            const title = payload?.game?.title;
            toastService.info(title ? `Invite received from ${inviterName}: ${title}` : `Invite received from ${inviterName}`);
          }

          if (message.type === 'invite_expired') {
            const receiver = payload?.receiver?.username || 'player';
            const title = payload?.game?.title;
            toastService.warning(title ? `Invite to ${receiver} expired: ${title}` : `Invite to ${receiver} expired`);
          }

          if (message.type === 'invite_accepted') {
            const receiver = payload?.receiver?.username || 'player';
            toastService.success(`${receiver} accepted the invite`);
          }

          if (message.type === 'invite_declined') {
            const receiver = payload?.receiver?.username || 'player';
            toastService.info(`${receiver} declined the invite`);
          }

          if (message.type === 'game_updated' && payload?.game_id && (payload?.status === 'starting' || payload?.status === 'in_progress')) {
            const gameId = String(payload.game_id);
            const status = String(payload.status);
            const dedupeKey = `${gameId}:${status}:${payload?.countdown ?? ''}`;
            if (handledStatusRef.current[gameId] === dedupeKey) {
              return;
            }
            handledStatusRef.current[gameId] = dedupeKey;

            void (async () => {
              try {
                const game = await multiplayerAPI.getGame(gameId);
                if (!currentUser?.id) {
                  return;
                }

                const isInGame = Array.isArray(game.players) && game.players.some((p) => p.user_id === currentUser.id);
                if (!isInGame) {
                  return;
                }

                const routeGameType = ROUTE_BY_GAME_TYPE[game.game_type];
                if (!routeGameType) {
                  return;
                }

                const targetPath = `/games/multiplayer/${routeGameType}/${game.id}`;
                const livePathname = window.location.pathname || location.pathname;
                const normalizedPath = livePathname.replace(/\/+$/, '');
                const normalizedTargetPath = targetPath.replace(/\/+$/, '');
                const roomMatch = normalizedPath.match(/^\/games\/multiplayer\/[^/]+\/([^/]+)$/);
                const currentRoomGameId = roomMatch?.[1] ?? null;
                const isAlreadyInTargetRoom =
                  normalizedPath === normalizedTargetPath ||
                  normalizedPath.startsWith(`${normalizedTargetPath}/`) ||
                  currentRoomGameId === gameId;

                if (isAlreadyInTargetRoom) {
                  return;
                }

                if (status === 'starting' && typeof payload?.countdown === 'number') {
                  toastService.info(`Your game starts in ${payload.countdown}...`, 900);
                }

                if (normalizedPath !== normalizedTargetPath && (game.status === 'starting' || game.status === 'in_progress')) {
                  toastService.info('Game is starting. Redirecting you to the room...', 1000);
                  navigate(targetPath);
                }
              } catch {
                // Ignore fetch/navigation failures from transient updates
              }
            })();
          }
        } catch (err) {
          // console.error('[GlobalWS] parse error', err);
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (stopped) return;
        // reconnect with backoff up to 30s
        const attempt = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = attempt;
        const delay = Math.min(30000, 1000 * Math.pow(2, attempt));
        setTimeout(() => {
          if (!stopped) connect();
        }, delay);
      };

      ws.onerror = () => {
        // Let onclose handle reconnect
      };
    };

    connect();

    return () => {
      stopped = true;
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
    };
  }, [token, currentUser?.id, location.pathname, navigate]);

  return null;
};

export default GlobalMultiplayerListener;
