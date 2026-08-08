/**
 * Bloque del texto original: área de escritura, contador y acciones.
 *
 * @module components/SourceSection
 */

import { useTranslation } from 'react-i18next';
import { MAX_CHARS } from '../constants';

/**
 * @param {Object} props
 * @param {string} props.value - Texto original
 * @param {Function} props.onChange - Recibe el texto actualizado
 * @param {Function} props.onGenerate - Lanza la reformulación
 * @param {Function} props.onClear - Vacía el texto y el resultado
 * @param {boolean} props.isLoading - Si hay una petición en curso
 * @param {boolean} props.canGenerate - Si se cumplen las condiciones para generar
 */
export default function SourceSection({
  value,
  onChange,
  onGenerate,
  onClear,
  isLoading,
  canGenerate,
}) {
  const { t } = useTranslation();
  const overflow = value.length - MAX_CHARS;

  /** ⌘/Ctrl + Enter reformula sin salir del área de texto. */
  const handleKeyDown = event => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      if (canGenerate) onGenerate();
    }
  };

  return (
    <section className="section">
      <div className="section-head">
        <span className="eyebrow">{t('source.label')}</span>
        <span className={`counter${overflow > 0 ? ' counter--over' : ''}`}>
          {value.length} / {MAX_CHARS}
        </span>
      </div>

      <textarea
        className="source-input"
        value={value}
        onChange={event => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('source.placeholder')}
        spellCheck="false"
        aria-label={t('source.label')}
      />

      <div className="actions">
        <button
          type="button"
          className="btn-primary"
          onClick={onGenerate}
          disabled={!canGenerate}
        >
          {isLoading ? t('source.generating') : t('source.generate')}
        </button>

        <button
          type="button"
          className="btn-quiet"
          onClick={onClear}
          disabled={isLoading || !value}
        >
          {t('source.clear')}
        </button>

        <span className="kbd-hint">
          {overflow > 0 ? t('source.tooLong', { count: overflow }) : '⌘ + ⏎'}
        </span>
      </div>
    </section>
  );
}
