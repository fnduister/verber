import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import TimerIcon from '@mui/icons-material/Timer';

// French pronouns for conjugation
export const PRONOUNS = ["je/j' ", 'tu ', 'il/elle ', 'nous ', 'vous ', 'ils/elles '];

export const MIN_PREREQUISITE_VERBS: Record<string, number> = {
    'find-error': 1,
    'matching': 1,
    'write-me': 1,
    'race': 1,
    'random-verb': 3,
    'sentence': 0, // No verb selection needed, uses predefined sentences
    'participe': 3 // Participe - select verbs only
}

export const MIN_PREREQUISITE_TENSES: Record<string, number> = {
    'find-error': 2,
    'matching': 3,
    'write-me': 1,
    'race': 3,
    'random-verb': 1,
    'sentence': 1, // Player selects tenses for sentence conjugation
    'participe': 0 // No tense selection needed - player selects participe type instead
}

// Participle types for the participe game
export const PARTICIPE_TYPES = [
    { id: 'past', label: 'games.participe.types.past', displayName: 'Participe Passé' },
    { id: 'present', label: 'games.participe.types.present', displayName: 'Participe Présent' }
] as const;

export const MIN_PREREQUISITE_PARTICIPE_TYPES = 1; // At least one participe type must be selected

// Speed options for timed games
export const GAME_SPEEDS = [
    { name: 'Ben Trop lent', value: 240 },
    { name: 'Lent 1', value: 120 },
    { name: 'Lent', value: 60 },
    { name: 'Normal', value: 30 },
    { name: 'Rapide', value: 10 },
    { name: 'Très rapide', value: 3 },
];

// Special tenses that may have different handling
export const SPECIAL_TENSES = [
    'imperatif', 'imperatif_passe'
];

export const MAX_TRIES = 10;

// Preset verb groups for quick selection
export const PRESET_VERB_GROUPS = [
    { title: 'Verbes fréquents', verbs: ['être', 'avoir', 'aller', 'faire', 'dire', 'pouvoir'] },
    { title: 'Verbes du 1er groupe', verbs: ['parler', 'manger', 'aimer', 'donner'] },
    { title: 'Verbes du 2ème groupe', verbs: ['finir', 'choisir', 'réussir'] },
    { title: 'Auxiliaires', verbs: ['être', 'avoir'] },
];

// Preset tense groups for quick selection
export const PRESET_TENSE_GROUPS = [
    { title: 'Temps simples', tenses: ['present', 'imparfait', 'futur_simple'] },
    { title: 'Temps composés', tenses: ['passe_compose', 'plus_que_parfait', 'futur_anterieur', 'passe_anterieur'] },
    { title: 'Mode conditionnel', tenses: ['conditionnel_present', 'conditionnel_passe'] },
];

// Game metadata for different game modes
export const GAME_METADATA: Record<string, { title: string; url: string }> = {
    'find-error': { title: '🎯 Find Error', url: 'find-error' },
    matching: { title: '🎴 Matching Game', url: 'matching' },
    'write-me': { title: '✍️ Fill in the Blanks', url: 'write-me' },
    'speed-round': { title: '⚡ Speed Round', url: 'speed-round' },
    race: { title: '🏁 Conjugation Race', url: 'race' },
    complete: { title: '📝 Complete Mode', url: 'complete' },
    'random-verb': { title: '🎲 Random Verb', url: 'random-verb' },
    'sentence': { title: '📖 Sentence Challenge', url: 'sentence' },
    'participe': { title: '📝 Participe', url: 'participe' },
};

// Game types with full details for dashboard display
export const GAME_TYPES = [
    {
        id: 'find-error',
        title: '🎯 Find Error',
        description: 'Identify and correct errors in sentences. Perfect for honing your grammar skills.',
        difficulty: 'Medium',
        duration: '5 min',
        players: '1-4',
        color: '#3b82f6',
        icon: <SportsEsportsIcon sx={{ fontSize: 48 }} />,
    },
    {
        id: 'matching',
        title: '🎴 Matching Game',
        description: 'Match infinitives with their correct conjugated forms. Perfect for visual learners.',
        difficulty: 'Easy',
        duration: '3 min',
        players: '1-2',
        color: '#10b981',
        icon: <PeopleIcon sx={{ fontSize: 48 }} />,
    },
    {
        id: 'write-me',
        title: '✍️ Fill in the Blanks',
        description: 'Complete sentences with the correct verb forms. Practice in context.',
        difficulty: 'Medium',
        duration: '4 min',
        players: '1-4',
        color: '#f59e0b',
        icon: <TimerIcon sx={{ fontSize: 48 }} />,
    },
    {
        id: 'race',
        title: '🏁 Conjugation Race',
        description: 'Compete against the clock to conjugate verbs correctly. How fast can you go?',
        difficulty: 'Hard',
        duration: '1 min',
        players: '1-4',
        color: '#ef4444',
        icon: <EmojiEventsIcon sx={{ fontSize: 48 }} />,
    },
    {
        id: 'random-verb',
        title: '🎲 Random Verb',
        description: 'Test your skills with random verbs and tenses. Each question is a surprise!',
        difficulty: 'Medium',
        duration: '5 min',
        players: '1',
        color: '#8b5cf6',
        icon: <SportsEsportsIcon sx={{ fontSize: 48 }} />,
    },
    {
        id: 'sentence',
        title: '📖 Sentence Challenge',
        description: 'Complete sentences by conjugating verbs in context. Choose your tenses and master real-world usage!',
        difficulty: 'Medium',
        duration: '10 min',
        players: '1',
        color: '#06b6d4',
        icon: <TimerIcon sx={{ fontSize: 48 }} />,
    },
    {
        id: 'participe',
        title: '📝 Participe',
        description: 'Master French participles! Choose between past participle and present participle.',
        difficulty: 'Easy',
        duration: '5 min',
        players: '1',
        color: '#ec4899',
        icon: <SportsEsportsIcon sx={{ fontSize: 48 }} />,
    },
];

// Difficulty color mapping
export const DIFFICULTY_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    Easy: 'success',
    Medium: 'warning',
    Hard: 'error',
};

// Game settings defaults
export const DEFAULT_GAME_SETTINGS = {
    maxStep: 5,
    maxTime: 10,
    minQuestions: 5,
    maxQuestions: 15,
    questionSteps: [5, 10, 15],
};
