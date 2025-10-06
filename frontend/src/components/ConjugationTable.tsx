import React from 'react';
import { TENSE_MAP } from '../constants';
import { VerbConjugation } from '../types';
import { formatConjugationTable, getConjugationWithPronoun, getTenseDisplayName } from '../utils';

interface ConjugationTableProps {
    conjugations: VerbConjugation;
    selectedTense: string;
    infinitive: string;
}

const ConjugationTable: React.FC<ConjugationTableProps> = ({ conjugations, selectedTense, infinitive }) => {
    const conjugationRows = formatConjugationTable(conjugations, selectedTense);
    const tenseInfo = TENSE_MAP[selectedTense];
    
    return (
        <div className="conjugation-table">
            <h3>
                {infinitive} - {getTenseDisplayName(selectedTense)}
                {tenseInfo && (
                    <span className={`tense-category ${tenseInfo.category}`}>
                        ({tenseInfo.category})
                    </span>
                )}
            </h3>
            <table>
                <thead>
                    <tr>
                        <th>Person</th>
                        <th>Conjugation</th>
                        <th>Full Form</th>
                    </tr>
                </thead>
                <tbody>
                    {conjugationRows.map((row, index) => (
                        <tr key={index}>
                            <td>{row.person}</td>
                            <td>{row.form}</td>
                            <td>{getConjugationWithPronoun(conjugations, selectedTense, index + 1)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Example usage component showing different tense categories
interface TenseSelectorProps {
    onTenseSelect: (tense: string) => void;
    selectedTense: string;
}

const TenseSelector: React.FC<TenseSelectorProps> = ({ onTenseSelect, selectedTense }) => {
    const tensesByCategory = {
        'Indicatif': ['present', 'imparfait', 'passe_simple', 'futur_simple', 'passe_compose', 'plus_que_parfait', 'passe_anterieur', 'futur_anterieur'],
        'Subjonctif': ['subjonctif_present', 'subjonctif_imparfait', 'subjonctif_passe', 'subjonctif_plus_que_parfait'],
        'Conditionnel': ['conditionnel_present', 'conditionnel_passe', 'conditionnel_passe_ii'],
        'Impératif': ['imperatif', 'imperatif_passe']
    };

    return (
        <div className="tense-selector">
            {Object.entries(tensesByCategory).map(([category, tenses]) => (
                <div key={category} className="tense-category">
                    <h4>{category}</h4>
                    <div className="tense-buttons">
                        {tenses.map(tense => (
                            <button
                                key={tense}
                                className={`tense-button ${selectedTense === tense ? 'active' : ''}`}
                                onClick={() => onTenseSelect(tense)}
                            >
                                {getTenseDisplayName(tense)}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export { ConjugationTable, TenseSelector };
