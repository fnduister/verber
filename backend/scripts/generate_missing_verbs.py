#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate conjugations for missing verbs based on similar regular verbs
"""

import copy
import json

# Load existing conjugation data
with open('conjugation.json', 'r', encoding='utf-8') as f:
    all_verbs = json.load(f)

# Find templates for regular verbs
def find_template(verb_ending):
    """Find a template verb with the same ending"""
    templates = {
        'er': 'aimer',      # -er verbs
        'ir': 'finir',      # -ir verbs (type finir)
        'oir': 'recevoir',  # -oir verbs
        're': 'vendre',     # -re verbs
    }
    
    for ending, template_infinitive in templates.items():
        if verb_ending.endswith(ending):
            # Find the template verb
            for verb_data in all_verbs:
                if verb_data.get('Infinitif', '').lower() == template_infinitive:
                    return verb_data, ending
    return None, None

def conjugate_regular_verb(infinitive, template_data, ending):
    """Create conjugation for a regular verb based on template"""
    # Deep copy the template
    new_verb = copy.deepcopy(template_data)
    
    # Get the stem (remove the ending)
    stem = infinitive[:-len(ending)]
    template_infinitive = template_data['Infinitif'].lower()
    template_stem = template_infinitive[:-len(ending)]
    
    # Replace infinitive
    new_verb['Infinitif'] = infinitive
    new_verb['FormePronominale'] = f"se {infinitive}"
    
    # Function to replace stem in conjugated forms
    def replace_stem(form):
        if isinstance(form, str):
            return form.replace(template_stem, stem)
        elif isinstance(form, list):
            return [replace_stem(f) for f in form]
        return form
    
    # Replace stems in all conjugations
    for key in new_verb:
        if key not in ['Infinitif', 'FormePronominale', 'Auxiliaire']:
            new_verb[key] = replace_stem(new_verb[key])
    
    # Fix participle
    if ending == 'er':
        new_verb['ParticipePasse'] = stem + 'é'
        new_verb['ParticipePresent'] = stem + 'ant'
    elif ending == 'ir':
        new_verb['ParticipePasse'] = stem + 'i'
        new_verb['ParticipePresent'] = stem + 'issant'
    
    return new_verb

# Missing verbs to add (excluding those already found)
missing_verbs = {
    # -er verbs (regular)
    'assembler': 'er',
    'calculer': 'er',
    'cuisiner': 'er',
    'cultiver': 'er',
    'décoller': 'er',
    'déguster': 'er',
    'développer': 'er',
    'interpréter': 'er',
    'mémoriser': 'er',
    'négliger': 'er',
    'ordonner': 'er',
    'participer': 'er',
    'publier': 'er',
    'ranger': 'er',
    'régner': 'er',
    'réviser': 'er',
    'soigner': 'er',
    'visiter': 'er',
    
    # -ir verbs (type finir)
    'fleurir': 'ir',
    'mûrir': 'ir',
    'vieillir': 'ir',
    
    # Special verbs (need to be based on similar irregular verbs)
    'combattre': 're',  # like battre
    'instruire': 're',   # like construire (already exists)
    'introduire': 're',  # like conduire (already exists)
    'reproduire': 're',  # like conduire (already exists)
    'séduire': 're',     # like conduire (already exists)
}

# Generate new verbs
new_verbs = []

for infinitive, ending in missing_verbs.items():
    template_data, template_ending = find_template(ending)
    
    if template_data:
        new_verb = conjugate_regular_verb(infinitive, template_data, template_ending)
        new_verbs.append(new_verb)
        print(f"✓ Generated: {infinitive}")
    else:
        print(f"✗ No template found for: {infinitive}")

print(f"\nGenerated {len(new_verbs)} new verbs")

# Add special irregular verbs manually
irregular_verbs = []

# être (most irregular verb in French)
etre_conjugation = {
    "Infinitif": "être",
    "ParticipePasse": "été",
    "ParticipePresent": "étant",
    "Auxiliaire": "avoir",
    "FormePronominale": "",
    "Present": ["suis", "es", "est", "sommes", "êtes", "sont"],
    "Imparfait": ["étais", "étais", "était", "étions", "étiez", "étaient"],
    "PasseSimple": ["fus", "fus", "fut", "fûmes", "fûtes", "furent"],
    "FuturSimple": ["serai", "seras", "sera", "serons", "serez", "seront"],
    "PasseCompose": ["ai été", "as été", "a été", "avons été", "avez été", "ont été"],
    "PlusQueParfait": ["avais été", "avais été", "avait été", "avions été", "aviez été", "avaient été"],
    "PasseAnterieur": ["eus été", "eus été", "eut été", "eûmes été", "eûtes été", "eurent été"],
    "FuturAnterieur": ["aurai été", "auras été", "aura été", "aurons été", "aurez été", "auront été"],
    "SubjonctifPresent": ["sois", "sois", "soit", "soyons", "soyez", "soient"],
    "SubjonctifImparfait": ["fusse", "fusses", "fût", "fussions", "fussiez", "fussent"],
    "SubjonctifPasse": ["aie été", "aies été", "ait été", "ayons été", "ayez été", "aient été"],
    "SubjonctifPlusQueParfait": ["eusse été", "eusses été", "eût été", "eussions été", "eussiez été", "eussent été"],
    "ConditionnelPresent": ["serais", "serais", "serait", "serions", "seriez", "seraient"],
    "ConditionnelPasse": ["aurais été", "aurais été", "aurait été", "aurions été", "auriez été", "auraient été"],
    "ConditionnelPasseDeuxiemeForme": ["eusse été", "eusses été", "eût été", "eussions été", "eussiez été", "eussent été"],
    "Imperatif": ["sois", "soyons", "soyez"],
    "ImperatifPasse": ["aie été", "ayons été", "ayez été"]
}
irregular_verbs.append(etre_conjugation)

# neiger (impersonal verb - only 3rd person)
neiger_conjugation = {
    "Infinitif": "neiger",
    "ParticipePasse": "neigé",
    "ParticipePresent": "neigeant",
    "Auxiliaire": "avoir",
    "FormePronominale": "",
    "Present": ["", "", "neige", "", "", ""],
    "Imparfait": ["", "", "neigeait", "", "", ""],
    "PasseSimple": ["", "", "neigea", "", "", ""],
    "FuturSimple": ["", "", "neigera", "", "", ""],
    "PasseCompose": ["", "", "a neigé", "", "", ""],
    "PlusQueParfait": ["", "", "avait neigé", "", "", ""],
    "PasseAnterieur": ["", "", "eut neigé", "", "", ""],
    "FuturAnterieur": ["", "", "aura neigé", "", "", ""],
    "SubjonctifPresent": ["", "", "neige", "", "", ""],
    "SubjonctifImparfait": ["", "", "neigeât", "", "", ""],
    "SubjonctifPasse": ["", "", "ait neigé", "", "", ""],
    "SubjonctifPlusQueParfait": ["", "", "eût neigé", "", "", ""],
    "ConditionnelPresent": ["", "", "neigerait", "", "", ""],
    "ConditionnelPasse": ["", "", "aurait neigé", "", "", ""],
    "ConditionnelPasseDeuxiemeForme": ["", "", "eût neigé", "", "", ""],
    "Imperatif": ["", "", ""],
    "ImperatifPasse": ["", "", ""]
}
irregular_verbs.append(neiger_conjugation)

print(f"Added {len(irregular_verbs)} irregular verbs manually")

# Combine all new verbs
all_new_verbs = new_verbs + irregular_verbs

# Add to existing verbs
updated_verbs = all_verbs + all_new_verbs

# Save to new file
output_file = 'conjugation_updated.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(updated_verbs, f, ensure_ascii=False, indent=2)

print(f"\n✓ Saved updated conjugations to: {output_file}")
print(f"Total verbs: {len(all_verbs)} → {len(updated_verbs)} (+{len(all_new_verbs)})")
print(f"\nNew verbs added:")
for verb in all_new_verbs:
    print(f"  - {verb['Infinitif']}")
