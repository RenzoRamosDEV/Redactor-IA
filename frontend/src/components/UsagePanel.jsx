/**
 * Consumo de intentos: las dos barras de límite y cuándo se recuperan.
 *
 * @module components/UsagePanel
 */

import { useTranslation } from 'react-i18next';
import { toMinutes, toSeconds, useCountdown } from '../hooks/useCountdown';

/**
 * @param {Object} props
 * @param {Object} props.usage - Consumo actual
 * @param {number} props.usage.windowUsed - Intentos gastados en el tramo
 * @param {number} props.usage.windowLimit - Intentos por tramo
 * @param {number} props.usage.dailyUsed - Intentos gastados hoy
 * @param {number} props.usage.dailyLimit - Intentos por día
 * @param {Object} props.limits - Estado de límites del backend
 */
export default function UsagePanel({ usage, limits }) {
  const { t } = useTranslation();
  const { windowUsed, windowLimit, dailyUsed, dailyLimit } = usage;
  const windowRemainingMs = useCountdown(limits.windowResetAt);

  return (
    <div className="rail-usage">
      <div className="rail-section-label">{t('usage.title')}</div>

      <UsageMeter label={t('usage.window')} used={windowUsed} limit={windowLimit} />
      <UsageMeter label={t('usage.daily')} used={dailyUsed} limit={dailyLimit} />

      <p className="usage-note">
        {usageNote({ t, limits, windowRemainingMs, windowLimit, dailyLimit })}
      </p>
    </div>
  );
}

/**
 * Barra de consumo de un límite.
 *
 * @param {Object} props
 * @param {string} props.label - Nombre del límite
 * @param {number} props.used - Intentos consumidos
 * @param {number} props.limit - Intentos totales
 */
function UsageMeter({ label, used, limit }) {
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const maxed = used >= limit;

  return (
    <div className={`usage-meter${maxed ? ' usage-meter--maxed' : ''}`}>
      <div className="usage-meter-head">
        <span>{label}</span>
        <span className="mono">
          {used}/{limit}
        </span>
      </div>
      <div className="usage-meter-track">
        <div className="usage-meter-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/**
 * Frase que explica cuándo se recuperan los intentos.
 *
 * @param {Object} params
 * @param {Function} params.t - Función de traducción
 * @param {Object} params.limits - Estado de límites del backend
 * @param {number|null} params.windowRemainingMs - Tiempo hasta reiniciar el tramo
 * @param {number} params.windowLimit - Intentos por tramo
 * @param {number} params.dailyLimit - Intentos por día
 * @returns {string}
 */
function usageNote({ t, limits, windowRemainingMs, windowLimit, dailyLimit }) {
  if (limits.blockedBy === 'daily' || limits.remainingDaily <= 0) {
    return t('usage.dailyExhausted', { count: dailyLimit });
  }

  if (windowRemainingMs && limits.remainingWindow < windowLimit) {
    return windowRemainingMs >= 60000
      ? t('usage.renewsInMin', { count: toMinutes(windowRemainingMs) })
      : t('usage.renewsInSec', { count: toSeconds(windowRemainingMs) });
  }

  return t('usage.allAvailable', { count: limits.remainingWindow });
}
