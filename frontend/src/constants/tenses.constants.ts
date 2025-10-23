// Constants for French verb tenses mapping
import { TenseInfo } from '../types/verb.types';

export const TENSE_MAP: Record<string, TenseInfo> = {
    present: {
        key: 'present',
        displayName: 'Présent',
        category: 'indicative',
        compound: false
    },
    imparfait: {
        key: 'imparfait',
        displayName: 'Imparfait',
        category: 'indicative',
        compound: false
    },
    passe_simple: {
        key: 'passe_simple',
        displayName: 'Passé Simple',
        category: 'indicative',
        compound: false
    },
    futur_simple: {
        key: 'futur_simple',
        displayName: 'Futur Simple',
        category: 'indicative',
        compound: false
    },
    passe_compose: {
        key: 'passe_compose',
        displayName: 'Passé Composé',
        category: 'indicative',
        compound: true
    },
    plus_que_parfait: {
        key: 'plus_que_parfait',
        displayName: 'Plus-que-parfait',
        category: 'indicative',
        compound: true
    },
    passe_anterieur: {
        key: 'passe_anterieur',
        displayName: 'Passé Antérieur',
        category: 'indicative',
        compound: true
    },
    futur_anterieur: {
        key: 'futur_anterieur',
        displayName: 'Futur Antérieur',
        category: 'indicative',
        compound: true
    },
    subjonctif_present: {
        key: 'subjonctif_present',
        displayName: 'Subjonctif Présent',
        category: 'subjunctive',
        compound: false
    },
    subjonctif_imparfait: {
        key: 'subjonctif_imparfait',
        displayName: 'Subjonctif Imparfait',
        category: 'subjunctive',
        compound: false
    },
    subjonctif_passe: {
        key: 'subjonctif_passe',
        displayName: 'Subjonctif Passé',
        category: 'subjunctive',
        compound: true
    },
    subjonctif_plus_que_parfait: {
        key: 'subjonctif_plus_que_parfait',
        displayName: 'Subjonctif Plus-que-parfait',
        category: 'subjunctive',
        compound: true
    },
    conditionnel_present: {
        key: 'conditionnel_present',
        displayName: 'Conditionnel Présent',
        category: 'conditional',
        compound: false
    },
    conditionnel_passe: {
        key: 'conditionnel_passe',
        displayName: 'Conditionnel Passé',
        category: 'conditional',
        compound: true
    },
    conditionnel_passe_ii: {
        key: 'conditionnel_passe_ii',
        displayName: 'Conditionnel Passé II',
        category: 'conditional',
        compound: true
    },
    imperatif: {
        key: 'imperatif',
        displayName: 'Impératif',
        category: 'imperative',
        compound: false
    },
    imperatif_passe: {
        key: 'imperatif_passe',
        displayName: 'Impératif Passé',
        category: 'imperative',
        compound: true
    }
};

// Tense display names (French to formatted display)
export const TENSE_KEY_TO_DISPLAY_NAMES: Record<string, string> = {
    'present': 'Présent',
    'passe_compose': 'Passé composé',
    'plus_que_parfait': 'Plus-que-parfait',
    'passe_simple': 'Passé simple',
    'passe_anterieur': 'Passé antérieur',
    'futur_simple': 'Futur simple',
    'futur_anterieur': 'Futur antérieur',
    'conditionnel_present': 'Conditionnel présent',
    'conditionnel_passe': 'Conditionnel passé',
    'subjonctif_present': 'Subjonctif présent',
    'subjonctif_passe': 'Subjonctif passé',
    'subjonctif_imparfait': 'Subjonctif imparfait',
    'subjonctif_plus_que_parfait': 'Subjonctif plus-que-parfait',
    'present_imperatif': 'Impératif présent',
    'passe_imperatif': 'Impératif passé',
};

export const TENSE_DISPLAY_NAMES_TO_KEY: Record<string, string> = {
    'Présent': 'present',
    'Passé composé': 'passe_compose',
    'Imperatif': 'imperatif',
    'Imparfait': 'imparfait',
    'Plus-que-parfait': 'plus_que_parfait',
    'Passé simple': 'passe_simple',
    'Passé antérieur': 'passe_anterieur',
    'Futur simple': 'futur_simple',
    'Futur antérieur': 'futur_anterieur',
    'Conditionnel présent': 'conditionnel_present',
    'Conditionnel passé': 'conditionnel_passe',
    'Subjonctif présent': 'subjonctif_present',
    'Subjonctif passé': 'subjonctif_passe',
    'Subjonctif imparfait': 'subjonctif_imparfait',
    'Subjonctif plus-que-parfait': 'subjonctif_plus_que_parfait',
    'Impératif présent': 'present_imperatif',
    'Impératif passé': 'passe_imperatif',
};

// Tenses available in the database (matching API structure)
export const AVAILABLE_TENSES = [
    'present',
    'imparfait',
    'passe_simple',
    'futur_simple',
    'passe_compose',
    'plus_que_parfait',
    'passe_anterieur',
    'futur_anterieur',
    'subjonctif_present',
    'subjonctif_imparfait',
    'subjonctif_passe',
    'subjonctif_plus_que_parfait',
    'conditionnel_present',
    'conditionnel_passe',
    'conditionnel_passe_ii',
    'imperatif',
    'imperatif_passe',
] as const;

// Cache duration: 24 hours
export const CACHE_DURATION = 24 * 60 * 60 * 1000;