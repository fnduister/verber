#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add missing verbs to the database
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
with open('conjugation.json', 'r', encoding='utf-8') as f:
    all_verbs = json.load(f)

# Find the missing verbs
found_verbs = []
for verb_data in all_verbs:
    infinitive = verb_data.get('Infinitif', '').lower()
    if infinitive in missing_verbs:
        found_verbs.append(verb_data)

print(f"Found {len(found_verbs)}/{len(missing_verbs)} verbs in conjugation.json")

# Generate SQL INSERT statements
sql_lines = [
    "-- Add missing verbs to the database",
    "-- Generated: 2025-10-31",
    f"-- Total verbs to add: {len(found_verbs)}",
    "",
    "INSERT INTO verbs (infinitive, conjugations) VALUES"
]

for i, verb_data in enumerate(found_verbs):
    infinitive = verb_data.get('Infinitif', '').lower()
    
    # Convert to our database format
    conjugations = json.dumps(verb_data, ensure_ascii=False)
    conjugations_escaped = conjugations.replace("'", "''")
    
    comma = "," if i < len(found_verbs) - 1 else ";"
    sql_lines.append(f"('{infinitive}', '{conjugations_escaped}'::jsonb){comma}")

sql_lines.append("")
sql_lines.append(f"-- Total verbs added: {len(found_verbs)}")

# Write to file
output_file = 'add_missing_verbs.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"Generated SQL file: {output_file}")
print(f"Verbs to add: {', '.join([v.get('Infinitif', '').lower() for v in found_verbs])}")

# List any verbs not found
not_found = [v for v in missing_verbs if v not in [verb_data.get('Infinitif', '').lower() for verb_data in found_verbs]]
if not_found:
    print(f"\nWARNING: {len(not_found)} verbs not found in conjugation.json:")
    print(f"  {', '.join(not_found)}")
