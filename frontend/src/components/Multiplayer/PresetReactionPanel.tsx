import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { EMOJI_OPTIONS, getPromptLabel, PROMPTS_BY_CONTEXT, ReactionContext } from '../../constants/multiplayerQuickReactions';
import { QuickReactionData } from '../../hooks/useMultiplayerWebSocket';
import { MultiplayerGamePlayer } from '../../services/multiplayerApi';

type QuickReactionItem = QuickReactionData & {
    id: string;
    timestamp: number;
};

interface PresetReactionPanelProps {
    context: ReactionContext;
    players: MultiplayerGamePlayer[];
    reactions: QuickReactionItem[];
    onSendReaction: (payload: { promptId: string; emoji: string; context: ReactionContext }) => void;
}

const PresetReactionPanel: React.FC<PresetReactionPanelProps> = ({
    context,
    players,
    reactions,
    onSendReaction,
}) => {
    const prompts = PROMPTS_BY_CONTEXT[context];

    const usernameByUserId = useMemo(() => {
        const map: Record<number, string> = {};
        players.forEach((player) => {
            map[player.user_id] = player.user?.username || `Player ${player.user_id}`;
        });
        return map;
    }, [players]);

    const visibleReactions = reactions.slice(-6).reverse();

    return (
        <Paper
            elevation={0}
            sx={{
                mt: 2,
                p: 2,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)',
            }}
        >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#9a3412', mb: 1 }}>
                Quick Reactions
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
                {prompts.map((prompt) => (
                    <Chip
                        key={prompt.id}
                        label={prompt.label}
                        onClick={() => onSendReaction({ promptId: prompt.id, emoji: '👏', context })}
                        sx={{
                            fontWeight: 600,
                            backgroundColor: 'white',
                            border: '1px solid #fed7aa',
                        }}
                    />
                ))}
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
                {EMOJI_OPTIONS.map((emoji) => (
                    <Chip
                        key={emoji}
                        label={emoji}
                        onClick={() => onSendReaction({ promptId: prompts[0].id, emoji, context })}
                        sx={{
                            minWidth: 44,
                            fontSize: '1.1rem',
                            backgroundColor: 'white',
                            border: '1px solid #fed7aa',
                        }}
                    />
                ))}
            </Stack>

            <Box sx={{ display: 'grid', gap: 0.8 }}>
                {visibleReactions.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        No reactions yet.
                    </Typography>
                )}
                {visibleReactions.map((reaction) => (
                    <Typography key={reaction.id} variant="body2" sx={{ color: '#7c2d12' }}>
                        <strong>{usernameByUserId[reaction.sender_id] || 'Player'}</strong> {reaction.emoji} {getPromptLabel(reaction.prompt_id)}
                    </Typography>
                ))}
            </Box>
        </Paper>
    );
};

export default PresetReactionPanel;
