// Types and interfaces for French verb conjugations

export interface VerbConjugation {
    id?: number;
    verb_id?: number;
    verb?: string;
    // Present tense
    present_1: string; // je
    present_2: string; // tu
    present_3: string; // il/elle
    present_4: string; // nous
    present_5: string; // vous
    present_6: string; // ils/elles
    // Imparfait
    imparfait_1: string;
    imparfait_2: string;
    imparfait_3: string;
    imparfait_4: string;
    imparfait_5: string;
    imparfait_6: string;
    // Passé Simple
    passe_simple_1: string;
    passe_simple_2: string;
    passe_simple_3: string;
    passe_simple_4: string;
    passe_simple_5: string;
    passe_simple_6: string;
    // Futur Simple
    futur_simple_1: string;
    futur_simple_2: string;
    futur_simple_3: string;
    futur_simple_4: string;
    futur_simple_5: string;
    futur_simple_6: string;
    // Passé Composé
    passe_compose_1: string;
    passe_compose_2: string;
    passe_compose_3: string;
    passe_compose_4: string;
    passe_compose_5: string;
    passe_compose_6: string;
    // Plus-que-parfait
    plus_que_parfait_1: string;
    plus_que_parfait_2: string;
    plus_que_parfait_3: string;
    plus_que_parfait_4: string;
    plus_que_parfait_5: string;
    plus_que_parfait_6: string;
    // Passé Antérieur
    passe_anterieur_1: string;
    passe_anterieur_2: string;
    passe_anterieur_3: string;
    passe_anterieur_4: string;
    passe_anterieur_5: string;
    passe_anterieur_6: string;
    // Futur Antérieur
    futur_anterieur_1: string;
    futur_anterieur_2: string;
    futur_anterieur_3: string;
    futur_anterieur_4: string;
    futur_anterieur_5: string;
    futur_anterieur_6: string;
    // Subjonctif Présent
    subjonctif_present_1: string;
    subjonctif_present_2: string;
    subjonctif_present_3: string;
    subjonctif_present_4: string;
    subjonctif_present_5: string;
    subjonctif_present_6: string;
    // Subjonctif Imparfait
    subjonctif_imparfait_1: string;
    subjonctif_imparfait_2: string;
    subjonctif_imparfait_3: string;
    subjonctif_imparfait_4: string;
    subjonctif_imparfait_5: string;
    subjonctif_imparfait_6: string;
    // Subjonctif Passé
    subjonctif_passe_1: string;
    subjonctif_passe_2: string;
    subjonctif_passe_3: string;
    subjonctif_passe_4: string;
    subjonctif_passe_5: string;
    subjonctif_passe_6: string;
    // Subjonctif Plus-que-parfait
    subjonctif_plus_que_parfait_1: string;
    subjonctif_plus_que_parfait_2: string;
    subjonctif_plus_que_parfait_3: string;
    subjonctif_plus_que_parfait_4: string;
    subjonctif_plus_que_parfait_5: string;
    subjonctif_plus_que_parfait_6: string;
    // Conditionnel Présent
    conditionnel_present_1: string;
    conditionnel_present_2: string;
    conditionnel_present_3: string;
    conditionnel_present_4: string;
    conditionnel_present_5: string;
    conditionnel_present_6: string;
    // Conditionnel Passé
    conditionnel_passe_1: string;
    conditionnel_passe_2: string;
    conditionnel_passe_3: string;
    conditionnel_passe_4: string;
    conditionnel_passe_5: string;
    conditionnel_passe_6: string;
    // Conditionnel Passé II
    conditionnel_passe_ii_1: string;
    conditionnel_passe_ii_2: string;
    conditionnel_passe_ii_3: string;
    conditionnel_passe_ii_4: string;
    conditionnel_passe_ii_5: string;
    conditionnel_passe_ii_6: string;
    // Impératif
    imperatif_1: string;
    imperatif_2: string;
    imperatif_3: string;
    imperatif_4: string;
    imperatif_5: string;
    imperatif_6: string;
    // Impératif Passé
    imperatif_passe_1: string;
    imperatif_passe_2: string;
    imperatif_passe_3: string;
    imperatif_passe_4: string;
    imperatif_passe_5: string;
    imperatif_passe_6: string;
}

export interface TenseInfo {
    key: string;
    displayName: string;
    category: 'indicative' | 'subjunctive' | 'conditional' | 'imperative';
    compound: boolean;
}

export interface Verb {
    id: number;
    infinitive: string;
    past_simple: string;
    past_participle: string;
    present_participle?: string;
    auxiliary?: string;
    pronominal_form?: string;
    translation: string;
    category: string;
    difficulty: number;
    image_url?: string;
    audio_url?: string;
    conjugations?: VerbConjugation;
}

export interface Tense {
    name: string;
    displayName: string;
    category: 'simple' | 'compound' | 'subjunctive' | 'imperative';
}

export interface Exercise {
    id: number;
    type: string;
    question: string;
    answer: string;
    options?: string;
    verb_id: number;
    verb: Verb;
    difficulty: number;
    points: number;
}

// Interface for Redux state
export interface VerbState {
    verbs: Verb[];
    tenses: string[];
    exercises: Exercise[];
    currentExercise: Exercise | null;
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
}

// Race game specific types
export interface RaceGameInfo {
    currentStep: number;
    maxStep: number;
    score: number;
    maxTime: number;
    duration: number;
}

export interface UpdateHeader {
    update: boolean;
    target: string;
}

// Game step info for Race game
export interface RaceStepInfo {
    pronoun: string;
    word: string;
    visibleTenses: string[];
    stepTense: string;
}