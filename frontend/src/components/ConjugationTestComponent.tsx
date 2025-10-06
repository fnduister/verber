import React, { useEffect, useState } from 'react';
import { findVerbByInfinitive, getConjugation, getTenseConjugations, testConjugationMapping } from '../utils/tenseUtils';

interface TestResults {
  verb: string;
  tests: Array<{
    tense: string;
    person: number;
    expected: string;
    actual: string;
    success: boolean;
  }>;
}

export const ConjugationTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    try {
      // Fetch avoir verb from API
      const response = await fetch('http://localhost:8080/api/verbs');
      const verbs = await response.json();
      const avoir = findVerbByInfinitive(verbs, 'avoir');
      
      if (!avoir) {
        console.error('Could not find avoir verb');
        return;
      }

      console.log('Raw conjugations data:', avoir.conjugations);
      
      // Test specific conjugations
      const tests = [
        { tense: 'present', person: 1, expected: 'ai' },
        { tense: 'present', person: 2, expected: 'as' },
        { tense: 'imparfait', person: 3, expected: 'avait' },
        { tense: 'subjonctif_present', person: 2, expected: 'aies' },
        { tense: 'conditionnel_present', person: 1, expected: 'aurais' },
        { tense: 'futur_simple', person: 1, expected: 'aurai' },
        { tense: 'passe_simple', person: 3, expected: 'eut' }
      ];

      const results = tests.map(test => {
        const actual = getConjugation(avoir.conjugations, test.tense, test.person);
        return {
          ...test,
          actual: actual || 'NOT_FOUND',
          success: actual === test.expected
        };
      });

      setTestResults({
        verb: 'avoir',
        tests: results
      });

      // Also run the comprehensive test
      console.log('Running comprehensive test:');
      testConjugationMapping(avoir.conjugations, 'avoir');

      // Test getTenseConjugations
      console.log('Testing getTenseConjugations for present tense:');
      const presentConjugations = getTenseConjugations(avoir.conjugations, 'present');
      console.log('Present conjugations:', presentConjugations);

    } catch (error) {
      console.error('Test failed:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  if (loading) return <div>Running conjugation tests...</div>;

  if (!testResults) return <div>No test results available</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Conjugation Function Test Results</h2>
      <p><strong>Verb:</strong> {testResults.verb}</p>
      
      <table border={1} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Tense</th>
            <th>Person</th>
            <th>Expected</th>
            <th>Actual</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {testResults.tests.map((test, index) => (
            <tr key={index} style={{ backgroundColor: test.success ? '#e8f5e8' : '#ffe8e8' }}>
              <td>{test.tense}</td>
              <td>{test.person}</td>
              <td>{test.expected}</td>
              <td>{test.actual}</td>
              <td>{test.success ? '✅ PASS' : '❌ FAIL'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <h3>Summary</h3>
        <p>
          Passed: {testResults.tests.filter(t => t.success).length} / {testResults.tests.length}
        </p>
        {testResults.tests.every(t => t.success) ? (
          <p style={{ color: 'green', fontWeight: 'bold' }}>🎉 All tests passed!</p>
        ) : (
          <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Some tests failed - check console for details</p>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={runTests}>Re-run Tests</button>
      </div>
    </div>
  );
};

export default ConjugationTestComponent;