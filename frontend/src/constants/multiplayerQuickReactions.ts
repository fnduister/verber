export type ReactionContext = 'answer_submitted' | 'round_end' | 'game_event';

export type PromptOption = {
    id: string;
    label: string;
};

export type QuickReactionOption = {
    promptId: string;
    emoji: string;
};

export const PROMPT_LABELS: Record<string, string> = {
    nice_try: 'Nice try!',
    you_got_this: 'You got this!',
    wow_fast: 'Wow, so fast!',
    great_round: 'Great round!',
    high_five: 'High five!',
    lets_go: 'Let\'s go!',
    ready_to_play: 'Ready to play!',
    good_luck: 'Good luck!',
    i_am_excited: 'I am excited!',
};

export const EMOJI_OPTIONS = ['😀', '👏', '🔥', '👍', '💪', '🎉', '🤩', '❤️'];

export const PROMPTS_BY_CONTEXT: Record<ReactionContext, PromptOption[]> = {
    answer_submitted: [
        { id: 'nice_try', label: PROMPT_LABELS.nice_try },
        { id: 'you_got_this', label: PROMPT_LABELS.you_got_this },
        { id: 'wow_fast', label: PROMPT_LABELS.wow_fast },
    ],
    round_end: [
        { id: 'great_round', label: PROMPT_LABELS.great_round },
        { id: 'high_five', label: PROMPT_LABELS.high_five },
        { id: 'lets_go', label: PROMPT_LABELS.lets_go },
    ],
    game_event: [
        { id: 'ready_to_play', label: PROMPT_LABELS.ready_to_play },
        { id: 'good_luck', label: PROMPT_LABELS.good_luck },
        { id: 'i_am_excited', label: PROMPT_LABELS.i_am_excited },
    ],
};

export const getPromptLabel = (promptId: string): string => {
    return PROMPT_LABELS[promptId] || 'Great job!';
};
