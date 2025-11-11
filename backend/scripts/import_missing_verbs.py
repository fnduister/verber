#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Import missing verbs into the database
"""

import json
import psycopg2
from psycopg2.extras import execute_values

# Database connection parameters
DB_PARAMS = {
    'host': 'localhost',
    'port': '5433',  # Production postgres port
    'database': 'verber_db',
    'user': 'verber_user',
    'password': 'verber_password'
}

# List of missing verbs
missing_verbs = [
    'assembler', 'calculer', 'combattre', 'conduire', 'connaître', 'construire',
    'consulter', 'contenir', 'continuer', 'cuisiner', 'cultiver', 'décoller',
    'déguster', 'développer', 'fleurir', 'instruire', 'interpréter', 'introduire',
    'mémoriser', 'mûrir', 'neiger', 'négliger', 'ordonner', 'participer',
    'publier', 'ranger', 'reproduire', 'régner', 'réviser', 'soigner',
    'séduire', 'vieillir', 'visiter', 'être'
]

# Load conjugation data
with open('/home/fndui/projects/verber/backend/scripts/conjugation.json', 'r', encoding='utf-8') as f:
    all_verbs = json.load(f)

# Find the missing verbs
found_verbs = []
for verb_data in all_verbs:
    infinitive = verb_data.get('Infinitif', '').lower()
    if infinitive in missing_verbs:
        found_verbs.append(verb_data)

print(f"Found {len(found_verbs)}/{len(missing_verbs)} verbs in conjugation.json")

# Connect to database
conn = psycopg2.connect(**DB_PARAMS)
cur = conn.cursor()

added_count = 0
skipped_count = 0

for verb_data in found_verbs:
    infinitive = verb_data.get('Infinitif', '').lower()
    
    # Check if verb already exists
    cur.execute("SELECT id FROM verbs WHERE infinitive = %s", (infinitive,))
    if cur.fetchone():
        print(f"Skipping {infinitive} - already exists")
        skipped_count += 1
        continue
    
    # Extract verb metadata
    past_participle = verb_data.get('ParticipePasse', '')
    present_participle = verb_data.get('ParticipePresent', '')
    auxiliary = verb_data.get('Auxiliaire', 'avoir')
    pronominal_form = verb_data.get('FormePronominale', '')
    
    # Insert verb
    cur.execute("""
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES (%s, %s, %s, %s, %s, 1)
        RETURNING id
    """, (infinitive, past_participle, present_participle, auxiliary, pronominal_form))
    
    verb_id = cur.fetchone()[0]
    
    # Extract conjugations
    conjugations = {}
    
    # Present
    if 'Present' in verb_data and len(verb_data['Present']) == 6:
        for i, form in enumerate(verb_data['Present'], 1):
            conjugations[f'present_{i}'] = form
    
    # Imparfait
    if 'Imparfait' in verb_data and len(verb_data['Imparfait']) == 6:
        for i, form in enumerate(verb_data['Imparfait'], 1):
            conjugations[f'imparfait_{i}'] = form
    
    # Passé Simple
    if 'PasseSimple' in verb_data and len(verb_data['PasseSimple']) == 6:
        for i, form in enumerate(verb_data['PasseSimple'], 1):
            conjugations[f'passe_simple_{i}'] = form
    
    # Futur Simple
    if 'FuturSimple' in verb_data and len(verb_data['FuturSimple']) == 6:
        for i, form in enumerate(verb_data['FuturSimple'], 1):
            conjugations[f'futur_simple_{i}'] = form
    
    # Passé Composé
    if 'PasseCompose' in verb_data and len(verb_data['PasseCompose']) == 6:
        for i, form in enumerate(verb_data['PasseCompose'], 1):
            conjugations[f'passe_compose_{i}'] = form
    
    # Plus-que-parfait
    if 'PlusQueParfait' in verb_data and len(verb_data['PlusQueParfait']) == 6:
        for i, form in enumerate(verb_data['PlusQueParfait'], 1):
            conjugations[f'plus_que_parfait_{i}'] = form
    
    # Passé Antérieur
    if 'PasseAnterieur' in verb_data and len(verb_data['PasseAnterieur']) == 6:
        for i, form in enumerate(verb_data['PasseAnterieur'], 1):
            conjugations[f'passe_anterieur_{i}'] = form
    
    # Futur Antérieur
    if 'FuturAnterieur' in verb_data and len(verb_data['FuturAnterieur']) == 6:
        for i, form in enumerate(verb_data['FuturAnterieur'], 1):
            conjugations[f'futur_anterieur_{i}'] = form
    
    # Subjonctif Présent
    if 'SubjonctifPresent' in verb_data and len(verb_data['SubjonctifPresent']) == 6:
        for i, form in enumerate(verb_data['SubjonctifPresent'], 1):
            conjugations[f'subjonctif_present_{i}'] = form
    
    # Subjonctif Imparfait
    if 'SubjonctifImparfait' in verb_data and len(verb_data['SubjonctifImparfait']) == 6:
        for i, form in enumerate(verb_data['SubjonctifImparfait'], 1):
            conjugations[f'subjonctif_imparfait_{i}'] = form
    
    # Subjonctif Passé
    if 'SubjonctifPasse' in verb_data and len(verb_data['SubjonctifPasse']) == 6:
        for i, form in enumerate(verb_data['SubjonctifPasse'], 1):
            conjugations[f'subjonctif_passe_{i}'] = form
    
    # Subjonctif Plus-que-parfait
    if 'SubjonctifPlusQueParfait' in verb_data and len(verb_data['SubjonctifPlusQueParfait']) == 6:
        for i, form in enumerate(verb_data['SubjonctifPlusQueParfait'], 1):
            conjugations[f'subjonctif_plus_que_parfait_{i}'] = form
    
    # Conditionnel Présent
    if 'ConditionnelPresent' in verb_data and len(verb_data['ConditionnelPresent']) == 6:
        for i, form in enumerate(verb_data['ConditionnelPresent'], 1):
            conjugations[f'conditionnel_present_{i}'] = form
    
    # Conditionnel Passé
    if 'ConditionnelPasse' in verb_data and len(verb_data['ConditionnelPasse']) == 6:
        for i, form in enumerate(verb_data['ConditionnelPasse'], 1):
            conjugations[f'conditionnel_passe_{i}'] = form
    
    # Conditionnel Passé II
    if 'ConditionnelPasseII' in verb_data and len(verb_data['ConditionnelPasseII']) == 6:
        for i, form in enumerate(verb_data['ConditionnelPasseII'], 1):
            conjugations[f'conditionnel_passe_ii_{i}'] = form
    
    # Impératif
    if 'Imperatif' in verb_data and len(verb_data['Imperatif']) == 6:
        for i, form in enumerate(verb_data['Imperatif'], 1):
            conjugations[f'imperatif_{i}'] = form
    
    # Impératif Passé
    if 'ImperatifPasse' in verb_data and len(verb_data['ImperatifPasse']) == 6:
        for i, form in enumerate(verb_data['ImperatifPasse'], 1):
            conjugations[f'imperatif_passe_{i}'] = form
    
    # Build INSERT statement
    columns = ['verb_id'] + list(conjugations.keys())
    values = [verb_id] + list(conjugations.values())
    
    placeholders = ', '.join(['%s'] * len(values))
    columns_str = ', '.join(columns)
    
    cur.execute(f"""
        INSERT INTO verb_conjugations ({columns_str})
        VALUES ({placeholders})
    """, values)
    
    print(f"Added {infinitive} (ID: {verb_id}) with {len(conjugations)} conjugation forms")
    added_count += 1

conn.commit()
cur.close()
conn.close()

print(f"\n✅ Summary:")
print(f"   Added: {added_count} verbs")
print(f"   Skipped: {skipped_count} verbs (already existed)")
print(f"   Total verbs now: {962 + added_count}")
