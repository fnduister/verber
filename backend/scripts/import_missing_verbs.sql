-- Import missing verbs
-- Generated automatically

-- Adding verb: conduire
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'conduire') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('conduire', 'Conduit', 'Conduisant', 'avoir', 'se conduire', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'Conduis', 'Conduis', 'Conduit', 'Conduisons', 'Conduisez', 'Conduisent', 'Conduisais', 'Conduisais', 'Conduisait', 'Conduisions', 'Conduisiez', 'Conduisaient', 'Conduisis', 'Conduisis', 'Conduisit', 'Conduisîmes', 'Conduisîtes', 'Conduisirent', 'Conduirai', 'Conduiras', 'Conduira', 'Conduirons', 'Conduirez', 'Conduiront', 'ai conduit', 'as conduit', 'a conduit', 'avons conduit', 'avez conduit', 'ont conduit', 'avais conduit', 'avais conduit', 'avait conduit', 'avions conduit', 'aviez conduit', 'avaient conduit', 'eus conduit', 'eus conduit', 'eut conduit', 'eûmes conduit', 'eûtes conduit', 'eurent conduit', 'aurai conduit', 'auras conduit', 'aura conduit', 'aurons conduit', 'aurez conduit', 'auront conduit', 'Conduise', 'Conduises', 'Conduise', 'Conduisions', 'Conduisiez', 'Conduisent', 'Conduisisse', 'Conduisisses', 'Conduisît', 'Conduisissions', 'Conduisissiez', 'Conduisissent', 'aie conduit', 'aies conduit', 'ait conduit', 'ayons conduit', 'ayez conduit', 'aient conduit', 'eusse conduit', 'eusses conduit', 'eût conduit', 'eussions conduit', 'eussiez conduit', 'eussent conduit', 'Conduirais', 'Conduirais', 'Conduirait', 'Conduirions', 'Conduiriez', 'Conduiraient', 'aurais conduit', 'aurais conduit', 'aurait conduit', 'aurions conduit', 'auriez conduit', 'auraient conduit', 'eusse conduit', 'eusses conduit', 'eût conduit', 'eussions conduit', 'eussiez conduit', 'eussent conduit', '', 'Conduis !', '', 'Conduisons !', 'Conduisez !', '', '', 'aie conduit !', '', 'ayons conduit !', 'ayez conduit !', '');

        RAISE NOTICE 'Added verb: conduire (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: conduire (already exists)';
    END IF;
END $$;

-- Adding verb: connaître
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'connaître') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('connaître', 'Connu', 'Connaissant', 'avoir', 'se connaître', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'Connais', 'Connais', 'Connaît', 'Connaissons', 'Connaissez', 'Connaissent', 'Connaissais', 'Connaissais', 'Connaissait', 'Connaissions', 'Connaissiez', 'Connaissaient', 'Connus', 'Connus', 'Connut', 'Connûmes', 'Connûtes', 'Connurent', 'Connaîtrai', 'Connaîtras', 'Connaîtra', 'Connaîtrons', 'Connaîtrez', 'Connaîtront', 'ai connu', 'as connu', 'a connu', 'avons connu', 'avez connu', 'ont connu', 'avais connu', 'avais connu', 'avait connu', 'avions connu', 'aviez connu', 'avaient connu', 'eus connu', 'eus connu', 'eut connu', 'eûmes connu', 'eûtes connu', 'eurent connu', 'aurai connu', 'auras connu', 'aura connu', 'aurons connu', 'aurez connu', 'auront connu', 'Connaisse', 'Connaisses', 'Connaisse', 'Connaissions', 'Connaissiez', 'Connaissent', 'Connusse', 'Connusses', 'Connût', 'Connussions', 'Connussiez', 'Connussent', 'aie connu', 'aies connu', 'ait connu', 'ayons connu', 'ayez connu', 'aient connu', 'eusse connu', 'eusses connu', 'eût connu', 'eussions connu', 'eussiez connu', 'eussent connu', 'Connaîtrais', 'Connaîtrais', 'Connaîtrait', 'Connaîtrions', 'Connaîtriez', 'Connaîtraient', 'aurais connu', 'aurais connu', 'aurait connu', 'aurions connu', 'auriez connu', 'auraient connu', 'eusse connu', 'eusses connu', 'eût connu', 'eussions connu', 'eussiez connu', 'eussent connu', '', 'Connais !', '', 'Connaissons !', 'Connaissez !', '', '', 'aie connu !', '', 'ayons connu !', 'ayez connu !', '');

        RAISE NOTICE 'Added verb: connaître (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: connaître (already exists)';
    END IF;
END $$;

-- Adding verb: construire
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'construire') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('construire', 'Construit', 'Construisant', 'avoir', 'se construire', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'Construis', 'Construis', 'Construit', 'Construisons', 'Construisez', 'Construisent', 'Construisais', 'Construisais', 'Construisait', 'Construisions', 'Construisiez', 'Construisaient', 'Construisis', 'Construisis', 'Construisit', 'Construisîmes', 'Construisîtes', 'Construisirent', 'Construirai', 'Construiras', 'Construira', 'Construirons', 'Construirez', 'Construiront', 'ai construit', 'as construit', 'a construit', 'avons construit', 'avez construit', 'ont construit', 'avais construit', 'avais construit', 'avait construit', 'avions construit', 'aviez construit', 'avaient construit', 'eus construit', 'eus construit', 'eut construit', 'eûmes construit', 'eûtes construit', 'eurent construit', 'aurai construit', 'auras construit', 'aura construit', 'aurons construit', 'aurez construit', 'auront construit', 'Construise', 'Construises', 'Construise', 'Construisions', 'Construisiez', 'Construisent', 'Construisisse', 'Construisisses', 'Construisît', 'Construisissions', 'Construisissiez', 'Construisissent', 'aie construit', 'aies construit', 'ait construit', 'ayons construit', 'ayez construit', 'aient construit', 'eusse construit', 'eusses construit', 'eût construit', 'eussions construit', 'eussiez construit', 'eussent construit', 'Construirais', 'Construirais', 'Construirait', 'Construirions', 'Construiriez', 'Construiraient', 'aurais construit', 'aurais construit', 'aurait construit', 'aurions construit', 'auriez construit', 'auraient construit', 'eusse construit', 'eusses construit', 'eût construit', 'eussions construit', 'eussiez construit', 'eussent construit', '', 'Construis !', '', 'Construisons !', 'Construisez !', '', '', 'aie construit !', '', 'ayons construit !', 'ayez construit !', '');

        RAISE NOTICE 'Added verb: construire (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: construire (already exists)';
    END IF;
END $$;

-- Adding verb: consulter
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'consulter') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('consulter', 'Consulté', 'Consultant', 'avoir', '', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'Consulte', 'Consultes', 'Consulte', 'Consultons', 'Consultez', 'Consultent', 'Consultais', 'Consultais', 'Consultait', 'Consultions', 'Consultiez', 'Consultaient', 'Consultai', 'Consultas', 'Consulta', 'Consultâmes', 'Consultâtes', 'Consultèrent', 'Consulterai', 'Consulteras', 'Consultera', 'Consulterons', 'Consulterez', 'Consulteront', 'ai consulté', 'as consulté', 'a consulté', 'avons consulté', 'avez consulté', 'ont consulté', 'avais consulté', 'avais consulté', 'avait consulté', 'avions consulté', 'aviez consulté', 'avaient consulté', 'eus consulté', 'eus consulté', 'eut consulté', 'eûmes consulté', 'eûtes consulté', 'eurent consulté', 'aurai consulté', 'auras consulté', 'aura consulté', 'aurons consulté', 'aurez consulté', 'auront consulté', 'Consulte', 'Consultes', 'Consulte', 'Consultions', 'Consultiez', 'Consultent', 'Consultasse', 'Consultasses', 'Consultât', 'Consultassions', 'Consultassiez', 'Consultassent', 'aie consulté', 'aies consulté', 'ait consulté', 'ayons consulté', 'ayez consulté', 'aient consulté', 'eusse consulté', 'eusses consulté', 'eût consulté', 'eussions consulté', 'eussiez consulté', 'eussent consulté', 'Consulterais', 'Consulterais', 'Consulterait', 'Consulterions', 'Consulteriez', 'Consulteraient', 'aurais consulté', 'aurais consulté', 'aurait consulté', 'aurions consulté', 'auriez consulté', 'auraient consulté', 'eusse consulté', 'eusses consulté', 'eût consulté', 'eussions consulté', 'eussiez consulté', 'eussent consulté', '', 'Consulte !', '', 'Consultons !', 'Consultez !', '', '', 'aie consulté !', '', 'ayons consulté !', 'ayez consulté !', '');

        RAISE NOTICE 'Added verb: consulter (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: consulter (already exists)';
    END IF;
END $$;

-- Adding verb: contenir
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'contenir') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('contenir', 'Contenu', 'Contenant', 'avoir', 'se contenir', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'Contiens', 'Contiens', 'Contient', 'Contenons', 'Contenez', 'Contiennent', 'Contenais', 'Contenais', 'Contenait', 'Contenions', 'Conteniez', 'Contenaient', 'Contins', 'Contins', 'Contint', 'Contînmes', 'Contîntes', 'Continrent', 'Contiendrai', 'Contiendras', 'Contiendra', 'Contiendrons', 'Contiendrez', 'Contiendront', 'ai contenu', 'as contenu', 'a contenu', 'avons contenu', 'avez contenu', 'ont contenu', 'avais contenu', 'avais contenu', 'avait contenu', 'avions contenu', 'aviez contenu', 'avaient contenu', 'eus contenu', 'eus contenu', 'eut contenu', 'eûmes contenu', 'eûtes contenu', 'eurent contenu', 'aurai contenu', 'auras contenu', 'aura contenu', 'aurons contenu', 'aurez contenu', 'auront contenu', 'Contienne', 'Contiennes', 'Contienne', 'Contenions', 'Conteniez', 'Contiennent', 'Continsse', 'Continsses', 'Contînt', 'Continssions', 'Continssiez', 'Continssent', 'aie contenu', 'aies contenu', 'ait contenu', 'ayons contenu', 'ayez contenu', 'aient contenu', 'eusse contenu', 'eusses contenu', 'eût contenu', 'eussions contenu', 'eussiez contenu', 'eussent contenu', 'Contiendrais', 'Contiendrais', 'Contiendrait', 'Contiendrions', 'Contiendriez', 'Contiendraient', 'aurais contenu', 'aurais contenu', 'aurait contenu', 'aurions contenu', 'auriez contenu', 'auraient contenu', 'eusse contenu', 'eusses contenu', 'eût contenu', 'eussions contenu', 'eussiez contenu', 'eussent contenu', '', 'Contiens !', '', 'Contenons !', 'Contenez !', '', '', 'aie contenu !', '', 'ayons contenu !', 'ayez contenu !', '');

        RAISE NOTICE 'Added verb: contenir (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: contenir (already exists)';
    END IF;
END $$;

-- Adding verb: continuer
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'continuer') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('continuer', 'Continué', 'Continuant', 'avoir', '', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'Continue', 'Continues', 'Continue', 'Continuons', 'Continuez', 'Continuent', 'Continuais', 'Continuais', 'Continuait', 'Continuions', 'Continuiez', 'Continuaient', 'Continuai', 'Continuas', 'Continua', 'Continuâmes', 'Continuâtes', 'Continuèrent', 'Continuerai', 'Continueras', 'Continuera', 'Continuerons', 'Continuerez', 'Continueront', 'ai continué', 'as continué', 'a continué', 'avons continué', 'avez continué', 'ont continué', 'avais continué', 'avais continué', 'avait continué', 'avions continué', 'aviez continué', 'avaient continué', 'eus continué', 'eus continué', 'eut continué', 'eûmes continué', 'eûtes continué', 'eurent continué', 'aurai continué', 'auras continué', 'aura continué', 'aurons continué', 'aurez continué', 'auront continué', 'Continue', 'Continues', 'Continue', 'Continuions', 'Continuiez', 'Continuent', 'Continuasse', 'Continuasses', 'Continuât', 'Continuassions', 'Continuassiez', 'Continuassent', 'aie continué', 'aies continué', 'ait continué', 'ayons continué', 'ayez continué', 'aient continué', 'eusse continué', 'eusses continué', 'eût continué', 'eussions continué', 'eussiez continué', 'eussent continué', 'Continuerais', 'Continuerais', 'Continuerait', 'Continuerions', 'Continueriez', 'Continueraient', 'aurais continué', 'aurais continué', 'aurait continué', 'aurions continué', 'auriez continué', 'auraient continué', 'eusse continué', 'eusses continué', 'eût continué', 'eussions continué', 'eussiez continué', 'eussent continué', '', 'Continue !', '', 'Continuons !', 'Continuez !', '', '', 'aie continué !', '', 'ayons continué !', 'ayez continué !', '');

        RAISE NOTICE 'Added verb: continuer (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: continuer (already exists)';
    END IF;
END $$;

-- Adding verb: assembler
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'assembler') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('assembler', 'assemblé', 'assemblant', 'avoir', 'se assembler', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'assemble', 'assembles', 'assemble', 'assemblons', 'assemblez', 'assemblent', 'assemblais', 'assemblais', 'assemblait', 'assemblions', 'assembliez', 'assemblaient', 'assemblai', 'assemblas', 'assembla', 'assemblâmes', 'assemblâtes', 'assemblèrent', 'assemblerai', 'assembleras', 'assemblera', 'assemblerons', 'assemblerez', 'assembleront', 'ai assemblé', 'as assemblé', 'a assemblé', 'avons assemblé', 'avez assemblé', 'ont assemblé', 'avais assemblé', 'avais assemblé', 'avait assemblé', 'avions assemblé', 'aviez assemblé', 'avaient assemblé', 'eus assemblé', 'eus assemblé', 'eut assemblé', 'eûmes assemblé', 'eûtes assemblé', 'eurent assemblé', 'aurai assemblé', 'auras assemblé', 'aura assemblé', 'aurons assemblé', 'aurez assemblé', 'auront assemblé', 'assemble', 'assembles', 'assemble', 'assemblions', 'assembliez', 'assemblent', 'assemblasse', 'assemblasses', 'assemblât', 'assemblassions', 'assemblassiez', 'assemblassent', 'aie assemblé', 'aies assemblé', 'ait assemblé', 'ayons assemblé', 'ayez assemblé', 'aient assemblé', 'eusse assemblé', 'eusses assemblé', 'eût assemblé', 'eussions assemblé', 'eussiez assemblé', 'eussent assemblé', 'assemblerais', 'assemblerais', 'assemblerait', 'assemblerions', 'assembleriez', 'assembleraient', 'aurais assemblé', 'aurais assemblé', 'aurait assemblé', 'aurions assemblé', 'auriez assemblé', 'auraient assemblé', 'eusse assemblé', 'eusses assemblé', 'eût assemblé', 'eussions assemblé', 'eussiez assemblé', 'eussent assemblé', '', 'assemble !', '', 'assemblons !', 'assemblez !', '', '', 'aie assemblé !', '', 'ayons assemblé !', 'ayez assemblé !', '');

        RAISE NOTICE 'Added verb: assembler (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: assembler (already exists)';
    END IF;
END $$;

-- Adding verb: calculer
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'calculer') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('calculer', 'calculé', 'calculant', 'avoir', 'se calculer', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'calcule', 'calcules', 'calcule', 'calculons', 'calculez', 'calculent', 'calculais', 'calculais', 'calculait', 'calculions', 'calculiez', 'calculaient', 'calculai', 'calculas', 'calcula', 'calculâmes', 'calculâtes', 'calculèrent', 'calculerai', 'calculeras', 'calculera', 'calculerons', 'calculerez', 'calculeront', 'ai calculé', 'as calculé', 'a calculé', 'avons calculé', 'avez calculé', 'ont calculé', 'avais calculé', 'avais calculé', 'avait calculé', 'avions calculé', 'aviez calculé', 'avaient calculé', 'eus calculé', 'eus calculé', 'eut calculé', 'eûmes calculé', 'eûtes calculé', 'eurent calculé', 'aurai calculé', 'auras calculé', 'aura calculé', 'aurons calculé', 'aurez calculé', 'auront calculé', 'calcule', 'calcules', 'calcule', 'calculions', 'calculiez', 'calculent', 'calculasse', 'calculasses', 'calculât', 'calculassions', 'calculassiez', 'calculassent', 'aie calculé', 'aies calculé', 'ait calculé', 'ayons calculé', 'ayez calculé', 'aient calculé', 'eusse calculé', 'eusses calculé', 'eût calculé', 'eussions calculé', 'eussiez calculé', 'eussent calculé', 'calculerais', 'calculerais', 'calculerait', 'calculerions', 'calculeriez', 'calculeraient', 'aurais calculé', 'aurais calculé', 'aurait calculé', 'aurions calculé', 'auriez calculé', 'auraient calculé', 'eusse calculé', 'eusses calculé', 'eût calculé', 'eussions calculé', 'eussiez calculé', 'eussent calculé', '', 'calcule !', '', 'calculons !', 'calculez !', '', '', 'aie calculé !', '', 'ayons calculé !', 'ayez calculé !', '');

        RAISE NOTICE 'Added verb: calculer (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: calculer (already exists)';
    END IF;
END $$;

-- Adding verb: cuisiner
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'cuisiner') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('cuisiner', 'cuisiné', 'cuisinant', 'avoir', 'se cuisiner', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'cuisine', 'cuisines', 'cuisine', 'cuisinons', 'cuisinez', 'cuisinent', 'cuisinais', 'cuisinais', 'cuisinait', 'cuisinions', 'cuisiniez', 'cuisinaient', 'cuisinai', 'cuisinas', 'cuisina', 'cuisinâmes', 'cuisinâtes', 'cuisinèrent', 'cuisinerai', 'cuisineras', 'cuisinera', 'cuisinerons', 'cuisinerez', 'cuisineront', 'ai cuisiné', 'as cuisiné', 'a cuisiné', 'avons cuisiné', 'avez cuisiné', 'ont cuisiné', 'avais cuisiné', 'avais cuisiné', 'avait cuisiné', 'avions cuisiné', 'aviez cuisiné', 'avaient cuisiné', 'eus cuisiné', 'eus cuisiné', 'eut cuisiné', 'eûmes cuisiné', 'eûtes cuisiné', 'eurent cuisiné', 'aurai cuisiné', 'auras cuisiné', 'aura cuisiné', 'aurons cuisiné', 'aurez cuisiné', 'auront cuisiné', 'cuisine', 'cuisines', 'cuisine', 'cuisinions', 'cuisiniez', 'cuisinent', 'cuisinasse', 'cuisinasses', 'cuisinât', 'cuisinassions', 'cuisinassiez', 'cuisinassent', 'aie cuisiné', 'aies cuisiné', 'ait cuisiné', 'ayons cuisiné', 'ayez cuisiné', 'aient cuisiné', 'eusse cuisiné', 'eusses cuisiné', 'eût cuisiné', 'eussions cuisiné', 'eussiez cuisiné', 'eussent cuisiné', 'cuisinerais', 'cuisinerais', 'cuisinerait', 'cuisinerions', 'cuisineriez', 'cuisineraient', 'aurais cuisiné', 'aurais cuisiné', 'aurait cuisiné', 'aurions cuisiné', 'auriez cuisiné', 'auraient cuisiné', 'eusse cuisiné', 'eusses cuisiné', 'eût cuisiné', 'eussions cuisiné', 'eussiez cuisiné', 'eussent cuisiné', '', 'cuisine !', '', 'cuisinons !', 'cuisinez !', '', '', 'aie cuisiné !', '', 'ayons cuisiné !', 'ayez cuisiné !', '');

        RAISE NOTICE 'Added verb: cuisiner (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: cuisiner (already exists)';
    END IF;
END $$;

-- Adding verb: cultiver
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'cultiver') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('cultiver', 'cultivé', 'cultivant', 'avoir', 'se cultiver', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'cultive', 'cultives', 'cultive', 'cultivons', 'cultivez', 'cultivent', 'cultivais', 'cultivais', 'cultivait', 'cultivions', 'cultiviez', 'cultivaient', 'cultivai', 'cultivas', 'cultiva', 'cultivâmes', 'cultivâtes', 'cultivèrent', 'cultiverai', 'cultiveras', 'cultivera', 'cultiverons', 'cultiverez', 'cultiveront', 'ai cultivé', 'as cultivé', 'a cultivé', 'avons cultivé', 'avez cultivé', 'ont cultivé', 'avais cultivé', 'avais cultivé', 'avait cultivé', 'avions cultivé', 'aviez cultivé', 'avaient cultivé', 'eus cultivé', 'eus cultivé', 'eut cultivé', 'eûmes cultivé', 'eûtes cultivé', 'eurent cultivé', 'aurai cultivé', 'auras cultivé', 'aura cultivé', 'aurons cultivé', 'aurez cultivé', 'auront cultivé', 'cultive', 'cultives', 'cultive', 'cultivions', 'cultiviez', 'cultivent', 'cultivasse', 'cultivasses', 'cultivât', 'cultivassions', 'cultivassiez', 'cultivassent', 'aie cultivé', 'aies cultivé', 'ait cultivé', 'ayons cultivé', 'ayez cultivé', 'aient cultivé', 'eusse cultivé', 'eusses cultivé', 'eût cultivé', 'eussions cultivé', 'eussiez cultivé', 'eussent cultivé', 'cultiverais', 'cultiverais', 'cultiverait', 'cultiverions', 'cultiveriez', 'cultiveraient', 'aurais cultivé', 'aurais cultivé', 'aurait cultivé', 'aurions cultivé', 'auriez cultivé', 'auraient cultivé', 'eusse cultivé', 'eusses cultivé', 'eût cultivé', 'eussions cultivé', 'eussiez cultivé', 'eussent cultivé', '', 'cultive !', '', 'cultivons !', 'cultivez !', '', '', 'aie cultivé !', '', 'ayons cultivé !', 'ayez cultivé !', '');

        RAISE NOTICE 'Added verb: cultiver (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: cultiver (already exists)';
    END IF;
END $$;

-- Adding verb: décoller
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'décoller') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('décoller', 'décollé', 'décollant', 'avoir', 'se décoller', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'décolle', 'décolles', 'décolle', 'décollons', 'décollez', 'décollent', 'décollais', 'décollais', 'décollait', 'décollions', 'décolliez', 'décollaient', 'décollai', 'décollas', 'décolla', 'décollâmes', 'décollâtes', 'décollèrent', 'décollerai', 'décolleras', 'décollera', 'décollerons', 'décollerez', 'décolleront', 'ai décollé', 'as décollé', 'a décollé', 'avons décollé', 'avez décollé', 'ont décollé', 'avais décollé', 'avais décollé', 'avait décollé', 'avions décollé', 'aviez décollé', 'avaient décollé', 'eus décollé', 'eus décollé', 'eut décollé', 'eûmes décollé', 'eûtes décollé', 'eurent décollé', 'aurai décollé', 'auras décollé', 'aura décollé', 'aurons décollé', 'aurez décollé', 'auront décollé', 'décolle', 'décolles', 'décolle', 'décollions', 'décolliez', 'décollent', 'décollasse', 'décollasses', 'décollât', 'décollassions', 'décollassiez', 'décollassent', 'aie décollé', 'aies décollé', 'ait décollé', 'ayons décollé', 'ayez décollé', 'aient décollé', 'eusse décollé', 'eusses décollé', 'eût décollé', 'eussions décollé', 'eussiez décollé', 'eussent décollé', 'décollerais', 'décollerais', 'décollerait', 'décollerions', 'décolleriez', 'décolleraient', 'aurais décollé', 'aurais décollé', 'aurait décollé', 'aurions décollé', 'auriez décollé', 'auraient décollé', 'eusse décollé', 'eusses décollé', 'eût décollé', 'eussions décollé', 'eussiez décollé', 'eussent décollé', '', 'décolle !', '', 'décollons !', 'décollez !', '', '', 'aie décollé !', '', 'ayons décollé !', 'ayez décollé !', '');

        RAISE NOTICE 'Added verb: décoller (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: décoller (already exists)';
    END IF;
END $$;

-- Adding verb: déguster
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'déguster') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('déguster', 'dégusté', 'dégustant', 'avoir', 'se déguster', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'déguste', 'dégustes', 'déguste', 'dégustons', 'dégustez', 'dégustent', 'dégustais', 'dégustais', 'dégustait', 'dégustions', 'dégustiez', 'dégustaient', 'dégustai', 'dégustas', 'dégusta', 'dégustâmes', 'dégustâtes', 'dégustèrent', 'dégusterai', 'dégusteras', 'dégustera', 'dégusterons', 'dégusterez', 'dégusteront', 'ai dégusté', 'as dégusté', 'a dégusté', 'avons dégusté', 'avez dégusté', 'ont dégusté', 'avais dégusté', 'avais dégusté', 'avait dégusté', 'avions dégusté', 'aviez dégusté', 'avaient dégusté', 'eus dégusté', 'eus dégusté', 'eut dégusté', 'eûmes dégusté', 'eûtes dégusté', 'eurent dégusté', 'aurai dégusté', 'auras dégusté', 'aura dégusté', 'aurons dégusté', 'aurez dégusté', 'auront dégusté', 'déguste', 'dégustes', 'déguste', 'dégustions', 'dégustiez', 'dégustent', 'dégustasse', 'dégustasses', 'dégustât', 'dégustassions', 'dégustassiez', 'dégustassent', 'aie dégusté', 'aies dégusté', 'ait dégusté', 'ayons dégusté', 'ayez dégusté', 'aient dégusté', 'eusse dégusté', 'eusses dégusté', 'eût dégusté', 'eussions dégusté', 'eussiez dégusté', 'eussent dégusté', 'dégusterais', 'dégusterais', 'dégusterait', 'dégusterions', 'dégusteriez', 'dégusteraient', 'aurais dégusté', 'aurais dégusté', 'aurait dégusté', 'aurions dégusté', 'auriez dégusté', 'auraient dégusté', 'eusse dégusté', 'eusses dégusté', 'eût dégusté', 'eussions dégusté', 'eussiez dégusté', 'eussent dégusté', '', 'déguste !', '', 'dégustons !', 'dégustez !', '', '', 'aie dégusté !', '', 'ayons dégusté !', 'ayez dégusté !', '');

        RAISE NOTICE 'Added verb: déguster (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: déguster (already exists)';
    END IF;
END $$;

-- Adding verb: développer
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'développer') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('développer', 'développé', 'développant', 'avoir', 'se développer', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'développe', 'développes', 'développe', 'développons', 'développez', 'développent', 'développais', 'développais', 'développait', 'développions', 'développiez', 'développaient', 'développai', 'développas', 'développa', 'développâmes', 'développâtes', 'développèrent', 'développerai', 'développeras', 'développera', 'développerons', 'développerez', 'développeront', 'ai développé', 'as développé', 'a développé', 'avons développé', 'avez développé', 'ont développé', 'avais développé', 'avais développé', 'avait développé', 'avions développé', 'aviez développé', 'avaient développé', 'eus développé', 'eus développé', 'eut développé', 'eûmes développé', 'eûtes développé', 'eurent développé', 'aurai développé', 'auras développé', 'aura développé', 'aurons développé', 'aurez développé', 'auront développé', 'développe', 'développes', 'développe', 'développions', 'développiez', 'développent', 'développasse', 'développasses', 'développât', 'développassions', 'développassiez', 'développassent', 'aie développé', 'aies développé', 'ait développé', 'ayons développé', 'ayez développé', 'aient développé', 'eusse développé', 'eusses développé', 'eût développé', 'eussions développé', 'eussiez développé', 'eussent développé', 'développerais', 'développerais', 'développerait', 'développerions', 'développeriez', 'développeraient', 'aurais développé', 'aurais développé', 'aurait développé', 'aurions développé', 'auriez développé', 'auraient développé', 'eusse développé', 'eusses développé', 'eût développé', 'eussions développé', 'eussiez développé', 'eussent développé', '', 'développe !', '', 'développons !', 'développez !', '', '', 'aie développé !', '', 'ayons développé !', 'ayez développé !', '');

        RAISE NOTICE 'Added verb: développer (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: développer (already exists)';
    END IF;
END $$;

-- Adding verb: interpréter
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'interpréter') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('interpréter', 'interprété', 'interprétant', 'avoir', 'se interpréter', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'interpréte', 'interprétes', 'interpréte', 'interprétons', 'interprétez', 'interprétent', 'interprétais', 'interprétais', 'interprétait', 'interprétions', 'interprétiez', 'interprétaient', 'interprétai', 'interprétas', 'interpréta', 'interprétâmes', 'interprétâtes', 'interprétèrent', 'interpréterai', 'interpréteras', 'interprétera', 'interpréterons', 'interpréterez', 'interpréteront', 'ai interprété', 'as interprété', 'a interprété', 'avons interprété', 'avez interprété', 'ont interprété', 'avais interprété', 'avais interprété', 'avait interprété', 'avions interprété', 'aviez interprété', 'avaient interprété', 'eus interprété', 'eus interprété', 'eut interprété', 'eûmes interprété', 'eûtes interprété', 'eurent interprété', 'aurai interprété', 'auras interprété', 'aura interprété', 'aurons interprété', 'aurez interprété', 'auront interprété', 'interpréte', 'interprétes', 'interpréte', 'interprétions', 'interprétiez', 'interprétent', 'interprétasse', 'interprétasses', 'interprétât', 'interprétassions', 'interprétassiez', 'interprétassent', 'aie interprété', 'aies interprété', 'ait interprété', 'ayons interprété', 'ayez interprété', 'aient interprété', 'eusse interprété', 'eusses interprété', 'eût interprété', 'eussions interprété', 'eussiez interprété', 'eussent interprété', 'interpréterais', 'interpréterais', 'interpréterait', 'interpréterions', 'interpréteriez', 'interpréteraient', 'aurais interprété', 'aurais interprété', 'aurait interprété', 'aurions interprété', 'auriez interprété', 'auraient interprété', 'eusse interprété', 'eusses interprété', 'eût interprété', 'eussions interprété', 'eussiez interprété', 'eussent interprété', '', 'interpréte !', '', 'interprétons !', 'interprétez !', '', '', 'aie interprété !', '', 'ayons interprété !', 'ayez interprété !', '');

        RAISE NOTICE 'Added verb: interpréter (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: interpréter (already exists)';
    END IF;
END $$;

-- Adding verb: mémoriser
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'mémoriser') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('mémoriser', 'mémorisé', 'mémorisant', 'avoir', 'se mémoriser', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'mémorise', 'mémorises', 'mémorise', 'mémorisons', 'mémorisez', 'mémorisent', 'mémorisais', 'mémorisais', 'mémorisait', 'mémorisions', 'mémorisiez', 'mémorisaient', 'mémorisai', 'mémorisas', 'mémorisa', 'mémorisâmes', 'mémorisâtes', 'mémorisèrent', 'mémoriserai', 'mémoriseras', 'mémorisera', 'mémoriserons', 'mémoriserez', 'mémoriseront', 'ai mémorisé', 'as mémorisé', 'a mémorisé', 'avons mémorisé', 'avez mémorisé', 'ont mémorisé', 'avais mémorisé', 'avais mémorisé', 'avait mémorisé', 'avions mémorisé', 'aviez mémorisé', 'avaient mémorisé', 'eus mémorisé', 'eus mémorisé', 'eut mémorisé', 'eûmes mémorisé', 'eûtes mémorisé', 'eurent mémorisé', 'aurai mémorisé', 'auras mémorisé', 'aura mémorisé', 'aurons mémorisé', 'aurez mémorisé', 'auront mémorisé', 'mémorise', 'mémorises', 'mémorise', 'mémorisions', 'mémorisiez', 'mémorisent', 'mémorisasse', 'mémorisasses', 'mémorisât', 'mémorisassions', 'mémorisassiez', 'mémorisassent', 'aie mémorisé', 'aies mémorisé', 'ait mémorisé', 'ayons mémorisé', 'ayez mémorisé', 'aient mémorisé', 'eusse mémorisé', 'eusses mémorisé', 'eût mémorisé', 'eussions mémorisé', 'eussiez mémorisé', 'eussent mémorisé', 'mémoriserais', 'mémoriserais', 'mémoriserait', 'mémoriserions', 'mémoriseriez', 'mémoriseraient', 'aurais mémorisé', 'aurais mémorisé', 'aurait mémorisé', 'aurions mémorisé', 'auriez mémorisé', 'auraient mémorisé', 'eusse mémorisé', 'eusses mémorisé', 'eût mémorisé', 'eussions mémorisé', 'eussiez mémorisé', 'eussent mémorisé', '', 'mémorise !', '', 'mémorisons !', 'mémorisez !', '', '', 'aie mémorisé !', '', 'ayons mémorisé !', 'ayez mémorisé !', '');

        RAISE NOTICE 'Added verb: mémoriser (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: mémoriser (already exists)';
    END IF;
END $$;

-- Adding verb: négliger
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'négliger') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('négliger', 'négligé', 'négligant', 'avoir', 'se négliger', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'néglige', 'négliges', 'néglige', 'négligons', 'négligez', 'négligent', 'négligais', 'négligais', 'négligait', 'négligions', 'négligiez', 'négligaient', 'négligai', 'négligas', 'négliga', 'négligâmes', 'négligâtes', 'négligèrent', 'négligerai', 'négligeras', 'négligera', 'négligerons', 'négligerez', 'négligeront', 'ai négligé', 'as négligé', 'a négligé', 'avons négligé', 'avez négligé', 'ont négligé', 'avais négligé', 'avais négligé', 'avait négligé', 'avions négligé', 'aviez négligé', 'avaient négligé', 'eus négligé', 'eus négligé', 'eut négligé', 'eûmes négligé', 'eûtes négligé', 'eurent négligé', 'aurai négligé', 'auras négligé', 'aura négligé', 'aurons négligé', 'aurez négligé', 'auront négligé', 'néglige', 'négliges', 'néglige', 'négligions', 'négligiez', 'négligent', 'négligasse', 'négligasses', 'négligât', 'négligassions', 'négligassiez', 'négligassent', 'aie négligé', 'aies négligé', 'ait négligé', 'ayons négligé', 'ayez négligé', 'aient négligé', 'eusse négligé', 'eusses négligé', 'eût négligé', 'eussions négligé', 'eussiez négligé', 'eussent négligé', 'négligerais', 'négligerais', 'négligerait', 'négligerions', 'négligeriez', 'négligeraient', 'aurais négligé', 'aurais négligé', 'aurait négligé', 'aurions négligé', 'auriez négligé', 'auraient négligé', 'eusse négligé', 'eusses négligé', 'eût négligé', 'eussions négligé', 'eussiez négligé', 'eussent négligé', '', 'néglige !', '', 'négligons !', 'négligez !', '', '', 'aie négligé !', '', 'ayons négligé !', 'ayez négligé !', '');

        RAISE NOTICE 'Added verb: négliger (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: négliger (already exists)';
    END IF;
END $$;

-- Adding verb: ordonner
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'ordonner') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('ordonner', 'ordonné', 'ordonnant', 'avoir', 'se ordonner', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'ordonne', 'ordonnes', 'ordonne', 'ordonnons', 'ordonnez', 'ordonnent', 'ordonnais', 'ordonnais', 'ordonnait', 'ordonnions', 'ordonniez', 'ordonnaient', 'ordonnai', 'ordonnas', 'ordonna', 'ordonnâmes', 'ordonnâtes', 'ordonnèrent', 'ordonnerai', 'ordonneras', 'ordonnera', 'ordonnerons', 'ordonnerez', 'ordonneront', 'ai ordonné', 'as ordonné', 'a ordonné', 'avons ordonné', 'avez ordonné', 'ont ordonné', 'avais ordonné', 'avais ordonné', 'avait ordonné', 'avions ordonné', 'aviez ordonné', 'avaient ordonné', 'eus ordonné', 'eus ordonné', 'eut ordonné', 'eûmes ordonné', 'eûtes ordonné', 'eurent ordonné', 'aurai ordonné', 'auras ordonné', 'aura ordonné', 'aurons ordonné', 'aurez ordonné', 'auront ordonné', 'ordonne', 'ordonnes', 'ordonne', 'ordonnions', 'ordonniez', 'ordonnent', 'ordonnasse', 'ordonnasses', 'ordonnât', 'ordonnassions', 'ordonnassiez', 'ordonnassent', 'aie ordonné', 'aies ordonné', 'ait ordonné', 'ayons ordonné', 'ayez ordonné', 'aient ordonné', 'eusse ordonné', 'eusses ordonné', 'eût ordonné', 'eussions ordonné', 'eussiez ordonné', 'eussent ordonné', 'ordonnerais', 'ordonnerais', 'ordonnerait', 'ordonnerions', 'ordonneriez', 'ordonneraient', 'aurais ordonné', 'aurais ordonné', 'aurait ordonné', 'aurions ordonné', 'auriez ordonné', 'auraient ordonné', 'eusse ordonné', 'eusses ordonné', 'eût ordonné', 'eussions ordonné', 'eussiez ordonné', 'eussent ordonné', '', 'ordonne !', '', 'ordonnons !', 'ordonnez !', '', '', 'aie ordonné !', '', 'ayons ordonné !', 'ayez ordonné !', '');

        RAISE NOTICE 'Added verb: ordonner (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: ordonner (already exists)';
    END IF;
END $$;

-- Adding verb: participer
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'participer') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('participer', 'participé', 'participant', 'avoir', 'se participer', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'participe', 'participes', 'participe', 'participons', 'participez', 'participent', 'participais', 'participais', 'participait', 'participions', 'participiez', 'participaient', 'participai', 'participas', 'participa', 'participâmes', 'participâtes', 'participèrent', 'participerai', 'participeras', 'participera', 'participerons', 'participerez', 'participeront', 'ai participé', 'as participé', 'a participé', 'avons participé', 'avez participé', 'ont participé', 'avais participé', 'avais participé', 'avait participé', 'avions participé', 'aviez participé', 'avaient participé', 'eus participé', 'eus participé', 'eut participé', 'eûmes participé', 'eûtes participé', 'eurent participé', 'aurai participé', 'auras participé', 'aura participé', 'aurons participé', 'aurez participé', 'auront participé', 'participe', 'participes', 'participe', 'participions', 'participiez', 'participent', 'participasse', 'participasses', 'participât', 'participassions', 'participassiez', 'participassent', 'aie participé', 'aies participé', 'ait participé', 'ayons participé', 'ayez participé', 'aient participé', 'eusse participé', 'eusses participé', 'eût participé', 'eussions participé', 'eussiez participé', 'eussent participé', 'participerais', 'participerais', 'participerait', 'participerions', 'participeriez', 'participeraient', 'aurais participé', 'aurais participé', 'aurait participé', 'aurions participé', 'auriez participé', 'auraient participé', 'eusse participé', 'eusses participé', 'eût participé', 'eussions participé', 'eussiez participé', 'eussent participé', '', 'participe !', '', 'participons !', 'participez !', '', '', 'aie participé !', '', 'ayons participé !', 'ayez participé !', '');

        RAISE NOTICE 'Added verb: participer (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: participer (already exists)';
    END IF;
END $$;

-- Adding verb: publier
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'publier') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('publier', 'publié', 'publiant', 'avoir', 'se publier', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'publie', 'publies', 'publie', 'publions', 'publiez', 'publient', 'publiais', 'publiais', 'publiait', 'publiions', 'publiiez', 'publiaient', 'publiai', 'publias', 'publia', 'publiâmes', 'publiâtes', 'publièrent', 'publierai', 'publieras', 'publiera', 'publierons', 'publierez', 'publieront', 'ai publié', 'as publié', 'a publié', 'avons publié', 'avez publié', 'ont publié', 'avais publié', 'avais publié', 'avait publié', 'avions publié', 'aviez publié', 'avaient publié', 'eus publié', 'eus publié', 'eut publié', 'eûmes publié', 'eûtes publié', 'eurent publié', 'aurai publié', 'auras publié', 'aura publié', 'aurons publié', 'aurez publié', 'auront publié', 'publie', 'publies', 'publie', 'publiions', 'publiiez', 'publient', 'publiasse', 'publiasses', 'publiât', 'publiassions', 'publiassiez', 'publiassent', 'aie publié', 'aies publié', 'ait publié', 'ayons publié', 'ayez publié', 'aient publié', 'eusse publié', 'eusses publié', 'eût publié', 'eussions publié', 'eussiez publié', 'eussent publié', 'publierais', 'publierais', 'publierait', 'publierions', 'publieriez', 'publieraient', 'aurais publié', 'aurais publié', 'aurait publié', 'aurions publié', 'auriez publié', 'auraient publié', 'eusse publié', 'eusses publié', 'eût publié', 'eussions publié', 'eussiez publié', 'eussent publié', '', 'publie !', '', 'publions !', 'publiez !', '', '', 'aie publié !', '', 'ayons publié !', 'ayez publié !', '');

        RAISE NOTICE 'Added verb: publier (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: publier (already exists)';
    END IF;
END $$;

-- Adding verb: ranger
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'ranger') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('ranger', 'rangé', 'rangant', 'avoir', 'se ranger', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'range', 'ranges', 'range', 'rangons', 'rangez', 'rangent', 'rangais', 'rangais', 'rangait', 'rangions', 'rangiez', 'rangaient', 'rangai', 'rangas', 'ranga', 'rangâmes', 'rangâtes', 'rangèrent', 'rangerai', 'rangeras', 'rangera', 'rangerons', 'rangerez', 'rangeront', 'ai rangé', 'as rangé', 'a rangé', 'avons rangé', 'avez rangé', 'ont rangé', 'avais rangé', 'avais rangé', 'avait rangé', 'avions rangé', 'aviez rangé', 'avaient rangé', 'eus rangé', 'eus rangé', 'eut rangé', 'eûmes rangé', 'eûtes rangé', 'eurent rangé', 'aurai rangé', 'auras rangé', 'aura rangé', 'aurons rangé', 'aurez rangé', 'auront rangé', 'range', 'ranges', 'range', 'rangions', 'rangiez', 'rangent', 'rangasse', 'rangasses', 'rangât', 'rangassions', 'rangassiez', 'rangassent', 'aie rangé', 'aies rangé', 'ait rangé', 'ayons rangé', 'ayez rangé', 'aient rangé', 'eusse rangé', 'eusses rangé', 'eût rangé', 'eussions rangé', 'eussiez rangé', 'eussent rangé', 'rangerais', 'rangerais', 'rangerait', 'rangerions', 'rangeriez', 'rangeraient', 'aurais rangé', 'aurais rangé', 'aurait rangé', 'aurions rangé', 'auriez rangé', 'auraient rangé', 'eusse rangé', 'eusses rangé', 'eût rangé', 'eussions rangé', 'eussiez rangé', 'eussent rangé', '', 'range !', '', 'rangons !', 'rangez !', '', '', 'aie rangé !', '', 'ayons rangé !', 'ayez rangé !', '');

        RAISE NOTICE 'Added verb: ranger (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: ranger (already exists)';
    END IF;
END $$;

-- Adding verb: régner
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'régner') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('régner', 'régné', 'régnant', 'avoir', 'se régner', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'régne', 'régnes', 'régne', 'régnons', 'régnez', 'régnent', 'régnais', 'régnais', 'régnait', 'régnions', 'régniez', 'régnaient', 'régnai', 'régnas', 'régna', 'régnâmes', 'régnâtes', 'régnèrent', 'régnerai', 'régneras', 'régnera', 'régnerons', 'régnerez', 'régneront', 'ai régné', 'as régné', 'a régné', 'avons régné', 'avez régné', 'ont régné', 'avais régné', 'avais régné', 'avait régné', 'avions régné', 'aviez régné', 'avaient régné', 'eus régné', 'eus régné', 'eut régné', 'eûmes régné', 'eûtes régné', 'eurent régné', 'aurai régné', 'auras régné', 'aura régné', 'aurons régné', 'aurez régné', 'auront régné', 'régne', 'régnes', 'régne', 'régnions', 'régniez', 'régnent', 'régnasse', 'régnasses', 'régnât', 'régnassions', 'régnassiez', 'régnassent', 'aie régné', 'aies régné', 'ait régné', 'ayons régné', 'ayez régné', 'aient régné', 'eusse régné', 'eusses régné', 'eût régné', 'eussions régné', 'eussiez régné', 'eussent régné', 'régnerais', 'régnerais', 'régnerait', 'régnerions', 'régneriez', 'régneraient', 'aurais régné', 'aurais régné', 'aurait régné', 'aurions régné', 'auriez régné', 'auraient régné', 'eusse régné', 'eusses régné', 'eût régné', 'eussions régné', 'eussiez régné', 'eussent régné', '', 'régne !', '', 'régnons !', 'régnez !', '', '', 'aie régné !', '', 'ayons régné !', 'ayez régné !', '');

        RAISE NOTICE 'Added verb: régner (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: régner (already exists)';
    END IF;
END $$;

-- Adding verb: réviser
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'réviser') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('réviser', 'révisé', 'révisant', 'avoir', 'se réviser', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'révise', 'révises', 'révise', 'révisons', 'révisez', 'révisent', 'révisais', 'révisais', 'révisait', 'révisions', 'révisiez', 'révisaient', 'révisai', 'révisas', 'révisa', 'révisâmes', 'révisâtes', 'révisèrent', 'réviserai', 'réviseras', 'révisera', 'réviserons', 'réviserez', 'réviseront', 'ai révisé', 'as révisé', 'a révisé', 'avons révisé', 'avez révisé', 'ont révisé', 'avais révisé', 'avais révisé', 'avait révisé', 'avions révisé', 'aviez révisé', 'avaient révisé', 'eus révisé', 'eus révisé', 'eut révisé', 'eûmes révisé', 'eûtes révisé', 'eurent révisé', 'aurai révisé', 'auras révisé', 'aura révisé', 'aurons révisé', 'aurez révisé', 'auront révisé', 'révise', 'révises', 'révise', 'révisions', 'révisiez', 'révisent', 'révisasse', 'révisasses', 'révisât', 'révisassions', 'révisassiez', 'révisassent', 'aie révisé', 'aies révisé', 'ait révisé', 'ayons révisé', 'ayez révisé', 'aient révisé', 'eusse révisé', 'eusses révisé', 'eût révisé', 'eussions révisé', 'eussiez révisé', 'eussent révisé', 'réviserais', 'réviserais', 'réviserait', 'réviserions', 'réviseriez', 'réviseraient', 'aurais révisé', 'aurais révisé', 'aurait révisé', 'aurions révisé', 'auriez révisé', 'auraient révisé', 'eusse révisé', 'eusses révisé', 'eût révisé', 'eussions révisé', 'eussiez révisé', 'eussent révisé', '', 'révise !', '', 'révisons !', 'révisez !', '', '', 'aie révisé !', '', 'ayons révisé !', 'ayez révisé !', '');

        RAISE NOTICE 'Added verb: réviser (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: réviser (already exists)';
    END IF;
END $$;

-- Adding verb: soigner
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'soigner') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('soigner', 'soigné', 'soignant', 'avoir', 'se soigner', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'soigne', 'soignes', 'soigne', 'soignons', 'soignez', 'soignent', 'soignais', 'soignais', 'soignait', 'soignions', 'soigniez', 'soignaient', 'soignai', 'soignas', 'soigna', 'soignâmes', 'soignâtes', 'soignèrent', 'soignerai', 'soigneras', 'soignera', 'soignerons', 'soignerez', 'soigneront', 'ai soigné', 'as soigné', 'a soigné', 'avons soigné', 'avez soigné', 'ont soigné', 'avais soigné', 'avais soigné', 'avait soigné', 'avions soigné', 'aviez soigné', 'avaient soigné', 'eus soigné', 'eus soigné', 'eut soigné', 'eûmes soigné', 'eûtes soigné', 'eurent soigné', 'aurai soigné', 'auras soigné', 'aura soigné', 'aurons soigné', 'aurez soigné', 'auront soigné', 'soigne', 'soignes', 'soigne', 'soignions', 'soigniez', 'soignent', 'soignasse', 'soignasses', 'soignât', 'soignassions', 'soignassiez', 'soignassent', 'aie soigné', 'aies soigné', 'ait soigné', 'ayons soigné', 'ayez soigné', 'aient soigné', 'eusse soigné', 'eusses soigné', 'eût soigné', 'eussions soigné', 'eussiez soigné', 'eussent soigné', 'soignerais', 'soignerais', 'soignerait', 'soignerions', 'soigneriez', 'soigneraient', 'aurais soigné', 'aurais soigné', 'aurait soigné', 'aurions soigné', 'auriez soigné', 'auraient soigné', 'eusse soigné', 'eusses soigné', 'eût soigné', 'eussions soigné', 'eussiez soigné', 'eussent soigné', '', 'soigne !', '', 'soignons !', 'soignez !', '', '', 'aie soigné !', '', 'ayons soigné !', 'ayez soigné !', '');

        RAISE NOTICE 'Added verb: soigner (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: soigner (already exists)';
    END IF;
END $$;

-- Adding verb: visiter
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'visiter') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('visiter', 'visité', 'visitant', 'avoir', 'se visiter', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'visite', 'visites', 'visite', 'visitons', 'visitez', 'visitent', 'visitais', 'visitais', 'visitait', 'visitions', 'visitiez', 'visitaient', 'visitai', 'visitas', 'visita', 'visitâmes', 'visitâtes', 'visitèrent', 'visiterai', 'visiteras', 'visitera', 'visiterons', 'visiterez', 'visiteront', 'ai visité', 'as visité', 'a visité', 'avons visité', 'avez visité', 'ont visité', 'avais visité', 'avais visité', 'avait visité', 'avions visité', 'aviez visité', 'avaient visité', 'eus visité', 'eus visité', 'eut visité', 'eûmes visité', 'eûtes visité', 'eurent visité', 'aurai visité', 'auras visité', 'aura visité', 'aurons visité', 'aurez visité', 'auront visité', 'visite', 'visites', 'visite', 'visitions', 'visitiez', 'visitent', 'visitasse', 'visitasses', 'visitât', 'visitassions', 'visitassiez', 'visitassent', 'aie visité', 'aies visité', 'ait visité', 'ayons visité', 'ayez visité', 'aient visité', 'eusse visité', 'eusses visité', 'eût visité', 'eussions visité', 'eussiez visité', 'eussent visité', 'visiterais', 'visiterais', 'visiterait', 'visiterions', 'visiteriez', 'visiteraient', 'aurais visité', 'aurais visité', 'aurait visité', 'aurions visité', 'auriez visité', 'auraient visité', 'eusse visité', 'eusses visité', 'eût visité', 'eussions visité', 'eussiez visité', 'eussent visité', '', 'visite !', '', 'visitons !', 'visitez !', '', '', 'aie visité !', '', 'ayons visité !', 'ayez visité !', '');

        RAISE NOTICE 'Added verb: visiter (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: visiter (already exists)';
    END IF;
END $$;

-- Adding verb: fleurir
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'fleurir') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('fleurir', 'fleuri', 'fleurissant', 'avoir', 'se fleurir', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'fleuris', 'fleuris', 'fleurit', 'fleurissons', 'fleurissez', 'fleurissent', 'fleurissais', 'fleurissais', 'fleurissait', 'fleurissions', 'fleurissiez', 'fleurissaient', 'fleuris', 'fleuris', 'fleurit', 'fleurîmes', 'fleurîtes', 'fleurirent', 'fleurirai', 'fleuriras', 'fleurira', 'fleurirons', 'fleurirez', 'fleuriront', 'ai fleuri', 'as fleuri', 'a fleuri', 'avons fleuri', 'avez fleuri', 'ont fleuri', 'avais fleuri', 'avais fleuri', 'avait fleuri', 'avions fleuri', 'aviez fleuri', 'avaient fleuri', 'eus fleuri', 'eus fleuri', 'eut fleuri', 'eûmes fleuri', 'eûtes fleuri', 'eurent fleuri', 'aurai fleuri', 'auras fleuri', 'aura fleuri', 'aurons fleuri', 'aurez fleuri', 'auront fleuri', 'fleurisse', 'fleurisses', 'fleurisse', 'fleurissions', 'fleurissiez', 'fleurissent', 'fleurisse', 'fleurisses', 'fleurît', 'fleurissions', 'fleurissiez', 'fleurissent', 'aie fleuri', 'aies fleuri', 'ait fleuri', 'ayons fleuri', 'ayez fleuri', 'aient fleuri', 'eusse fleuri', 'eusses fleuri', 'eût fleuri', 'eussions fleuri', 'eussiez fleuri', 'eussent fleuri', 'fleurirais', 'fleurirais', 'fleurirait', 'fleuririons', 'fleuririez', 'fleuriraient', 'aurais fleuri', 'aurais fleuri', 'aurait fleuri', 'aurions fleuri', 'auriez fleuri', 'auraient fleuri', 'eusse fleuri', 'eusses fleuri', 'eût fleuri', 'eussions fleuri', 'eussiez fleuri', 'eussent fleuri', '', 'fleuris !', '', 'fleurissons !', 'fleurissez !', '', '', 'aie fleuri !', '', 'ayons fleuri !', 'ayez fleuri !', '');

        RAISE NOTICE 'Added verb: fleurir (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: fleurir (already exists)';
    END IF;
END $$;

-- Adding verb: mûrir
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'mûrir') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('mûrir', 'mûri', 'mûrissant', 'avoir', 'se mûrir', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'mûris', 'mûris', 'mûrit', 'mûrissons', 'mûrissez', 'mûrissent', 'mûrissais', 'mûrissais', 'mûrissait', 'mûrissions', 'mûrissiez', 'mûrissaient', 'mûris', 'mûris', 'mûrit', 'mûrîmes', 'mûrîtes', 'mûrirent', 'mûrirai', 'mûriras', 'mûrira', 'mûrirons', 'mûrirez', 'mûriront', 'ai mûri', 'as mûri', 'a mûri', 'avons mûri', 'avez mûri', 'ont mûri', 'avais mûri', 'avais mûri', 'avait mûri', 'avions mûri', 'aviez mûri', 'avaient mûri', 'eus mûri', 'eus mûri', 'eut mûri', 'eûmes mûri', 'eûtes mûri', 'eurent mûri', 'aurai mûri', 'auras mûri', 'aura mûri', 'aurons mûri', 'aurez mûri', 'auront mûri', 'mûrisse', 'mûrisses', 'mûrisse', 'mûrissions', 'mûrissiez', 'mûrissent', 'mûrisse', 'mûrisses', 'mûrît', 'mûrissions', 'mûrissiez', 'mûrissent', 'aie mûri', 'aies mûri', 'ait mûri', 'ayons mûri', 'ayez mûri', 'aient mûri', 'eusse mûri', 'eusses mûri', 'eût mûri', 'eussions mûri', 'eussiez mûri', 'eussent mûri', 'mûrirais', 'mûrirais', 'mûrirait', 'mûririons', 'mûririez', 'mûriraient', 'aurais mûri', 'aurais mûri', 'aurait mûri', 'aurions mûri', 'auriez mûri', 'auraient mûri', 'eusse mûri', 'eusses mûri', 'eût mûri', 'eussions mûri', 'eussiez mûri', 'eussent mûri', '', 'mûris !', '', 'mûrissons !', 'mûrissez !', '', '', 'aie mûri !', '', 'ayons mûri !', 'ayez mûri !', '');

        RAISE NOTICE 'Added verb: mûrir (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: mûrir (already exists)';
    END IF;
END $$;

-- Adding verb: vieillir
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'vieillir') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('vieillir', 'vieilli', 'vieillissant', 'avoir', 'se vieillir', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'vieillis', 'vieillis', 'vieillit', 'vieillissons', 'vieillissez', 'vieillissent', 'vieillissais', 'vieillissais', 'vieillissait', 'vieillissions', 'vieillissiez', 'vieillissaient', 'vieillis', 'vieillis', 'vieillit', 'vieillîmes', 'vieillîtes', 'vieillirent', 'vieillirai', 'vieilliras', 'vieillira', 'vieillirons', 'vieillirez', 'vieilliront', 'ai vieilli', 'as vieilli', 'a vieilli', 'avons vieilli', 'avez vieilli', 'ont vieilli', 'avais vieilli', 'avais vieilli', 'avait vieilli', 'avions vieilli', 'aviez vieilli', 'avaient vieilli', 'eus vieilli', 'eus vieilli', 'eut vieilli', 'eûmes vieilli', 'eûtes vieilli', 'eurent vieilli', 'aurai vieilli', 'auras vieilli', 'aura vieilli', 'aurons vieilli', 'aurez vieilli', 'auront vieilli', 'vieillisse', 'vieillisses', 'vieillisse', 'vieillissions', 'vieillissiez', 'vieillissent', 'vieillisse', 'vieillisses', 'vieillît', 'vieillissions', 'vieillissiez', 'vieillissent', 'aie vieilli', 'aies vieilli', 'ait vieilli', 'ayons vieilli', 'ayez vieilli', 'aient vieilli', 'eusse vieilli', 'eusses vieilli', 'eût vieilli', 'eussions vieilli', 'eussiez vieilli', 'eussent vieilli', 'vieillirais', 'vieillirais', 'vieillirait', 'vieillirions', 'vieilliriez', 'vieilliraient', 'aurais vieilli', 'aurais vieilli', 'aurait vieilli', 'aurions vieilli', 'auriez vieilli', 'auraient vieilli', 'eusse vieilli', 'eusses vieilli', 'eût vieilli', 'eussions vieilli', 'eussiez vieilli', 'eussent vieilli', '', 'vieillis !', '', 'vieillissons !', 'vieillissez !', '', '', 'aie vieilli !', '', 'ayons vieilli !', 'ayez vieilli !', '');

        RAISE NOTICE 'Added verb: vieillir (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: vieillir (already exists)';
    END IF;
END $$;

-- Adding verb: combattre
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'combattre') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('combattre', 'combattu', 'combattant', 'avoir', 'se combattre', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'combatts', 'combatts', 'combatt', 'combattons', 'combattez', 'combattent', 'combattais', 'combattais', 'combattait', 'combattions', 'combattiez', 'combattaient', 'combattis', 'combattis', 'combattit', 'combattîmes', 'combattîtes', 'combattirent', 'combattrai', 'combattras', 'combattra', 'combattrons', 'combattrez', 'combattront', 'ai combattu', 'as combattu', 'a combattu', 'avons combattu', 'avez combattu', 'ont combattu', 'avais combattu', 'avais combattu', 'avait combattu', 'avions combattu', 'aviez combattu', 'avaient combattu', 'eus combattu', 'eus combattu', 'eut combattu', 'eûmes combattu', 'eûtes combattu', 'eurent combattu', 'aurai combattu', 'auras combattu', 'aura combattu', 'aurons combattu', 'aurez combattu', 'auront combattu', 'combatte', 'combattes', 'combatte', 'combattions', 'combattiez', 'combattent', 'combattisse', 'combattisses', 'combattît', 'combattissions', 'combattissiez', 'combattissent', 'aie combattu', 'aies combattu', 'ait combattu', 'ayons combattu', 'ayez combattu', 'aient combattu', 'eusse combattu', 'eusses combattu', 'eût combattu', 'eussions combattu', 'eussiez combattu', 'eussent combattu', 'combattrais', 'combattrais', 'combattrait', 'combattrions', 'combattriez', 'combattraient', 'aurais combattu', 'aurais combattu', 'aurait combattu', 'aurions combattu', 'auriez combattu', 'auraient combattu', 'eusse combattu', 'eusses combattu', 'eût combattu', 'eussions combattu', 'eussiez combattu', 'eussent combattu', '', 'combatts !', '', 'combattons !', 'combattez !', '', '', 'aie combattu !', '', 'ayons combattu !', 'ayez combattu !', '');

        RAISE NOTICE 'Added verb: combattre (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: combattre (already exists)';
    END IF;
END $$;

-- Adding verb: instruire
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'instruire') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('instruire', 'instruiu', 'instruiant', 'avoir', 'se instruire', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'instruis', 'instruis', 'instrui', 'instruions', 'instruiez', 'instruient', 'instruiais', 'instruiais', 'instruiait', 'instruiions', 'instruiiez', 'instruiaient', 'instruiis', 'instruiis', 'instruiit', 'instruiîmes', 'instruiîtes', 'instruiirent', 'instruirai', 'instruiras', 'instruira', 'instruirons', 'instruirez', 'instruiront', 'ai instruiu', 'as instruiu', 'a instruiu', 'avons instruiu', 'avez instruiu', 'ont instruiu', 'avais instruiu', 'avais instruiu', 'avait instruiu', 'avions instruiu', 'aviez instruiu', 'avaient instruiu', 'eus instruiu', 'eus instruiu', 'eut instruiu', 'eûmes instruiu', 'eûtes instruiu', 'eurent instruiu', 'aurai instruiu', 'auras instruiu', 'aura instruiu', 'aurons instruiu', 'aurez instruiu', 'auront instruiu', 'instruie', 'instruies', 'instruie', 'instruiions', 'instruiiez', 'instruient', 'instruiisse', 'instruiisses', 'instruiît', 'instruiissions', 'instruiissiez', 'instruiissent', 'aie instruiu', 'aies instruiu', 'ait instruiu', 'ayons instruiu', 'ayez instruiu', 'aient instruiu', 'eusse instruiu', 'eusses instruiu', 'eût instruiu', 'eussions instruiu', 'eussiez instruiu', 'eussent instruiu', 'instruirais', 'instruirais', 'instruirait', 'instruirions', 'instruiriez', 'instruiraient', 'aurais instruiu', 'aurais instruiu', 'aurait instruiu', 'aurions instruiu', 'auriez instruiu', 'auraient instruiu', 'eusse instruiu', 'eusses instruiu', 'eût instruiu', 'eussions instruiu', 'eussiez instruiu', 'eussent instruiu', '', 'instruis !', '', 'instruions !', 'instruiez !', '', '', 'aie instruiu !', '', 'ayons instruiu !', 'ayez instruiu !', '');

        RAISE NOTICE 'Added verb: instruire (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: instruire (already exists)';
    END IF;
END $$;

-- Adding verb: introduire
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'introduire') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('introduire', 'introduiu', 'introduiant', 'avoir', 'se introduire', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'introduis', 'introduis', 'introdui', 'introduions', 'introduiez', 'introduient', 'introduiais', 'introduiais', 'introduiait', 'introduiions', 'introduiiez', 'introduiaient', 'introduiis', 'introduiis', 'introduiit', 'introduiîmes', 'introduiîtes', 'introduiirent', 'introduirai', 'introduiras', 'introduira', 'introduirons', 'introduirez', 'introduiront', 'ai introduiu', 'as introduiu', 'a introduiu', 'avons introduiu', 'avez introduiu', 'ont introduiu', 'avais introduiu', 'avais introduiu', 'avait introduiu', 'avions introduiu', 'aviez introduiu', 'avaient introduiu', 'eus introduiu', 'eus introduiu', 'eut introduiu', 'eûmes introduiu', 'eûtes introduiu', 'eurent introduiu', 'aurai introduiu', 'auras introduiu', 'aura introduiu', 'aurons introduiu', 'aurez introduiu', 'auront introduiu', 'introduie', 'introduies', 'introduie', 'introduiions', 'introduiiez', 'introduient', 'introduiisse', 'introduiisses', 'introduiît', 'introduiissions', 'introduiissiez', 'introduiissent', 'aie introduiu', 'aies introduiu', 'ait introduiu', 'ayons introduiu', 'ayez introduiu', 'aient introduiu', 'eusse introduiu', 'eusses introduiu', 'eût introduiu', 'eussions introduiu', 'eussiez introduiu', 'eussent introduiu', 'introduirais', 'introduirais', 'introduirait', 'introduirions', 'introduiriez', 'introduiraient', 'aurais introduiu', 'aurais introduiu', 'aurait introduiu', 'aurions introduiu', 'auriez introduiu', 'auraient introduiu', 'eusse introduiu', 'eusses introduiu', 'eût introduiu', 'eussions introduiu', 'eussiez introduiu', 'eussent introduiu', '', 'introduis !', '', 'introduions !', 'introduiez !', '', '', 'aie introduiu !', '', 'ayons introduiu !', 'ayez introduiu !', '');

        RAISE NOTICE 'Added verb: introduire (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: introduire (already exists)';
    END IF;
END $$;

-- Adding verb: reproduire
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'reproduire') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('reproduire', 'reproduiu', 'reproduiant', 'avoir', 'se reproduire', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'reproduis', 'reproduis', 'reprodui', 'reproduions', 'reproduiez', 'reproduient', 'reproduiais', 'reproduiais', 'reproduiait', 'reproduiions', 'reproduiiez', 'reproduiaient', 'reproduiis', 'reproduiis', 'reproduiit', 'reproduiîmes', 'reproduiîtes', 'reproduiirent', 'reproduirai', 'reproduiras', 'reproduira', 'reproduirons', 'reproduirez', 'reproduiront', 'ai reproduiu', 'as reproduiu', 'a reproduiu', 'avons reproduiu', 'avez reproduiu', 'ont reproduiu', 'avais reproduiu', 'avais reproduiu', 'avait reproduiu', 'avions reproduiu', 'aviez reproduiu', 'avaient reproduiu', 'eus reproduiu', 'eus reproduiu', 'eut reproduiu', 'eûmes reproduiu', 'eûtes reproduiu', 'eurent reproduiu', 'aurai reproduiu', 'auras reproduiu', 'aura reproduiu', 'aurons reproduiu', 'aurez reproduiu', 'auront reproduiu', 'reproduie', 'reproduies', 'reproduie', 'reproduiions', 'reproduiiez', 'reproduient', 'reproduiisse', 'reproduiisses', 'reproduiît', 'reproduiissions', 'reproduiissiez', 'reproduiissent', 'aie reproduiu', 'aies reproduiu', 'ait reproduiu', 'ayons reproduiu', 'ayez reproduiu', 'aient reproduiu', 'eusse reproduiu', 'eusses reproduiu', 'eût reproduiu', 'eussions reproduiu', 'eussiez reproduiu', 'eussent reproduiu', 'reproduirais', 'reproduirais', 'reproduirait', 'reproduirions', 'reproduiriez', 'reproduiraient', 'aurais reproduiu', 'aurais reproduiu', 'aurait reproduiu', 'aurions reproduiu', 'auriez reproduiu', 'auraient reproduiu', 'eusse reproduiu', 'eusses reproduiu', 'eût reproduiu', 'eussions reproduiu', 'eussiez reproduiu', 'eussent reproduiu', '', 'reproduis !', '', 'reproduions !', 'reproduiez !', '', '', 'aie reproduiu !', '', 'ayons reproduiu !', 'ayez reproduiu !', '');

        RAISE NOTICE 'Added verb: reproduire (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: reproduire (already exists)';
    END IF;
END $$;

-- Adding verb: séduire
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'séduire') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('séduire', 'séduiu', 'séduiant', 'avoir', 'se séduire', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6, conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6, imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6, imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6)
        VALUES (v_id, 'séduis', 'séduis', 'sédui', 'séduions', 'séduiez', 'séduient', 'séduiais', 'séduiais', 'séduiait', 'séduiions', 'séduiiez', 'séduiaient', 'séduiis', 'séduiis', 'séduiit', 'séduiîmes', 'séduiîtes', 'séduiirent', 'séduirai', 'séduiras', 'séduira', 'séduirons', 'séduirez', 'séduiront', 'ai séduiu', 'as séduiu', 'a séduiu', 'avons séduiu', 'avez séduiu', 'ont séduiu', 'avais séduiu', 'avais séduiu', 'avait séduiu', 'avions séduiu', 'aviez séduiu', 'avaient séduiu', 'eus séduiu', 'eus séduiu', 'eut séduiu', 'eûmes séduiu', 'eûtes séduiu', 'eurent séduiu', 'aurai séduiu', 'auras séduiu', 'aura séduiu', 'aurons séduiu', 'aurez séduiu', 'auront séduiu', 'séduie', 'séduies', 'séduie', 'séduiions', 'séduiiez', 'séduient', 'séduiisse', 'séduiisses', 'séduiît', 'séduiissions', 'séduiissiez', 'séduiissent', 'aie séduiu', 'aies séduiu', 'ait séduiu', 'ayons séduiu', 'ayez séduiu', 'aient séduiu', 'eusse séduiu', 'eusses séduiu', 'eût séduiu', 'eussions séduiu', 'eussiez séduiu', 'eussent séduiu', 'séduirais', 'séduirais', 'séduirait', 'séduirions', 'séduiriez', 'séduiraient', 'aurais séduiu', 'aurais séduiu', 'aurait séduiu', 'aurions séduiu', 'auriez séduiu', 'auraient séduiu', 'eusse séduiu', 'eusses séduiu', 'eût séduiu', 'eussions séduiu', 'eussiez séduiu', 'eussent séduiu', '', 'séduis !', '', 'séduions !', 'séduiez !', '', '', 'aie séduiu !', '', 'ayons séduiu !', 'ayez séduiu !', '');

        RAISE NOTICE 'Added verb: séduire (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: séduire (already exists)';
    END IF;
END $$;

-- Adding verb: être
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'être') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('être', 'été', 'étant', 'avoir', '', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6)
        VALUES (v_id, 'suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'étais', 'étais', 'était', 'étions', 'étiez', 'étaient', 'fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent', 'serai', 'seras', 'sera', 'serons', 'serez', 'seront', 'ai été', 'as été', 'a été', 'avons été', 'avez été', 'ont été', 'avais été', 'avais été', 'avait été', 'avions été', 'aviez été', 'avaient été', 'eus été', 'eus été', 'eut été', 'eûmes été', 'eûtes été', 'eurent été', 'aurai été', 'auras été', 'aura été', 'aurons été', 'aurez été', 'auront été', 'sois', 'sois', 'soit', 'soyons', 'soyez', 'soient', 'fusse', 'fusses', 'fût', 'fussions', 'fussiez', 'fussent', 'aie été', 'aies été', 'ait été', 'ayons été', 'ayez été', 'aient été', 'eusse été', 'eusses été', 'eût été', 'eussions été', 'eussiez été', 'eussent été', 'serais', 'serais', 'serait', 'serions', 'seriez', 'seraient', 'aurais été', 'aurais été', 'aurait été', 'aurions été', 'auriez été', 'auraient été');

        RAISE NOTICE 'Added verb: être (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: être (already exists)';
    END IF;
END $$;

-- Adding verb: neiger
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Check if verb exists
    IF NOT EXISTS (SELECT 1 FROM verbs WHERE infinitive = 'neiger') THEN
        -- Insert verb
        INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronomininal_form, difficulty)
        VALUES ('neiger', 'neigé', 'neigeant', 'avoir', '', 1)
        RETURNING id INTO v_id;

        -- Insert conjugations
        INSERT INTO verb_conjugations (verb_id, present_1, present_2, present_3, present_4, present_5, present_6, imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6, passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6, futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6, passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6, plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6, passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6, futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6, subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6, subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6, subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6, subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6, conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6, conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6)
        VALUES (v_id, '', '', 'neige', '', '', '', '', '', 'neigeait', '', '', '', '', '', 'neigea', '', '', '', '', '', 'neigera', '', '', '', '', '', 'a neigé', '', '', '', '', '', 'avait neigé', '', '', '', '', '', 'eut neigé', '', '', '', '', '', 'aura neigé', '', '', '', '', '', 'neige', '', '', '', '', '', 'neigeât', '', '', '', '', '', 'ait neigé', '', '', '', '', '', 'eût neigé', '', '', '', '', '', 'neigerait', '', '', '', '', '', 'aurait neigé', '', '', '');

        RAISE NOTICE 'Added verb: neiger (ID: %)', v_id;
    ELSE
        RAISE NOTICE 'Skipped verb: neiger (already exists)';
    END IF;
END $$;
