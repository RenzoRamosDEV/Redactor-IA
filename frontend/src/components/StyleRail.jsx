/**
 * Raíl derecho: tono, intensidad, longitud, instrucción extra y consumo.
 *
 * @module components/StyleRail
 */

import { useTranslation } from 'react-i18next';
import { toMinutes, toSeconds, useCountdown } from '../hooks/useCountdown';
import { MAX_EXTRA_INSTRUCTION_CHARS, TONE_IDS } from '../constants';

/**
 * @param {Object} props
 * @param {string} props.tone - Tono seleccionado
 * @param {Function} props.onToneChange - Recibe el id del tono elegido
 * @param {number} props.intensity - Intensidad 0-100
 * @param {Function} props.onIntensityChange - Recibe la nueva intensidad
 * @param {boolean} props.keepLength - Si se limita el crecimiento del texto
 * @param {Function} props.onKeepLengthChange - Recibe el nuevo valor
 * @param {string} props.extraInstruction - Instrucción libre para la IA
 * @param {Function} props.onExtraInstructionChange - Recibe el nuevo texto
 * @param {Object} props.usage - Consumo de intentos
 * @param {Object} props.limits - Estado de límites del backend
 */
export default function StyleRail({
  tone,
  onToneChange,
  intensity,
  onIntensityChange,
  keepLength,
  onKeepLengthChange,
  extraInstruction,
  onExtraInstructionChange,
  usage,
  limits,
}) {
  const { t } = useTranslation();
  const { windowUsed, windowLimit, dailyUsed, dailyLimit } = usage;

  const windowRemainingMs = useCountdown(limits.windowResetAt);

  return (
    <aside className="rail rail--right om-scroll" aria-label={t('style.title')}>
      <div className="rail-section-label">{t('style.title')}</div>

      <div className="tone-list" role="group" aria-label={t('style.title')}>
        {TONE_IDS.map(id => (
          <button
            type="button"
            key={id}
            className="tone-option"
            aria-pressed={tone === id}
            onClick={() => onToneChange(id)}
          >
            {t(`tones.option.${id}`)}
            <span className="tone-check" aria-hidden="true">
              {tone === id ? '✓' : ''}
            </span>
          </button>
        ))}
      </div>

      <div className="field-block">
        <div className="field-row">
          <label className="field-label" htmlFor="intensity">
            {t('style.intensity')}
          </label>
          <span className="field-value">{intensity}</span>
        </div>
        <input
          id="intensity"
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={event => onIntensityChange(Number(event.target.value))}
          style={{ '--range-fill': `${intensity}%` }}
        />
        <div className="range-ends">
          <span>{t('style.soft')}</span>
          <span>{t('style.high')}</span>
        </div>
      </div>

      <div className="switch-row">
        <div>
          <div className="switch-title" id="keep-length-label">
            {t('style.keepLength')}
          </div>
          <div className="switch-desc">{t('style.keepLengthDesc')}</div>
        </div>
        <button
          type="button"
          role="switch"
          className="switch"
          aria-checked={keepLength}
          aria-labelledby="keep-length-label"
          onClick={() => onKeepLengthChange(!keepLength)}
        >
          <span className="switch-knob" />
        </button>
      </div>

      <div className="field-block">
        <label className="field-label" htmlFor="extra-instruction">
          {t('style.extra')}
        </label>
        <textarea
          id="extra-instruction"
          className="extra-input"
          style={{ marginTop: 9 }}
          value={extraInstruction}
          onChange={event => onExtraInstructionChange(event.target.value)}
          placeholder={t('style.extraPlaceholder')}
          maxLength={MAX_EXTRA_INSTRUCTION_CHARS}
        />
      </div>

      <div>
        <div className="rail-section-label">{t('usage.title')}</div>

        <UsageMeter
          label={t('usage.window')}
          used={windowUsed}
          limit={windowLimit}
        />
        <UsageMeter
          label={t('usage.daily')}
          used={dailyUsed}
          limit={dailyLimit}
        />

        <p className="usage-note">
          {usageNote({ t, limits, windowRemainingMs, dailyLimit, windowLimit })}
        </p>
      </div>
    </aside>
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
