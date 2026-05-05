import { Dispatch, SetStateAction, useCallback } from 'react';
import { MultiplayerGame } from '../services/multiplayerApi';
import { toastService } from '../services/toastService';
import { PlayerLeftData, PlayerReadyData, RoundEndData } from './useMultiplayerWebSocket';

type JoinedPlayerPayload = {
    player?: MultiplayerGame['players'][number];
};

type RoundEndPlayerScore = {
    user_id: number;
    score: number;
};

type RoundEndPayload = RoundEndData & {
    players?: RoundEndPlayerScore[];
    round_winners?: number[];
};

interface UseMultiplayerGameEventHandlersParams {
    game: MultiplayerGame | null;
    setGame: Dispatch<SetStateAction<MultiplayerGame | null>>;
    currentUserId?: number;
    previousScores: { [userId: number]: number };
    setRoundScoreGains: Dispatch<SetStateAction<{ [userId: number]: number }>>;
    setRoundWinners: Dispatch<SetStateAction<number[]>>;
    setAllPlayersAnswered: Dispatch<SetStateAction<boolean>>;
    setFinalResults: Dispatch<SetStateAction<unknown>>;
    setShowFinalResults: Dispatch<SetStateAction<boolean>>;
    deriveRoundWinners: (scoreGains: { [userId: number]: number }, payload: RoundEndPayload) => number[];
    buildFallbackFinalResults?: (game: MultiplayerGame, leftUserId: number) => unknown;
}

export const useMultiplayerGameEventHandlers = ({
    game,
    setGame,
    currentUserId,
    previousScores,
    setRoundScoreGains,
    setRoundWinners,
    setAllPlayersAnswered,
    setFinalResults,
    setShowFinalResults,
    deriveRoundWinners,
    buildFallbackFinalResults,
}: UseMultiplayerGameEventHandlersParams) => {
    const distributeLeavingScore = useCallback((
        remainingPlayers: MultiplayerGame['players'],
        leavingScore: number,
    ) => {
        if (remainingPlayers.length === 0 || leavingScore <= 0) {
            return {
                updatedPlayers: remainingPlayers,
                scoreGains: {} as { [userId: number]: number },
            };
        }

        const sorted = [...remainingPlayers].sort((a, b) => b.score - a.score);
        const baseShare = Math.floor(leavingScore / sorted.length);
        const remainder = leavingScore % sorted.length;
        const scoreGains: { [userId: number]: number } = {};

        const boosted = sorted.map((player, index) => {
            const gain = baseShare + (index < remainder ? 1 : 0);
            scoreGains[player.user_id] = gain;
            return {
                ...player,
                score: player.score + gain,
            };
        });

        return {
            updatedPlayers: boosted,
            scoreGains,
        };
    }, []);

    const onPlayerJoined = useCallback((data: JoinedPlayerPayload) => {
        const joinedPlayer = data.player ?? (data as unknown as MultiplayerGame['players'][number]);

        if (game && joinedPlayer && !game.players.find((player) => player.user_id === joinedPlayer.user_id)) {
            setGame({
                ...game,
                players: [...game.players, joinedPlayer],
            });
        }
    }, [game, setGame]);

    const onPlayerLeft = useCallback((data: PlayerLeftData) => {
        const leftPlayer = game?.players.find((player) => player.user_id === data.user_id);
        const playerName = data.username || leftPlayer?.user?.username || 'A player';

        if (leftPlayer && leftPlayer.user_id !== currentUserId) {
            toastService.info(`${playerName} left the game`);
        }

        if (!game) {
            return;
        }

        const remainingPlayers = game.players.filter((player) => player.user_id !== data.user_id);
        const leavingScore = Math.max(0, leftPlayer?.score || 0);
        const { updatedPlayers, scoreGains } = distributeLeavingScore(remainingPlayers, leavingScore);

        setGame({
            ...game,
            players: updatedPlayers,
        });
        setRoundScoreGains(scoreGains);

        if (updatedPlayers.length > 2) {
            return;
        }

        if (data.final_results) {
            setFinalResults(data.final_results);
            setShowFinalResults(true);
            return;
        }

        if (buildFallbackFinalResults) {
            const gameWithRedistributedPlayers: MultiplayerGame = {
                ...game,
                players: updatedPlayers,
            };
            setFinalResults(buildFallbackFinalResults(gameWithRedistributedPlayers, data.user_id));
            setShowFinalResults(true);
            return;
        }

        setFinalResults({
            game_id: game.id,
            players: [...updatedPlayers].sort((a, b) => b.score - a.score),
        });
        setShowFinalResults(true);
    }, [
        buildFallbackFinalResults,
        currentUserId,
        distributeLeavingScore,
        game,
        setFinalResults,
        setGame,
        setRoundScoreGains,
        setShowFinalResults,
    ]);

    const onPlayerReady = useCallback((data: PlayerReadyData) => {
        if (game) {
            setGame({
                ...game,
                players: game.players.map((player) =>
                    player.user_id === data.user_id ? { ...player, is_ready: data.is_ready } : player
                ),
            });
        }
    }, [game, setGame]);

    const onRoundEnd = useCallback((data: RoundEndPayload) => {
        if (game && data.players && Array.isArray(data.players)) {
            const scoreGains: { [userId: number]: number } = {};
            const updatedPlayers = game.players.map((player) => {
                const updatedPlayer = data.players?.find((entry) => entry.user_id === player.user_id);
                if (updatedPlayer) {
                    const previousScore = previousScores[player.user_id] || 0;
                    const gain = updatedPlayer.score - previousScore;
                    scoreGains[player.user_id] = gain;
                    return { ...player, score: updatedPlayer.score };
                }

                return player;
            });

            setGame({ ...game, players: updatedPlayers });
            setRoundScoreGains(scoreGains);
            setRoundWinners(deriveRoundWinners(scoreGains, data));
        }

        setAllPlayersAnswered(true);
    }, [deriveRoundWinners, game, previousScores, setAllPlayersAnswered, setGame, setRoundScoreGains, setRoundWinners]);

    return {
        onPlayerJoined,
        onPlayerLeft,
        onPlayerReady,
        onRoundEnd,
    };
};