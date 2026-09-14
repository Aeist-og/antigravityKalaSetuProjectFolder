import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLanguage, loadSavedLanguage, setAppLanguage } from '../i18n';
import enJson from '../i18n/locales/en.json';

export type TranslationSchema = typeof enJson;

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  t: (key: string, options?: Record<string, unknown>) => string;
  strings: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'hi',
  setLanguage: async () => {},
  t: (key: string) => key,
  strings: enJson,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<AppLanguage>((i18n.language as AppLanguage) || 'hi');

  useEffect(() => {
    loadSavedLanguage().then(saved => {
      setCurrentLang(saved);
    });
  }, []);

  const changeLanguage = async (lang: AppLanguage) => {
    await setAppLanguage(lang);
    setCurrentLang(lang);
  };

  // Provide active strings bundle for backward compatibility with nested object access
  const activeStrings = (i18n.getResourceBundle(currentLang, 'translation') || enJson) as TranslationSchema;

  return (
    <LanguageContext.Provider
      value={{
        language: currentLang,
        setLanguage: changeLanguage,
        t,
        strings: activeStrings,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
