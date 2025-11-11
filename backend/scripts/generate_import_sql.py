#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Import missing verbs into the database using SQL file
"""

import json

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

# Generate SQL statements
sql_statements = []
sql_statements.append("-- Import missing verbs")
sql_statements.append("-- Generated automatically\n")

for verb_data in found_verbs:
    infinitive = verb_data.get('Infinitif', '').lower()
    
    # Extract verb metadata
    past_participle = verb_data.get('ParticipePasse', '').replace("'", "''")
    present_participle = verb_data.get('ParticipePresent', '').replace("'", "''")
    auxiliary = verb_data.get('Auxiliaire', 'avoir').replace("'", "''")
    pronominal_form = verb_data.get('FormePronominale', '').replace("'", "''")
    
    # Start transaction for each verb
    sql_statements.append(f"-- Adding verb: {infinitive}")
    sql_statements.append("DO $$")
    sql_statements.append("DECLARE")
    sql_statements.append("    v_id BIGINT;")
    sql_statements.append("BEGIN")
    sql_statements.append(f"    -- Check if verb exists")
    sql_statements.append(f"    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = '{infinitive}') THEN")
    sql_statements.append(f"        -- Insert verb")
    sql_statements.append(f"        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)")
    sql_statements.append(f"        VALUES ('{infinitive}', '{past_participle}', '{present_participle}', '{auxiliary}', '{pronominal_form}', 1)")
    sql_statements.append(f"        RETURNING id INTO v_id;")
    sql_statements.append(f"")
    
    # Extract conjugations
    conjugations = {}
    
    # Map from JSON keys to database columns
    tense_mappings = [
        ('Present', 'present'),
        ('Imparfait', 'imparfait'),
        ('PasseSimple', 'passe_simple'),
        ('FuturSimple', 'futur_simple'),
        ('PasseCompose', 'passe_compose'),
        ('PlusQueParfait', 'plus_que_parfait'),
        ('PasseAnterieur', 'passe_anterieur'),
        ('FuturAnterieur', 'futur_anterieur'),
        ('SubjonctifPresent', 'subjonctif_present'),
        ('SubjonctifImparfait', 'subjonctif_imparfait'),
        ('SubjonctifPasse', 'subjonctif_passe'),
        ('SubjonctifPlusQueParfait', 'subjonctif_plus_que_parfait'),
        ('ConditionnelPresent', 'conditionnel_present'),
        ('ConditionnelPasse', 'conditionnel_passe'),
        ('ConditionnelPasseII', 'conditionnel_passe_ii'),
        ('Imperatif', 'imperatif'),
        ('ImperatifPasse', 'imperatif_passe'),
    ]
    
    for json_key, db_prefix in tense_mappings:
        if json_key in verb_data and len(verb_data[json_key]) == 6:
            for i, form in enumerate(verb_data[json_key], 1):
                conjugations[f'{db_prefix}_{i}'] = form.replace("'", "''")
    
    # Build INSERT statement for conjugations
    if conjugations:
        columns = ['verb_id'] + list(conjugations.keys())
        values = ['v_id'] + [f"'{v}'" for v in conjugations.values()]
        
        columns_str = ', '.join(columns)
        values_str = ', '.join(values)
        
        sql_statements.append(f"        -- Insert conjugations")
        sql_statements.append(f"        INSERT INTO verb_conjugations ({columns_str})")
        sql_statements.append(f"        VALUES ({values_str});")
    
    sql_statements.append(f"")
    sql_statements.append(f"        RAISE NOTICE 'Added verb: {infinitive} (ID: %)', v_id;")
    sql_statements.append(f"    ELSE")
    sql_statements.append(f"        RAISE NOTICE 'Skipped verb: {infinitive} (already exists)';")
    sql_statements.append(f"    END IF;")
    sql_statements.append("END $$;")
    sql_statements.append("")

# Write to file
output_file = '/home/fndui/projects/verber/backend/scripts/import_missing_verbs.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print(f"Generated SQL file: {output_file}")
print(f"Total verbs to import: {len(found_verbs)}")
print(f"\nTo import, run:")
print(f"docker exec -i verber-postgres-prod psql -U verber_user -d verber_db < {output_file}")
