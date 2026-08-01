import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar/translation.json';
import en from './en/translation.json';

export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_DIRECTION: Record<SupportedLanguage, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

void i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: 'ar',
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export default i18n;
