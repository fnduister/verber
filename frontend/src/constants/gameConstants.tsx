import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import TimerIcon from '@mui/icons-material/Timer';

// French pronouns for conjugation
export const PRONOUNS = ["je/j' ", 'tu ', 'il/elle ', 'nous ', 'vous ', 'ils/elles '];

// Tense display names (French to formatted display)
export const TENSE_DISPLAY_NAMES: Record<string, string> = {
    'présent': 'Présent',
    'passé composé': 'Passé composé',
    'imparfait': 'Imparfait',
    'plus-que-parfait': 'Plus-que-parfait',
    'passé simple': 'Passé simple',
    'passé antérieur': 'Passé antérieur',
    'futur simple': 'Futur simple',
    'futur antérieur': 'Futur antérieur',
    'conditionnel présent': 'Conditionnel présent',
    'conditionnel passé': 'Conditionnel passé',
    'subjonctif présent': 'Subjonctif présent',
    'subjonctif passé': 'Subjonctif passé',
    'subjonctif imparfait': 'Subjonctif imparfait',
    'subjonctif plus-que-parfait': 'Subjonctif plus-que-parfait',
    'impératif présent': 'Impératif présent',
    'impératif passé': 'Impératif passé',
};

export const TENSE_NAMES_KEY: Record<string, string> = {
    'présent': 'present',
    'passé composé': 'passe_compose',
    'imperatif': 'imperatif',
    'imparfait': 'imparfait',
    'plus-que-parfait': 'plus_que_parfait',
    'passé simple': 'passe_simple',
    'passé antérieur': 'passe_anterieur',
    'futur simple': 'futur_simple',
    'futur antérieur': 'futur_anterieur',
    'conditionnel présent': 'conditionnel_present',
    'conditionnel passé': 'conditionnel_passe',
    'subjonctif présent': 'subjonctif_present',
    'subjonctif passé': 'subjonctif_passe',
    'subjonctif imparfait': 'subjonctif_imparfait',
    'subjonctif plus-que-parfait': 'subjonctif_plus_que_parfait',
    'impératif présent': 'present_imperatif',
    'impératif passé': 'passe_imperatif',
};

// Speed options for timed games
export const GAME_SPEEDS = [
    { name: 'Trop lent Mael', value: 240 },
    { name: 'Lent 1', value: 120 },
    { name: 'Lent', value: 60 },
    { name: 'Normal', value: 30 },
    { name: 'Rapide', value: 10 },
    { name: 'Très rapide', value: 3 },
];

// Special tenses that may have different handling
export const SPECIAL_TENSES = [
    'passé simple',
    'passé antérieur',
    'subjonctif imparfait',
    'subjonctif plus-que-parfait',
];

// Preset verb groups for quick selection
export const PRESET_VERB_GROUPS = [
    { title: 'Verbes fréquents', verbs: ['être', 'avoir', 'aller', 'faire', 'dire', 'pouvoir'] },
    { title: 'Verbes du 1er groupe', verbs: ['parler', 'manger', 'aimer', 'donner'] },
    { title: 'Verbes du 2ème groupe', verbs: ['finir', 'choisir', 'réussir'] },
    { title: 'Auxiliaires', verbs: ['être', 'avoir'] },
];

// Preset tense groups for quick selection
export const PRESET_TENSE_GROUPS = [
    { title: 'Temps simples', tenses: ['présent', 'imparfait', 'futur simple'] },
    { title: 'Temps composés', tenses: ['passé composé', 'plus-que-parfait', 'futur antérieur', 'passé antérieur'] },
    { title: 'Mode conditionnel', tenses: ['conditionnel présent', 'conditionnel passé'] },
];

// Game metadata for different game modes
export const GAME_METADATA: Record<string, { title: string; url: string }> = {
    'find-error': { title: '🎯 Find Error', url: 'find-error' },
    matching: { title: '🎴 Matching Game', url: 'matching' },
    'write-me': { title: '✍️ Fill in the Blanks', url: 'write-me' },
    'speed-round': { title: '⚡ Speed Round', url: 'speed-round' },
    race: { title: '🏁 Conjugation Race', url: 'race' },
    complete: { title: '📝 Complete Mode', url: 'complete' },
};

// Game types with full details for dashboard display
export const GAME_TYPES = [
    {
        id: 'find-error',
        title: '🎯 Find Error',
        description: 'Identify and correct errors in sentences. Perfect for honing your grammar skills.',
        difficulty: 'Medium',
        duration: '5 min',
        players: '1-4 players',
        color: '#3b82f6',
        icon: <SportsEsportsIcon sx={{ fontSize: 48 }} />,
    },
    {
        id: 'matching',
        title: '🎴 Matching Game',
        description: 'Match infinitives with their correct conjugated forms. Perfect for visual learners.',
        difficulty: 'Easy',
        duration: '3 min',
        players: '1-2 players',
        color: '#10b981',
        icon: <PeopleIcon sx={{ fontSize: 48 }} />,
    },
    {
        id: 'write-me',
        title: '✍️ Fill in the Blanks',
        description: 'Complete sentences with the correct verb forms. Practice in context.',
        difficulty: 'Medium',
        duration: '4 min',
        players: '1-4 players',
        color: '#f59e0b',
        icon: <TimerIcon sx={{ fontSize: 48 }} />,
    },
    {
        id: 'race',
        title: '🏁 Conjugation Race',
        description: 'Compete against the clock to conjugate verbs correctly. How fast can you go?',
        difficulty: 'Hard',
        duration: '1 min',
        players: '1-4 players',
        color: '#ef4444',
        icon: <EmojiEventsIcon sx={{ fontSize: 48 }} />,
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
