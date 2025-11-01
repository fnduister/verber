#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate SQL to import all verbs with their conjugations into the existing database schema
"""

import json

# Load all verbs from updated conjugation.json
with open('conjugation.json', 'r', encoding='utf-8') as f:
    all_verbs = json.load(f)

print(f"Generating SQL for {len(all_verbs)} verbs...")

# Mapping from JSON keys to database column names
tense_mapping = {
    'Present': 'present',
    'Imparfait': 'imparfait',
    'PasseSimple': 'passe_simple',
    'FuturSimple': 'futur_simple',
    'PasseCompose': 'passe_compose',
    'PlusQueParfait': 'plus_que_parfait',
    'PasseAnterieur': 'passe_anterieur',
    'FuturAnterieur': 'futur_anterieur',
    'SubjonctifPresent': 'subjonctif_present',
    'SubjonctifImparfait': 'subjonctif_imparfait',
    'SubjonctifPasse': 'subjonctif_passe',
    'SubjonctifPlusQueParfait': 'subjonctif_plus_que_parfait',
    'ConditionnelPresent': 'conditionnel_present',
    'ConditionnelPasse': 'conditionnel_passe',
    'ConditionnelPasseDeuxiemeForme': 'conditionnel_passe_ii',
    'Imperatif': 'imperatif',
    'ImperatifPasse': 'imperatif_passe'
}

# Generate SQL
sql_lines = [
    "-- Import all verbs with conjugations",
    "-- Generated: 2025-10-31",
    f"-- Total verbs: {len(all_verbs)}",
    "",
    "-- Clear existing data",
    "TRUNCATE TABLE verb_conjugations RESTART IDENTITY CASCADE;",
    "TRUNCATE TABLE verbs RESTART IDENTITY CASCADE;",
    ""
]

# Insert verbs and their conjugations using DO block
sql_lines.append("DO $$")
sql_lines.append("DECLARE")
sql_lines.append("  verb_id INT;")
sql_lines.append("BEGIN")

for verb_data in all_verbs:
    infinitive = verb_data.get('Infinitif', '').lower().replace("'", "''")
    past_participle = verb_data.get('ParticipePasse', '').replace("'", "''")
    present_participle = verb_data.get('ParticipePresent', '').replace("'", "''")
    auxiliary = verb_data.get('Auxiliaire', '').replace("'", "''")
    pronominal = verb_data.get('FormePronominale', '').replace("'", "''")
    
    # Insert verb and get ID
    sql_lines.append(
        f"  INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronominal_form) "
        f"VALUES ('{infinitive}', '{past_participle}', '{present_participle}', '{auxiliary}', '{pronominal}') "
        f"RETURNING id INTO verb_id;"
    )
    
    # Build conjugation insert
    columns = []
    values = []
    
    for json_key, db_prefix in tense_mapping.items():
        if json_key in verb_data and isinstance(verb_data[json_key], list):
            forms = verb_data[json_key]
            for i in range(min(6, len(forms))):  # 6 persons max
                col_name = f"{db_prefix}{i+1}"
                value = forms[i].replace("'", "''") if forms[i] else ''
                columns.append(col_name)
                values.append(f"'{value}'")
    
    if columns:
        sql_lines.append(
            f"  INSERT INTO verb_conjugations (verb_id, {', '.join(columns)}) "
            f"VALUES (verb_id, {', '.join(values)});"
        )
    
    sql_lines.append("")

sql_lines.append("END $$;")
sql_lines.append("")

sql_lines.append(f"-- Total verbs inserted: {len(all_verbs)}")

# Write to file
output_file = 'import_all_verbs_proper.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

content_size = len('\n'.join(sql_lines)) / 1024
print(f"✓ Generated SQL file: {output_file}")
print(f"  Total verbs: {len(all_verbs)}")
print(f"  File size: {content_size:.1f} KB")
