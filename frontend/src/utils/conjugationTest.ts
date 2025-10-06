// Test file to validate tense mapping and getConjugation function
import { AVAILABLE_TENSES } from '../constants';
import { getAvailableTenses, getConjugation, testConjugationMapping } from '../utils/tenseUtils';

// Mock conjugation data based on actual API structure
const mockAvoirConjugations = {
    // Present tense
    present_1: 'ai',
    present_2: 'as', 
    present_3: 'a',
    present_4: 'avons',
    present_5: 'avez',
    present_6: 'ont',
    // Imparfait
    imparfait_1: 'avais',
    imparfait_2: 'avais',
    imparfait_3: 'avait',
    imparfait_4: 'avions',
    imparfait_5: 'aviez',
    imparfait_6: 'avaient',
    // Add other tenses...
    passe_simple_1: 'eus',
    passe_simple_2: 'eus',
    passe_simple_3: 'eut',
    passe_simple_4: 'eûmes',
    passe_simple_5: 'eûtes',
    passe_simple_6: 'eurent',
    futur_simple_1: 'aurai',
    futur_simple_2: 'auras',
    futur_simple_3: 'aura',
    futur_simple_4: 'aurons',
    futur_simple_5: 'aurez',
    futur_simple_6: 'auront',
    subjonctif_present_1: 'aie',
    subjonctif_present_2: 'aies',
    subjonctif_present_3: 'ait',
    subjonctif_present_4: 'ayons',
    subjonctif_present_5: 'ayez',
    subjonctif_present_6: 'aient',
    conditionnel_present_1: 'aurais',
    conditionnel_present_2: 'aurais',
    conditionnel_present_3: 'aurait',
    conditionnel_present_4: 'aurions',
    conditionnel_present_5: 'auriez',
    conditionnel_present_6: 'auraient'
} as any;

// Test function
export const runConjugationTests = () => {
    console.log('🧪 Running conjugation mapping tests...\n');
    
    // Test individual conjugations
    console.log('Testing individual conjugations:');
    console.log(`present, person 1: ${getConjugation(mockAvoirConjugations, 'present', 1)} (expected: ai)`);
    console.log(`imparfait, person 3: ${getConjugation(mockAvoirConjugations, 'imparfait', 3)} (expected: avait)`);
    console.log(`subjonctif_present, person 2: ${getConjugation(mockAvoirConjugations, 'subjonctif_present', 2)} (expected: aies)`);
    
    // Test available tenses detection
    console.log('\nAvailable tenses detected:');
    const availableTenses = getAvailableTenses(mockAvoirConjugations);
    console.log(availableTenses);
    
    console.log('\nExpected tenses:');
    console.log([...AVAILABLE_TENSES]);
    
    // Test comprehensive mapping
    testConjugationMapping(mockAvoirConjugations, 'avoir (mock)');
};

// Export for use in console
(window as any).runConjugationTests = runConjugationTests;