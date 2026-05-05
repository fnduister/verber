export const mapMultiplayerErrorMessage = (rawMessage?: string): string | null => {
    if (!rawMessage) {
        return null;
    }

    const message = rawMessage.toLowerCase();

    if (message.includes('already hosting an active game')) {
        return 'You are already hosting another active game. Leave or finish it before creating a new one.';
    }

    if (message.includes('already in another game lobby')) {
        return 'You are already in another game lobby. Leave it before joining or creating a new lobby.';
    }

    if (message.includes('already in game')) {
        return 'You are already in this game.';
    }

    return null;
};