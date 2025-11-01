-- Fix column name mismatch: copy data from present1 to present_1 etc.

UPDATE verb_conjugations SET
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
  
  conditionnel_present_1 = conditionnel_present1,
  conditionnel_present_2 = conditionnel_present2,
  conditionnel_present_3 = conditionnel_present3,
  conditionnel_present_4 = conditionnel_present4,
  conditionnel_present_5 = conditionnel_present5,
  conditionnel_present_6 = conditionnel_present6,
  
  imperatif_1 = imperatif1,
  imperatif_2 = imperatif2,
  imperatif_3 = imperatif3;

-- Verify the fix worked
SELECT 
  'Total rows' as check_type,
  COUNT(*) as count
FROM verb_conjugations
UNION ALL
SELECT 
  'Rows with present_1' as check_type,
  COUNT(*) as count
FROM verb_conjugations
WHERE present_1 IS NOT NULL AND present_1 != '';
