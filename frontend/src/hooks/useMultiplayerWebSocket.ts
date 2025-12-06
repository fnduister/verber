import { useCallback, useEffect, useRef, useState } from 'react';
import { GameRound, multiplayerAPI, MultiplayerGamePlayer } from '../services/multiplayerApi';

export interface WebSocketMessage {
    type: 'player_joined' | 'player_left' | 'player_ready' | 'game_starting' | 'game_started' | 'round_start' | 'round_end' | 'game_finished' | 'timer_sync' | 'answer_submitted';
    data: any;
}

export interface PlayerJoinedData {
    player: MultiplayerGamePlayer;
}

export interface PlayerLeftData {
    user_id: number;
    username?: string;
    game_ended?: boolean;
    final_results?: any;
}

export interface PlayerReadyData {
    user_id: number;
    is_ready: boolean;
}

export interface RoundStartData {
    round: GameRound;
}

export interface RoundEndData {
    round_number: number;
    results: Array<{
        user_id: number;
        username: string;
        answer: string;
        is_correct: boolean;
        points: number;
        total_score: number;
    }>;
}

export interface GameFinishedData {
    players: Array<{
        user_id: number;
        username: string;
        score: number;
        rank: number;
    }>;
}

export interface GameStartingData {
    message: string;
    countdown?: number;
}

export interface TimerSyncData {
    time_left: number;
    round_number: number;
}

export interface AnswerSubmittedData {
    user_id: number;
    player_id: number;
}

interface UseMultiplayerWebSocketParams {
    gameId: string;
    enabled?: boolean; // Add enabled flag to control when to connect
    onPlayerJoined?: (data: PlayerJoinedData) => void;
    onPlayerLeft?: (data: PlayerLeftData) => void;
    onPlayerReady?: (data: PlayerReadyData) => void;
    onGameStarting?: (data: GameStartingData) => void;
    onRoundStart?: (data: RoundStartData) => void;
    onRoundEnd?: (data: RoundEndData) => void;
    onGameFinished?: (data: GameFinishedData) => void;
    onTimerSync?: (data: TimerSyncData) => void;
    onAnswerSubmitted?: (data: AnswerSubmittedData) => void;
    onError?: (error: Error) => void;
    onFatalError?: (error: Error) => void;
}

export const useMultiplayerWebSocket = ({
    gameId,
    enabled = true, // Default to enabled for backward compatibility
    onPlayerJoined,
    onPlayerLeft,
    onPlayerReady,
    onGameStarting,
    onRoundStart,
    onRoundEnd,
    onGameFinished,
    onTimerSync,
    onAnswerSubmitted,
    onError,
    onFatalError,
}: UseMultiplayerWebSocketParams) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef<number>(0);
    const [isConnected, setIsConnected] = useState(false);
    const [hasFatalError, setHasFatalError] = useState(false);
    const maxReconnectAttempts = 5;

    // Store callbacks in refs to avoid recreating connect function
    const callbacksRef = useRef({
        onPlayerJoined,
        onPlayerLeft,
        onPlayerReady,
        onGameStarting,
        onRoundStart,
        onRoundEnd,
        onGameFinished,
        onTimerSync,
        onAnswerSubmitted,
        onError,
        onFatalError,
    });

    // Update callbacks ref when they change
    useEffect(() => {
        callbacksRef.current = {
            onPlayerJoined,
            onPlayerLeft,
            onPlayerReady,
            onGameStarting,
            onRoundStart,
            onRoundEnd,
            onGameFinished,
            onTimerSync,
            onAnswerSubmitted,
            onError,
            onFatalError,
        };
    }, [onPlayerJoined, onPlayerLeft, onPlayerReady, onGameStarting, onRoundStart, onRoundEnd, onGameFinished, onTimerSync, onAnswerSubmitted, onError, onFatalError]);

    const connect = useCallback(() => {
        if (!enabled) {
            console.log('WebSocket: Connection disabled, skipping');
            return;
        }
        if (hasFatalError) {
            console.log('WebSocket: Skipping connection due to fatal error');
            return;
        }
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('WebSocket: Already connected, skipping');
            return;
        }

        try {
            const wsUrl = multiplayerAPI.getWebSocketUrl(gameId);
            console.log('WebSocket: Attempting to connect to:', wsUrl.replace(/token=.+/, 'token=***'));
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('WebSocket connected to game:', gameId);
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    console.log('WebSocket message received:', message);

                    switch (message.type) {
                        case 'player_joined':
                            callbacksRef.current.onPlayerJoined?.(message.data);
                            break;
                        case 'player_left':
                            callbacksRef.current.onPlayerLeft?.(message.data);
                            break;
                        case 'player_ready':
                            callbacksRef.current.onPlayerReady?.(message.data);
                            break;
                        case 'game_starting':
                            console.log('Game starting:', message.data);
                            callbacksRef.current.onGameStarting?.(message.data);
                            break;
                        case 'game_started':
                            console.log('Game started:', message.data);
                            // Optional: add callback if needed
                            break;
                        case 'round_start':
                            // Backend sends round object directly, wrap it in expected format
                            callbacksRef.current.onRoundStart?.({ round: message.data });
                            break;
                        case 'round_end':
                            callbacksRef.current.onRoundEnd?.(message.data);
                            break;
                        case 'game_finished':
                            callbacksRef.current.onGameFinished?.(message.data);
                            break;
                        case 'timer_sync':
                            callbacksRef.current.onTimerSync?.(message.data);
                            break;
                        case 'answer_submitted':
                            callbacksRef.current.onAnswerSubmitted?.(message.data);
                            break;
                        default:
                            console.warn('Unknown message type:', message.type);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    callbacksRef.current.onError?.(error as Error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (!hasFatalError) {
                    callbacksRef.current.onError?.(new Error('WebSocket connection error'));
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket closed:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean,
                    reconnectAttempts: reconnectAttemptsRef.current,
                    maxReconnectAttempts
                });
                setIsConnected(false);

                if (event.code === 1000) {
                    console.log('WebSocket: Normal closure, not reconnecting');
                    return;
                }

                // If we've reached the max attempts, trigger fatal error once and stop.
                if (reconnectAttemptsRef.current >= maxReconnectAttempts - 1) {
                    if (!hasFatalError) {
                        console.log('WebSocket: Max reconnection attempts reached');
                        setHasFatalError(true);
                        const fatal = new Error(`Unable to connect after ${maxReconnectAttempts} attempts`);
                        callbacksRef.current.onFatalError?.(fatal);
                        // Provide a final onError callback for backward compatibility
                        callbacksRef.current.onError?.(fatal);
                    }
                    return;
                }

                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
                console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectAttemptsRef.current += 1;
                    connect();
                }, delay);
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            if (reconnectAttemptsRef.current >= maxReconnectAttempts - 1 && !hasFatalError) {
                setHasFatalError(true);
                callbacksRef.current.onFatalError?.(error as Error);
            }
            if (!hasFatalError) {
                callbacksRef.current.onError?.(error as Error);
            }
        }
    }, [gameId, enabled, hasFatalError]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close(1000, 'User disconnected');
            wsRef.current = null;
        }

        setIsConnected(false);
        reconnectAttemptsRef.current = 0;
        setHasFatalError(false);
    }, []);

    const resetAndReconnect = useCallback(() => {
        setHasFatalError(false);
        reconnectAttemptsRef.current = 0;
        connect();
    }, [connect]);

    const sendMessage = useCallback((message: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not connected, cannot send message');
        }
    }, []);

    useEffect(() => {
        console.log('WebSocket useEffect: Mounting/Updating');
        connect();

        return () => {
            console.log('WebSocket useEffect: Cleaning up');
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            if (wsRef.current) {
                wsRef.current.close(1000, 'User disconnected');
                wsRef.current = null;
            }
        };
    }, [connect]);

    return {
        isConnected,
        sendMessage,
        disconnect,
        reconnect: connect,
        fatalError: hasFatalError,
        resetConnection: resetAndReconnect,
    };
};
