import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toastService } from '../../services/toastService';
import { RootState } from '../../store/store';

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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);

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
          // We could handle presence/game update globally later if needed
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
  }, [token]);

  return null;
};

export default GlobalMultiplayerListener;
