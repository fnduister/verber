#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate SQL to reimport all verbs into database
"""

import json

# Load all verbs from updated conjugation.json
with open('conjugation.json', 'r', encoding='utf-8') as f:
    all_verbs = json.load(f)

print(f"Generating SQL for {len(all_verbs)} verbs...")

# Generate SQL
sql_lines = [
    "-- Reimport all verbs into database",
    "-- Generated: 2025-10-31",
    f"-- Total verbs: {len(all_verbs)}",
    "",
    "-- Clear existing verbs",
    "TRUNCATE TABLE verbs RESTART IDENTITY CASCADE;",
    "",
    "-- Insert all verbs",
    "INSERT INTO verbs (infinitive, conjugations) VALUES"
]

verb_values = []
for verb_data in all_verbs:
    infinitive = verb_data.get('Infinitif', '').lower()
    # Escape single quotes in infinitive
    infinitive_escaped = infinitive.replace("'", "''")
    conjugations = json.dumps(verb_data, ensure_ascii=False)
    conjugations_escaped = conjugations.replace("'", "''")
    
    verb_values.append(f"('{infinitive_escaped}', '{conjugations_escaped}'::jsonb)")

sql_lines.append(',\n'.join(verb_values) + ';')
sql_lines.append("")
sql_lines.append(f"-- Total verbs inserted: {len(all_verbs)}")

# Write to file
output_file = 'reimport_all_verbs.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"✓ Generated SQL file: {output_file}")
print(f"  Total verbs: {len(all_verbs)}")
