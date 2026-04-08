/**
 * Configuración de i18next para internacionalización.
 * Soporta español (es) e inglés (en) con detección automática de idioma del navegador
 * y persistencia en localStorage.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar archivos de traducción
import es from './locales/es.json';
import en from './locales/en.json';

/**
 * Configuración de i18next
 * - Idiomas: español (es), inglés (en)
 * - Fallback: español
 * - Detección automática del idioma del navegador
 * - Persistencia en localStorage con clave 'i18nextLng'
 */
i18n
  .use(LanguageDetector) // Detecta idioma del navegador y persiste en localStorage
  .use(initReactI18next) // Integración con React
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: 'es', // Idioma por defecto si no se detecta ninguno
    lng: localStorage.getItem('i18nextLng') || 'es', // Leer idioma guardado o usar español
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },
    detection: {
      order: ['localStorage', 'navigator'], // Priorizar localStorage sobre navegador
      caches: ['localStorage'], // Guardar idioma en localStorage
    },
  });

export default i18n;
