import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import hi from './locales/hi.json';

export const LANGUAGE_STORAGE_KEY = '@kalasetu_language';
export type AppLanguage = 'en' | 'hi';

export const resources = {
  en: { translation: en },
  hi: { translation: hi },
} as const;

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'hi', // Default to Hindi for Indian artisan audience, with English toggle
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Async loader to restore saved language preference
export const loadSavedLanguage = async (): Promise<AppLanguage> => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'hi') {
      if (i18n.language !== saved) {
        await i18n.changeLanguage(saved);
      }
      return saved;
    }
  } catch (error) {
    console.warn('[i18n] Failed to load language preference from storage:', error);
  }
  return (i18n.language as AppLanguage) || 'hi';
};

// Persist language selection
export const setAppLanguage = async (lang: AppLanguage): Promise<void> => {
  try {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    console.warn('[i18n] Failed to save language preference:', error);
  }
};

export default i18n;
