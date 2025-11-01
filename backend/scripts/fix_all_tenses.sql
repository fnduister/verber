-- Fix ALL tense columns: copy data from columns without underscore to columns with underscore

UPDATE verb_conjugations SET
  -- Simple tenses (already done but included for completeness)
  present_1 = present1,
  present_2 = present2,
  present_3 = present3,
  present_4 = present4,
  present_5 = present5,
  present_6 = present6,
  
  imparfait_1 = imparfait1,
  imparfait_2 = imparfait2,
  imparfait_3 = imparfait3,
  imparfait_4 = imparfait4,
  imparfait_5 = imparfait5,
  imparfait_6 = imparfait6,
  
  passe_simple_1 = passe_simple1,
  passe_simple_2 = passe_simple2,
  passe_simple_3 = passe_simple3,
  passe_simple_4 = passe_simple4,
  passe_simple_5 = passe_simple5,
  passe_simple_6 = passe_simple6,
  
  futur_simple_1 = futur_simple1,
  futur_simple_2 = futur_simple2,
  futur_simple_3 = futur_simple3,
  futur_simple_4 = futur_simple4,
  futur_simple_5 = futur_simple5,
  futur_simple_6 = futur_simple6,
  
  -- Compound tenses (MISSING FROM PREVIOUS SCRIPT!)
  passe_compose_1 = passe_compose1,
  passe_compose_2 = passe_compose2,
  passe_compose_3 = passe_compose3,
  passe_compose_4 = passe_compose4,
  passe_compose_5 = passe_compose5,
  passe_compose_6 = passe_compose6,
  
  plus_que_parfait_1 = plus_que_parfait1,
  plus_que_parfait_2 = plus_que_parfait2,
  plus_que_parfait_3 = plus_que_parfait3,
  plus_que_parfait_4 = plus_que_parfait4,
  plus_que_parfait_5 = plus_que_parfait5,
  plus_que_parfait_6 = plus_que_parfait6,
  
  passe_anterieur_1 = passe_anterieur1,
  passe_anterieur_2 = passe_anterieur2,
  passe_anterieur_3 = passe_anterieur3,
  passe_anterieur_4 = passe_anterieur4,
  passe_anterieur_5 = passe_anterieur5,
  passe_anterieur_6 = passe_anterieur6,
  
  futur_anterieur_1 = futur_anterieur1,
  futur_anterieur_2 = futur_anterieur2,
  futur_anterieur_3 = futur_anterieur3,
  futur_anterieur_4 = futur_anterieur4,
  futur_anterieur_5 = futur_anterieur5,
  futur_anterieur_6 = futur_anterieur6,
  
  -- Subjunctive
  subjonctif_present_1 = subjonctif_present1,
  subjonctif_present_2 = subjonctif_present2,
  subjonctif_present_3 = subjonctif_present3,
  subjonctif_present_4 = subjonctif_present4,
  subjonctif_present_5 = subjonctif_present5,
  subjonctif_present_6 = subjonctif_present6,
  
  subjonctif_imparfait_1 = subjonctif_imparfait1,
  subjonctif_imparfait_2 = subjonctif_imparfait2,
  subjonctif_imparfait_3 = subjonctif_imparfait3,
  subjonctif_imparfait_4 = subjonctif_imparfait4,
  subjonctif_imparfait_5 = subjonctif_imparfait5,
  subjonctif_imparfait_6 = subjonctif_imparfait6,
  
  subjonctif_passe_1 = subjonctif_passe1,
  subjonctif_passe_2 = subjonctif_passe2,
  subjonctif_passe_3 = subjonctif_passe3,
  subjonctif_passe_4 = subjonctif_passe4,
  subjonctif_passe_5 = subjonctif_passe5,
  subjonctif_passe_6 = subjonctif_passe6,
  
  subjonctif_plus_que_parfait_1 = subjonctif_plus_que_parfait1,
  subjonctif_plus_que_parfait_2 = subjonctif_plus_que_parfait2,
  subjonctif_plus_que_parfait_3 = subjonctif_plus_que_parfait3,
  subjonctif_plus_que_parfait_4 = subjonctif_plus_que_parfait4,
  subjonctif_plus_que_parfait_5 = subjonctif_plus_que_parfait5,
  subjonctif_plus_que_parfait_6 = subjonctif_plus_que_parfait6,
  
  -- Conditional
  conditionnel_present_1 = conditionnel_present1,
  conditionnel_present_2 = conditionnel_present2,
  conditionnel_present_3 = conditionnel_present3,
  conditionnel_present_4 = conditionnel_present4,
  conditionnel_present_5 = conditionnel_present5,
  conditionnel_present_6 = conditionnel_present6,
  
  conditionnel_passe_1 = conditionnel_passe1,
  conditionnel_passe_2 = conditionnel_passe2,
  conditionnel_passe_3 = conditionnel_passe3,
  conditionnel_passe_4 = conditionnel_passe4,
  conditionnel_passe_5 = conditionnel_passe5,
  conditionnel_passe_6 = conditionnel_passe6,
  
  conditionnel_passe_ii_1 = conditionnel_passe_ii1,
  conditionnel_passe_ii_2 = conditionnel_passe_ii2,
  conditionnel_passe_ii_3 = conditionnel_passe_ii3,
  conditionnel_passe_ii_4 = conditionnel_passe_ii4,
  conditionnel_passe_ii_5 = conditionnel_passe_ii5,
  conditionnel_passe_ii_6 = conditionnel_passe_ii6,
  
  -- Imperative
  imperatif_1 = imperatif1,
  imperatif_2 = imperatif2,
  imperatif_3 = imperatif3,
  imperatif_4 = imperatif4,
  imperatif_5 = imperatif5,
  imperatif_6 = imperatif6,
  
  imperatif_passe_1 = imperatif_passe1,
  imperatif_passe_2 = imperatif_passe2,
  imperatif_passe_3 = imperatif_passe3,
  imperatif_passe_4 = imperatif_passe4,
  imperatif_passe_5 = imperatif_passe5,
  imperatif_passe_6 = imperatif_passe6;

-- Verify the fix worked
SELECT 
  'Total rows' as stat,
  COUNT(*) as count
FROM verb_conjugations
UNION ALL
SELECT 
  'With present_1' as stat,
  COUNT(*) as count
FROM verb_conjugations
WHERE present_1 IS NOT NULL AND present_1 != ''
UNION ALL
SELECT 
  'With passe_compose_1' as stat,
  COUNT(*) as count
FROM verb_conjugations
WHERE passe_compose_1 IS NOT NULL AND passe_compose_1 != ''
UNION ALL
SELECT 
  'With plus_que_parfait_1' as stat,
  COUNT(*) as count
FROM verb_conjugations
WHERE plus_que_parfait_1 IS NOT NULL AND plus_que_parfait_1 != ''
UNION ALL
SELECT 
  'With conditionnel_passe_1' as stat,
  COUNT(*) as count
FROM verb_conjugations
WHERE conditionnel_passe_1 IS NOT NULL AND conditionnel_passe_1 != '';
