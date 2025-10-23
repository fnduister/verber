// Utility functions for working with verb tenses
import { AVAILABLE_TENSES, PRONOUNS, TENSE_MAP } from '../constants';
import { VerbConjugation } from '../types';

// Helper function to normalize Unicode strings for consistent comparison
export const normalizeString = (str: string): string => {
    // Normalize to NFC (composed form) to match most frontend constants
    return str.normalize('NFC');
};

// Helper function to safely compare French verb infinitives with normalization
export const compareVerbs = (verb1: string, verb2: string): boolean => {
    return normalizeString(verb1) === normalizeString(verb2);
};

// Helper function to find a verb by infinitive with proper Unicode normalization
export const findVerbByInfinitive = (verbs: any[], infinitive: string): any | undefined => {
    return verbs.find(verb => compareVerbs(verb.infinitive, infinitive));
};

// Helper function to get conjugation for a specific tense and person
export const getConjugation = (conjugations: VerbConjugation, tense: string, person: number): string => {
    debugger;
    const key = `${tense}_${person + 1}` as keyof VerbConjugation;
    return conjugations[key] as string || '';
};

// Helper function to get all persons for a tense
export const getTenseConjugations = (conjugations: VerbConjugation, tense: string): string[] => {
    return Array.from({length: 6}, (_, i) => getConjugation(conjugations, tense, i + 1));
};

// Helper function to get available tenses from conjugations
export const getAvailableTenses = (conjugations: VerbConjugation): string[] => {
    const tenses = new Set<string>();
    Object.keys(conjugations).forEach(key => {
        if (key.includes('_') && !key.startsWith('verb') && key !== 'id' && key !== 'verb_id') {
            const tense = key.replace(/_[1-6]$/, '');
            tenses.add(tense);
        }
    });
    return Array.from(tenses);
};

// Helper function to get display name for a tense
export const getTenseDisplayName = (tense: string): string => {
    return TENSE_MAP[tense]?.displayName || tense;
};

// Helper function to get tenses by category
export const getTensesByCategory = (category?: 'indicative' | 'subjunctive' | 'conditional' | 'imperative'): string[] => {
    if (!category) return Object.keys(TENSE_MAP);
    return Object.keys(TENSE_MAP).filter(key => TENSE_MAP[key].category === category);
};

// Example usage and validation
export const validateTenseMapping = () => {
    console.log('Available tense categories:', {
        indicative: getTensesByCategory('indicative'),
        subjunctive: getTensesByCategory('subjunctive'),
        conditional: getTensesByCategory('conditional'),
        imperative: getTensesByCategory('imperative')
    });
};

// Function to format conjugations for display
export const formatConjugationTable = (conjugations: VerbConjugation, tense: string) => {
    const tenseConjugations = getTenseConjugations(conjugations, tense);
    
    return PRONOUNS.map((person, index) => ({
        person,
        form: tenseConjugations[index] || ''
    }));
};

// Function to get conjugation with subject pronoun
export const getConjugationWithPronoun = (conjugations: VerbConjugation, tense: string, person: number): string => {
    const conjugation = getConjugation(conjugations, tense, person);
    const pronoun = PRONOUNS[person - 1];
    
    return conjugation ? `${pronoun} ${conjugation}` : '';
};

// Function to validate that all expected tenses exist
export const validateConjugations = (conjugations: VerbConjugation): { valid: boolean; missingTenses: string[] } => {
    const requiredTenses = [
        'present', 'imparfait', 'passe_simple', 'futur_simple',
        'passe_compose', 'plus_que_parfait', 'passe_anterieur', 'futur_anterieur'
    ];
    
    const availableTenses = getAvailableTenses(conjugations);
    const missingTenses = requiredTenses.filter(tense => !availableTenses.includes(tense));
    
    return {
        valid: missingTenses.length === 0,
        missingTenses
    };
};

// Function to check if a tense is compound (needs auxiliary)
export const isCompoundTense = (tense: string): boolean => {
    return TENSE_MAP[tense]?.compound || false;
};

// Function to get tense category
export const getTenseCategory = (tense: string): string => {
    return TENSE_MAP[tense]?.category || 'unknown';
};

// Function to get random tense from a category
export const getRandomTenseFromCategory = (category: 'indicative' | 'subjunctive' | 'conditional' | 'imperative'): string => {
    const tenses = getTensesByCategory(category);
    return tenses[Math.floor(Math.random() * tenses.length)];
};

// Function to get all conjugations for a verb as a flat object
export const getAllConjugations = (conjugations: VerbConjugation): Record<string, string> => {
    const result: Record<string, string> = {};
    AVAILABLE_TENSES.forEach(tense => {
        for (let person = 1; person <= 6; person++) {
            const conjugation = getConjugation(conjugations, tense, person);
            if (conjugation) {
                result[`${tense}_${person}`] = conjugation;
            }
        }
    });
    return result;
};

// Function to validate that getConjugation is working correctly
export const testConjugationMapping = (conjugations: VerbConjugation, infinitive: string = 'test verb'): void => {
    console.log(`\n=== Testing conjugation mapping for: ${infinitive} ===`);
    
    // Test each available tense
    AVAILABLE_TENSES.forEach(tense => {
        console.log(`\n${getTenseDisplayName(tense)}:`);
        for (let person = 1; person <= 6; person++) {
            const conjugation = getConjugation(conjugations, tense, person);
            const pronoun = PRONOUNS[person - 1];
            const status = conjugation ? '✓' : '✗';
            console.log(`  ${status} ${pronoun}: ${conjugation || 'MISSING'}`);
        }
    });
    
    // Check for any extra keys that might not be mapped
    const mappedKeys = new Set<string>();
    AVAILABLE_TENSES.forEach(tense => {
        for (let person = 1; person <= 6; person++) {
            mappedKeys.add(`${tense}_${person}`);
        }
    });
    
    const unmappedKeys = Object.keys(conjugations).filter(key => 
        key.includes('_') && 
        !key.startsWith('verb') && 
        key !== 'id' && 
        key !== 'verb_id' && 
        !mappedKeys.has(key)
    );
    
    if (unmappedKeys.length > 0) {
        console.log('\n⚠️ Unmapped keys found:');
        unmappedKeys.forEach(key => console.log(`  - ${key}: ${(conjugations as any)[key]}`));
    }
    
    console.log(`\n=== End test for: ${infinitive} ===\n`);
};

// Function to get safe conjugation (with fallback)
export const getSafeConjugation = (conjugations: VerbConjugation, tense: string, person: number, fallback: string = ''): string => {
    try {
        const result = getConjugation(conjugations, tense, person);
        return result || fallback;
    } catch (error) {
        console.error(`Error getting conjugation for tense: ${tense}, person: ${person}`, error);
        return fallback;
    }
};

// Utility object for validation functions
export const tenseUtilities = {
    validateTenseMapping,
    formatConjugationTable,
    getConjugationWithPronoun,
    validateConjugations
};