/**
 * Barra superior fija: marca, acceso al historial y selector de idioma.
 *
 * El consumo de intentos no se muestra aquí: vive en el bloque "Uso" del raíl
 * derecho, junto a los ajustes que lo gastan.
 *
 * @module components/AppHeader
 */

import { useTranslation } from 'react-i18next';

/**
 * @param {Object} props
 * @param {boolean} props.drawerOpen - Si el cajón del historial está abierto
 * @param {Function} props.onToggleDrawer - Abre/cierra el cajón del historial
 */
export default function AppHeader({ drawerOpen, onToggleDrawer }) {
  const { t, i18n } = useTranslation();

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-dot" aria-hidden="true" />
        <span className="brand-name">{t('brand.name')}</span>
        <span className="brand-badge">{t('brand.badge')}</span>
        <div className="header-rule" aria-hidden="true" />
        <button
          type="button"
          className="drawer-toggle"
          onClick={onToggleDrawer}
          aria-expanded={drawerOpen}
        >
          {t('history.title')}
        </button>
      </div>

      <div className="header-right">
        <div
          className="lang-switch"
          role="group"
          aria-label={t('header.languageLabel')}
        >
          {['es', 'en'].map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => i18n.changeLanguage(lang)}
              aria-pressed={i18n.resolvedLanguage === lang}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
