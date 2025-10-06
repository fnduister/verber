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

// French subject pronouns
export const FRENCH_PRONOUNS = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'] as const;

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