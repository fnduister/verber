#!/usr/bin/env python3
"""
Convert verb JSONB data to SQL INSERT statements matching the actual database schema.
"""
import json
import sys

# Verb data from the original SQL file
verbs_data = {
    "conduire": {"Infinitif": "Conduire", "ParticipePasse": "Conduit", "ParticipePresent": "Conduisant", "Auxiliaire": "avoir", "FormePronominale": "se conduire", "Present": ["Conduis", "Conduis", "Conduit", "Conduisons", "Conduisez", "Conduisent"], "Imparfait": ["Conduisais", "Conduisais", "Conduisait", "Conduisions", "Conduisiez", "Conduisaient"], "PasseSimple": ["Conduisis", "Conduisis", "Conduisit", "Conduisîmes", "Conduisîtes", "Conduisirent"], "FuturSimple": ["Conduirai", "Conduiras", "Conduira", "Conduirons", "Conduirez", "Conduiront"], "PasseCompose": ["ai conduit", "as conduit", "a conduit", "avons conduit", "avez conduit", "ont conduit"], "PlusQueParfait": ["avais conduit", "avais conduit", "avait conduit", "avions conduit", "aviez conduit", "avaient conduit"], "PasseAnterieur": ["eus conduit", "eus conduit", "eut conduit", "eûmes conduit", "eûtes conduit", "eurent conduit"], "FuturAnterieur": ["aurai conduit", "auras conduit", "aura conduit", "aurons conduit", "aurez conduit", "auront conduit"], "SubjonctifPresent": ["Conduise", "Conduises", "Conduise", "Conduisions", "Conduisiez", "Conduisent"], "SubjonctifImparfait": ["Conduisisse", "Conduisisses", "Conduisît", "Conduisissions", "Conduisissiez", "Conduisissent"], "SubjonctifPasse": ["aie conduit", "aies conduit", "ait conduit", "ayons conduit", "ayez conduit", "aient conduit"], "SubjonctifPlusQueParfait": ["eusse conduit", "eusses conduit", "eût conduit", "eussions conduit", "eussiez conduit", "eussent conduit"], "ConditionnelPresent": ["Conduirais", "Conduirais", "Conduirait", "Conduirions", "Conduiriez", "Conduiraient"], "ConditionnelPasse": ["aurais conduit", "aurais conduit", "aurait conduit", "aurions conduit", "auriez conduit", "auraient conduit"], "ConditionnelPasseII": ["eusse conduit", "eusses conduit", "eût conduit", "eussions conduit", "eussiez conduit", "eussent conduit"], "Imperatif": ["", "Conduis !", "", "Conduisons !", "Conduisez !", ""], "ImperatifPasse": ["", "aie conduit !", "", "ayons conduit !", "ayez conduit !", ""]},
    "connaître": {"Infinitif": "Connaître", "ParticipePasse": "Connu", "ParticipePresent": "Connaissant", "Auxiliaire": "avoir", "FormePronominale": "se connaître", "Present": ["Connais", "Connais", "Connaît", "Connaissons", "Connaissez", "Connaissent"], "Imparfait": ["Connaissais", "Connaissais", "Connaissait", "Connaissions", "Connaissiez", "Connaissaient"], "PasseSimple": ["Connus", "Connus", "Connut", "Connûmes", "Connûtes", "Connurent"], "FuturSimple": ["Connaîtrai", "Connaîtras", "Connaîtra", "Connaîtrons", "Connaîtrez", "Connaîtront"], "PasseCompose": ["ai connu", "as connu", "a connu", "avons connu", "avez connu", "ont connu"], "PlusQueParfait": ["avais connu", "avais connu", "avait connu", "avions connu", "aviez connu", "avaient connu"], "PasseAnterieur": ["eus connu", "eus connu", "eut connu", "eûmes connu", "eûtes connu", "eurent connu"], "FuturAnterieur": ["aurai connu", "auras connu", "aura connu", "aurons connu", "aurez connu", "auront connu"], "SubjonctifPresent": ["Connaisse", "Connaisses", "Connaisse", "Connaissions", "Connaissiez", "Connaissent"], "SubjonctifImparfait": ["Connusse", "Connusses", "Connût", "Connussions", "Connussiez", "Connussent"], "SubjonctifPasse": ["aie connu", "aies connu", "ait connu", "ayons connu", "ayez connu", "aient connu"], "SubjonctifPlusQueParfait": ["eusse connu", "eusses connu", "eût connu", "eussions connu", "eussiez connu", "eussent connu"], "ConditionnelPresent": ["Connaîtrais", "Connaîtrais", "Connaîtrait", "Connaîtrions", "Connaîtriez", "Connaîtraient"], "ConditionnelPasse": ["aurais connu", "aurais connu", "aurait connu", "aurions connu", "auriez connu", "auraient connu"], "ConditionnelPasseII": ["eusse connu", "eusses connu", "eût connu", "eussions connu", "eussiez connu", "eussent connu"], "Imperatif": ["", "Connais !", "", "Connaissons !", "Connaissez !", ""], "ImperatifPasse": ["", "aie connu !", "", "ayons connu !", "ayez connu !", ""]},
    "construire": {"Infinitif": "Construire", "ParticipePasse": "Construit", "ParticipePresent": "Construisant", "Auxiliaire": "avoir", "FormePronominale": "se construire", "Present": ["Construis", "Construis", "Construit", "Construisons", "Construisez", "Construisent"], "Imparfait": ["Construisais", "Construisais", "Construisait", "Construisions", "Construisiez", "Construisaient"], "PasseSimple": ["Construisis", "Construisis", "Construisit", "Construisîmes", "Construisîtes", "Construisirent"], "FuturSimple": ["Construirai", "Construiras", "Construira", "Construirons", "Construirez", "Construiront"], "PasseCompose": ["ai construit", "as construit", "a construit", "avons construit", "avez construit", "ont construit"], "PlusQueParfait": ["avais construit", "avais construit", "avait construit", "avions construit", "aviez construit", "avaient construit"], "PasseAnterieur": ["eus construit", "eus construit", "eut construit", "eûmes construit", "eûtes construit", "eurent construit"], "FuturAnterieur": ["aurai construit", "auras construit", "aura construit", "aurons construit", "aurez construit", "auront construit"], "SubjonctifPresent": ["Construise", "Construises", "Construise", "Construisions", "Construisiez", "Construisent"], "SubjonctifImparfait": ["Construisisse", "Construisisses", "Construisît", "Construisissions", "Construisissiez", "Construisissent"], "SubjonctifPasse": ["aie construit", "aies construit", "ait construit", "ayons construit", "ayez construit", "aient construit"], "SubjonctifPlusQueParfait": ["eusse construit", "eusses construit", "eût construit", "eussions construit", "eussiez construit", "eussent construit"], "ConditionnelPresent": ["Construirais", "Construirais", "Construirait", "Construirions", "Construiriez", "Construiraient"], "ConditionnelPasse": ["aurais construit", "aurais construit", "aurait construit", "aurions construit", "auriez construit", "auraient construit"], "ConditionnelPasseII": ["eusse construit", "eusses construit", "eût construit", "eussions construit", "eussiez construit", "eussent construit"], "Imperatif": ["", "Construis !", "", "Construisons !", "Construisez !", ""], "ImperatifPasse": ["", "aie construit !", "", "ayons construit !", "ayez construit !", ""]},
    "consulter": {"Infinitif": "Consulter", "ParticipePasse": "Consulté", "ParticipePresent": "Consultant", "Auxiliaire": "avoir", "Present": ["Consulte", "Consultes", "Consulte", "Consultons", "Consultez", "Consultent"], "Imparfait": ["Consultais", "Consultais", "Consultait", "Consultions", "Consultiez", "Consultaient"], "PasseSimple": ["Consultai", "Consultas", "Consulta", "Consultâmes", "Consultâtes", "Consultèrent"], "FuturSimple": ["Consulterai", "Consulteras", "Consultera", "Consulterons", "Consulterez", "Consulteront"], "PasseCompose": ["ai consulté", "as consulté", "a consulté", "avons consulté", "avez consulté", "ont consulté"], "PlusQueParfait": ["avais consulté", "avais consulté", "avait consulté", "avions consulté", "aviez consulté", "avaient consulté"], "PasseAnterieur": ["eus consulté", "eus consulté", "eut consulté", "eûmes consulté", "eûtes consulté", "eurent consulté"], "FuturAnterieur": ["aurai consulté", "auras consulté", "aura consulté", "aurons consulté", "aurez consulté", "auront consulté"], "SubjonctifPresent": ["Consulte", "Consultes", "Consulte", "Consultions", "Consultiez", "Consultent"], "SubjonctifImparfait": ["Consultasse", "Consultasses", "Consultât", "Consultassions", "Consultassiez", "Consultassent"], "SubjonctifPasse": ["aie consulté", "aies consulté", "ait consulté", "ayons consulté", "ayez consulté", "aient consulté"], "SubjonctifPlusQueParfait": ["eusse consulté", "eusses consulté", "eût consulté", "eussions consulté", "eussiez consulté", "eussent consulté"], "ConditionnelPresent": ["Consulterais", "Consulterais", "Consulterait", "Consulterions", "Consulteriez", "Consulteraient"], "ConditionnelPasse": ["aurais consulté", "aurais consulté", "aurait consulté", "aurions consulté", "auriez consulté", "auraient consulté"], "ConditionnelPasseII": ["eusse consulté", "eusses consulté", "eût consulté", "eussions consulté", "eussiez consulté", "eussent consulté"], "Imperatif": ["", "Consulte !", "", "Consultons !", "Consultez !", ""], "ImperatifPasse": ["", "aie consulté !", "", "ayons consulté !", "ayez consulté !", ""]},
    "contenir": {"Infinitif": "Contenir", "ParticipePasse": "Contenu", "ParticipePresent": "Contenant", "Auxiliaire": "avoir", "FormePronominale": "se contenir", "Present": ["Contiens", "Contiens", "Contient", "Contenons", "Contenez", "Contiennent"], "Imparfait": ["Contenais", "Contenais", "Contenait", "Contenions", "Conteniez", "Contenaient"], "PasseSimple": ["Contins", "Contins", "Contint", "Contînmes", "Contîntes", "Continrent"], "FuturSimple": ["Contiendrai", "Contiendras", "Contiendra", "Contiendrons", "Contiendrez", "Contiendront"], "PasseCompose": ["ai contenu", "as contenu", "a contenu", "avons contenu", "avez contenu", "ont contenu"], "PlusQueParfait": ["avais contenu", "avais contenu", "avait contenu", "avions contenu", "aviez contenu", "avaient contenu"], "PasseAnterieur": ["eus contenu", "eus contenu", "eut contenu", "eûmes contenu", "eûtes contenu", "eurent contenu"], "FuturAnterieur": ["aurai contenu", "auras contenu", "aura contenu", "aurons contenu", "aurez contenu", "auront contenu"], "SubjonctifPresent": ["Contienne", "Contiennes", "Contienne", "Contenions", "Conteniez", "Contiennent"], "SubjonctifImparfait": ["Continsse", "Continsses", "Contînt", "Continssions", "Continssiez", "Continssent"], "SubjonctifPasse": ["aie contenu", "aies contenu", "ait contenu", "ayons contenu", "ayez contenu", "aient contenu"], "SubjonctifPlusQueParfait": ["eusse contenu", "eusses contenu", "eût contenu", "eussions contenu", "eussiez contenu", "eussent contenu"], "ConditionnelPresent": ["Contiendrais", "Contiendrais", "Contiendrait", "Contiendrions", "Contiendriez", "Contiendraient"], "ConditionnelPasse": ["aurais contenu", "aurais contenu", "aurait contenu", "aurions contenu", "auriez contenu", "auraient contenu"], "ConditionnelPasseII": ["eusse contenu", "eusses contenu", "eût contenu", "eussions contenu", "eussiez contenu", "eussent contenu"], "Imperatif": ["", "Contiens !", "", "Contenons !", "Contenez !", ""], "ImperatifPasse": ["", "aie contenu !", "", "ayons contenu !", "ayez contenu !", ""]},
    "continuer": {"Infinitif": "Continuer", "ParticipePasse": "Continué", "ParticipePresent": "Continuant", "Auxiliaire": "avoir", "Present": ["Continue", "Continues", "Continue", "Continuons", "Continuez", "Continuent"], "Imparfait": ["Continuais", "Continuais", "Continuait", "Continuions", "Continuiez", "Continuaient"], "PasseSimple": ["Continuai", "Continuas", "Continua", "Continuâmes", "Continuâtes", "Continuèrent"], "FuturSimple": ["Continuerai", "Continueras", "Continuera", "Continuerons", "Continuerez", "Continueront"], "PasseCompose": ["ai continué", "as continué", "a continué", "avons continué", "avez continué", "ont continué"], "PlusQueParfait": ["avais continué", "avais continué", "avait continué", "avions continué", "aviez continué", "avaient continué"], "PasseAnterieur": ["eus continué", "eus continué", "eut continué", "eûmes continué", "eûtes continué", "eurent continué"], "FuturAnterieur": ["aurai continué", "auras continué", "aura continué", "aurons continué", "aurez continué", "auront continué"], "SubjonctifPresent": ["Continue", "Continues", "Continue", "Continuions", "Continuiez", "Continuent"], "SubjonctifImparfait": ["Continuasse", "Continuasses", "Continuât", "Continuassions", "Continuassiez", "Continuassent"], "SubjonctifPasse": ["aie continué", "aies continué", "ait continué", "ayons continué", "ayez continué", "aient continué"], "SubjonctifPlusQueParfait": ["eusse continué", "eusses continué", "eût continué", "eussions continué", "eussiez continué", "eussent continué"], "ConditionnelPresent": ["Continuerais", "Continuerais", "Continuerait", "Continuerions", "Continueriez", "Continueraient"], "ConditionnelPasse": ["aurais continué", "aurais continué", "aurait continué", "aurions continué", "auriez continué", "auraient continué"], "ConditionnelPasseII": ["eusse continué", "eusses continué", "eût continué", "eussions continué", "eussiez continué", "eussent continué"], "Imperatif": ["", "Continue !", "", "Continuons !", "Continuez !", ""], "ImperatifPasse": ["", "aie continué !", "", "ayons continué !", "ayez continué !", ""]}
}

def escape_sql(text):
    """Escape single quotes for SQL."""
    if text is None:
        return 'NULL'
    return "'" + str(text).replace("'", "''") + "'"

def generate_verb_insert(infinitive, data):
    """Generate INSERT for verbs table."""
    past_participle = data.get('ParticipePasse', '')
    present_participle = data.get('ParticipePresent', '')
    auxiliary = data.get('Auxiliaire', '')
    pronominal_form = data.get('FormePronominale', '')
    
    return f"""INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form)
VALUES ({escape_sql(infinitive)}, {escape_sql(past_participle)}, {escape_sql(present_participle)}, {escape_sql(auxiliary)}, {escape_sql(pronominal_form)});
"""

def generate_conjugation_insert(infinitive, data):
    """Generate INSERT for verb_conjugations table."""
    # Map JSONB keys to database columns
    conjugations = []
    
    # Present
    present = data.get('Present', [''] * 6)
    conjugations.extend([f"present_{i+1} = {escape_sql(v)}" for i, v in enumerate(present)])
    
    # Imparfait
    imparfait = data.get('Imparfait', [''] * 6)
    conjugations.extend([f"imparfait_{i+1} = {escape_sql(v)}" for i, v in enumerate(imparfait)])
    
    # Passé Simple
    passe_simple = data.get('PasseSimple', [''] * 6)
    conjugations.extend([f"passe_simple_{i+1} = {escape_sql(v)}" for i, v in enumerate(passe_simple)])
    
    # Futur Simple
    futur_simple = data.get('FuturSimple', [''] * 6)
    conjugations.extend([f"futur_simple_{i+1} = {escape_sql(v)}" for i, v in enumerate(futur_simple)])
    
    # Passé Composé
    passe_compose = data.get('PasseCompose', [''] * 6)
    conjugations.extend([f"passe_compose_{i+1} = {escape_sql(v)}" for i, v in enumerate(passe_compose)])
    
    # Plus-que-Parfait
    plus_que_parfait = data.get('PlusQueParfait', [''] * 6)
    conjugations.extend([f"plus_que_parfait_{i+1} = {escape_sql(v)}" for i, v in enumerate(plus_que_parfait)])
    
    # Passé Antérieur
    passe_anterieur = data.get('PasseAnterieur', [''] * 6)
    conjugations.extend([f"passe_anterieur_{i+1} = {escape_sql(v)}" for i, v in enumerate(passe_anterieur)])
    
    # Futur Antérieur
    futur_anterieur = data.get('FuturAnterieur', [''] * 6)
    conjugations.extend([f"futur_anterieur_{i+1} = {escape_sql(v)}" for i, v in enumerate(futur_anterieur)])
    
    # Subjonctif Présent
    subj_present = data.get('SubjonctifPresent', [''] * 6)
    conjugations.extend([f"subjonctif_present_{i+1} = {escape_sql(v)}" for i, v in enumerate(subj_present)])
    
    # Subjonctif Imparfait
    subj_imparfait = data.get('SubjonctifImparfait', [''] * 6)
    conjugations.extend([f"subjonctif_imparfait_{i+1} = {escape_sql(v)}" for i, v in enumerate(subj_imparfait)])
    
    # Subjonctif Passé
    subj_passe = data.get('SubjonctifPasse', [''] * 6)
    conjugations.extend([f"subjonctif_passe_{i+1} = {escape_sql(v)}" for i, v in enumerate(subj_passe)])
    
    # Subjonctif Plus-que-Parfait
    subj_pqp = data.get('SubjonctifPlusQueParfait', [''] * 6)
    conjugations.extend([f"subjonctif_plus_que_parfait_{i+1} = {escape_sql(v)}" for i, v in enumerate(subj_pqp)])
    
    # Conditionnel Présent
    cond_present = data.get('ConditionnelPresent', [''] * 6)
    conjugations.extend([f"conditionnel_present_{i+1} = {escape_sql(v)}" for i, v in enumerate(cond_present)])
    
    # Conditionnel Passé
    cond_passe = data.get('ConditionnelPasse', [''] * 6)
    conjugations.extend([f"conditionnel_passe_{i+1} = {escape_sql(v)}" for i, v in enumerate(cond_passe)])
    
    # Conditionnel Passé II
    cond_passe_ii = data.get('ConditionnelPasseII', [''] * 6)
    conjugations.extend([f"conditionnel_passe_ii_{i+1} = {escape_sql(v)}" for i, v in enumerate(cond_passe_ii)])
    
    # Impératif
    imperatif = data.get('Imperatif', [''] * 6)
    conjugations.extend([f"imperatif_{i+1} = {escape_sql(v)}" for i, v in enumerate(imperatif)])
    
    # Impératif Passé
    imp_passe = data.get('ImperatifPasse', [''] * 6)
    conjugations.extend([f"imperatif_passe_{i+1} = {escape_sql(v)}" for i, v in enumerate(imp_passe)])
    
    return f"""INSERT INTO verb_conjugations (verb_id, {', '.join([c.split(' = ')[0] for c in conjugations])})
SELECT id, {', '.join([c.split(' = ')[1] for c in conjugations])}
FROM verbs WHERE infinitive = {escape_sql(infinitive)};
"""

def main():
    print("-- Auto-generated SQL to add missing verbs")
    print("-- Generated from convert_verbs_to_sql.py")
    print()
    
    for infinitive, data in verbs_data.items():
        print(f"-- Adding {infinitive}")
        print(generate_verb_insert(infinitive, data))
        print(generate_conjugation_insert(infinitive, data))
        print()

if __name__ == '__main__':
    main()
