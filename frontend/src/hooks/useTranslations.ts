import { useTranslation } from 'react-i18next';

// Custom hook that provides type-safe translation function
export const useTranslations = () => {
  const { t, i18n } = useTranslation();

  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: (lng: string) => i18n.changeLanguage(lng),
  };
};

// Helper function to get tense display name with i18n support
export const getTenseDisplayName = (tenseKey: string, t: (key: string) => string): string => {
  // Try to get the translation from i18n first
  const translationKey = `tenses.${tenseKey}`;
  const translated = t(translationKey);
  
  // If translation exists and is not the same as the key, return it
  if (translated !== translationKey) {
    return translated;
  }
  
  // Fallback to the original TENSE_DISPLAY_NAMES mapping or the key itself
  return tenseKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};