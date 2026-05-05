const STORAGE_KEY = 'verber.favoritePlayers';

const readFavoriteIds = (): number[] => {
    try {
        const rawValue = localStorage.getItem(STORAGE_KEY);
        if (!rawValue) {
            return [];
        }

        const parsed = JSON.parse(rawValue);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((value): value is number => Number.isInteger(value));
    } catch {
        return [];
    }
};

const writeFavoriteIds = (playerIds: number[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playerIds));
};

export const getFavoritePlayerIds = (): number[] => readFavoriteIds();

export const isFavoritePlayer = (playerId: number): boolean => {
    return readFavoriteIds().includes(playerId);
};

export const toggleFavoritePlayer = (playerId: number): number[] => {
    const favoriteIds = readFavoriteIds();
    const nextIds = favoriteIds.includes(playerId)
        ? favoriteIds.filter((id) => id !== playerId)
        : [...favoriteIds, playerId];

    writeFavoriteIds(nextIds);
    return nextIds;
};