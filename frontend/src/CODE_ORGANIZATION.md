# Frontend Code Organization

## Overview

This document describes the reorganized structure of the French verb conjugation system frontend code, with interfaces, constants, and utilities properly separated for better maintainability.

## File Structure

### `/src/types/`

- **`verb.types.ts`** - All TypeScript interfaces and type definitions
  - `VerbConjugation` - Complete interface for all French tenses (17 tenses × 6 persons)
  - `TenseInfo` - Tense metadata interface
  - `Verb` - Verb entity interface
  - `Exercise` - Exercise entity interface
  - `VerbState` - Redux state interface

### `/src/constants/`

- **`tenses.constants.ts`** - All constants and configuration
  - `TENSE_MAP` - Complete mapping of tense keys to display names and categories
  - `FRENCH_PRONOUNS` - Subject pronouns array
  - `AVAILABLE_TENSES` - All available tenses from database
  - `CACHE_DURATION` - Cache configuration

### `/src/utils/`

- **`tenseUtils.ts`** - Utility functions for verb operations
  - `getConjugation()` - Get specific conjugation by tense and person
  - `getTenseConjugations()` - Get all 6 persons for a tense
  - `getAvailableTenses()` - Extract available tenses from conjugation data
  - `getTenseDisplayName()` - Get user-friendly tense names
  - `getTensesByCategory()` - Group tenses by grammatical category
  - `formatConjugationTable()` - Format conjugations for display
  - `getConjugationWithPronoun()` - Get conjugation with subject pronoun
  - `validateConjugations()` - Validate completeness of conjugation data
  - `isCompoundTense()` - Check if tense needs auxiliary verb
  - `getTenseCategory()` - Get grammatical category of tense
  - `getRandomTenseFromCategory()` - Get random tense from category
  - `getAllConjugations()` - Get all conjugations as flat object

### `/src/store/slices/`

- **`verbSlice.ts`** - Redux slice (now focused only on state management)
  - Async thunks for API calls
  - Redux state management
  - Cache handling

### `/src/components/`

- **`ConjugationTable.tsx`** - React components for verb display
  - `ConjugationTable` - Display verb conjugations in table format
  - `TenseSelector` - UI for selecting tenses by category

## Usage Examples

```typescript
// Import types
import { VerbConjugation, Verb } from "../types";

// Import constants
import { TENSE_MAP, FRENCH_PRONOUNS } from "../constants";

// Import utilities
import {
  getConjugation,
  getTenseDisplayName,
  formatConjugationTable,
} from "../utils";

// Example usage
const conjugation = getConjugation(verb.conjugations, "present", 1); // "ai" for avoir
const displayName = getTenseDisplayName("passe_compose"); // "Passé Composé"
const table = formatConjugationTable(verb.conjugations, "present");
```

## Benefits

1. **Separation of Concerns** - Types, constants, and utilities are logically separated
2. **Reusability** - Utilities can be easily imported and used across components
3. **Maintainability** - Changes to interfaces or constants are centralized
4. **Type Safety** - Complete TypeScript coverage for all 17 French tenses
5. **Clean Imports** - Index files provide clean import paths

## Supported French Tenses

### Indicative (8 tenses)

- Présent, Imparfait, Passé Simple, Futur Simple
- Passé Composé, Plus-que-parfait, Passé Antérieur, Futur Antérieur

### Subjunctive (4 tenses)

- Subjonctif Présent, Subjonctif Imparfait
- Subjonctif Passé, Subjonctif Plus-que-parfait

### Conditional (3 tenses)

- Conditionnel Présent, Conditionnel Passé, Conditionnel Passé II

### Imperative (2 tenses)

- Impératif, Impératif Passé

**Total: 17 tenses × 6 persons = 102 conjugation forms per verb**
