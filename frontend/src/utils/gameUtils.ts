import { PRONOUNS } from '../constants/gameConstants';
import { getConjugation } from './tenseUtils';

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns A new shuffled array
 */
export const shuffle = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

/**
 * Returns a random element from an array
 * @param array - Array to pick from
 * @returns A random element from the array
 */
export const randElement = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Gets the French pronoun by index (0-5)
 * @param index - Index of the pronoun (0=je, 1=tu, 2=il/elle, 3=nous, 4=vous, 5=ils/elles)
 * @returns The pronoun string with trailing space
 */
export const getPronoun = (index: number): string => {
    return PRONOUNS[index] || '';
};

/**
 * Generates a random integer between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer
 */
export const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Picks N unique random elements from an array
 * @param array - Array to pick from
 * @param count - Number of elements to pick
 * @returns Array of unique random elements
 */
export const pickRandom = <T,>(array: T[], count: number): T[] => {
    const shuffled = shuffle(array);
    return shuffled.slice(0, Math.min(count, array.length));
};

/**
 * Gets the conjugated form of a verb for a specific tense and person
 * Uses the correct tenseUtils function
 * @param verb - Verb object with conjugations
 * @param tense - Tense name (e.g., 'present', 'imparfait', 'passe_simple', 'futur_simple')
 * @param person - Person index (0=je, 1=tu, 2=il/elle, 3=nous, 4=vous, 5=ils/elles)
 * @returns The conjugated form or the infinitive as fallback
 */
export const getVerbConjugation = (verb: any, tense: string, person: number): string => {
    if (!verb.conjugations) {
        return verb.infinitive; // Fallback to infinitive
    }
    
    const personIndex = person + 1; // Convert to 1-based index for API
    const result = getConjugation(verb.conjugations, tense, personIndex);
    return result || verb.infinitive;
};
