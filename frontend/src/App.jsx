import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home';

/**
 * Raíz de la aplicación: mantiene el atributo `lang` del documento
 * sincronizado con el idioma activo y monta la pantalla principal.
 */
export default function App() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'es';

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <Home />;
}
