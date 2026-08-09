/**
 * Configuración de i18next: español e inglés, con el idioma elegido
 * persistido en localStorage.
 *
 * @module i18n
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './locales/es.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: 'es',
    lng: localStorage.getItem('i18nextLng') || 'es',
    interpolation: {
      escapeValue: false, // React ya escapa por su cuenta
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
