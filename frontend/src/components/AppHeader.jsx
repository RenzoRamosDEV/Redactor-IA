/**
 * Barra superior fija: marca, consumo de intentos y selector de idioma.
 *
 * @module components/AppHeader
 */

import { useTranslation } from 'react-i18next';

/**
 * @param {Object} props
 * @param {Object} props.usage - Consumo actual
 * @param {number} props.usage.windowUsed - Intentos gastados en el tramo
 * @param {number} props.usage.windowLimit - Intentos por tramo
 * @param {number} props.usage.dailyUsed - Intentos gastados hoy
 * @param {number} props.usage.dailyLimit - Intentos por día
 * @param {boolean} props.drawerOpen - Si el cajón del historial está abierto
 * @param {Function} props.onToggleDrawer - Abre/cierra el cajón del historial
 */
export default function AppHeader({ usage, drawerOpen, onToggleDrawer }) {
  const { t, i18n } = useTranslation();
  const { windowUsed, windowLimit, dailyUsed, dailyLimit } = usage;

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
        <UsageChip
          label={t('header.window')}
          used={windowUsed}
          limit={windowLimit}
        />
        <UsageChip
          label={t('header.today')}
          used={dailyUsed}
          limit={dailyLimit}
        />

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

/**
 * Contador "gastados / total" en tipografía monoespaciada.
 *
 * @param {Object} props
 * @param {string} props.label - Nombre del límite
 * @param {number} props.used - Intentos consumidos
 * @param {number} props.limit - Intentos totales
 */
function UsageChip({ label, used, limit }) {
  const maxed = used >= limit;

  return (
    <div className={`usage-chip${maxed ? ' usage-chip--maxed' : ''}`}>
      <span className="usage-chip-label">{label}</span>
      <span className="usage-chip-value">
        {used}
        <span className="usage-chip-total">/{limit}</span>
      </span>
    </div>
  );
}
