/**
 * Bloque del resultado: selector de versiones, pestañas resultado/comparar
 * y acciones sobre el texto generado.
 *
 * @module components/ResultSection
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiffView from './DiffView';

/**
 * @param {Object} props
 * @param {Object[]} props.versions - Versiones generadas para este documento
 * @param {number} props.activeIndex - Índice de la versión mostrada
 * @param {Function} props.onSelectVersion - Recibe el índice elegido
 * @param {'result'|'compare'} props.view - Pestaña activa
 * @param {Function} props.onViewChange - Cambia de pestaña
 * @param {boolean} props.isLoading - Si hay una reformulación en curso
 * @param {string} props.error - Mensaje de error del backend, si lo hay
 * @param {string} props.blockedNotice - Aviso de límite agotado, si aplica
 * @param {Function} props.onUseAsSource - Pasa el resultado al texto original
 * @param {Function} props.onGenerate - Genera otra variante
 * @param {boolean} props.canGenerate - Si se puede generar ahora mismo
 * @param {Function} props.formatMeta - Construye la línea de metadatos de una versión
 */
export default function ResultSection({
  versions,
  activeIndex,
  onSelectVersion,
  view,
  onViewChange,
  isLoading,
  error,
  blockedNotice,
  onUseAsSource,
  onGenerate,
  canGenerate,
  formatMeta,
}) {
  const { t } = useTranslation();

  // Se guarda qué versión se copió, no un booleano: así el aviso desaparece
  // solo con cambiar de versión, sin necesidad de resetearlo a mano.
  const [copiedIndex, setCopiedIndex] = useState(null);
  const copied = copiedIndex === activeIndex;

  const version = versions[activeIndex] || null;
  const hasResult = Boolean(version);

  useEffect(() => {
    if (copiedIndex === null) return;
    const timeoutId = setTimeout(() => setCopiedIndex(null), 2000);
    return () => clearTimeout(timeoutId);
  }, [copiedIndex]);

  const handleCopy = async () => {
    if (!version) return;
    try {
      await navigator.clipboard.writeText(version.text);
      setCopiedIndex(activeIndex);
    } catch {
      /* el navegador puede denegar el portapapeles sin gesto de usuario */
    }
  };

  return (
    <section className="section">
      <div className="section-head">
        <div className="result-head-left">
          <span className="eyebrow">{t('result.label')}</span>

          {versions.length > 0 && (
            <div className="version-list" role="group" aria-label={t('result.versionsLabel')}>
              {versions.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  className="version-pill"
                  aria-pressed={index === activeIndex}
                  onClick={() => onSelectVersion(index)}
                >
                  {t('result.version', { n: index + 1 })}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className="tab"
            aria-selected={view === 'result'}
            onClick={() => onViewChange('result')}
          >
            {t('result.tabResult')}
          </button>
          <button
            type="button"
            role="tab"
            className="tab"
            aria-selected={view === 'compare'}
            onClick={() => onViewChange('compare')}
            disabled={!hasResult}
          >
            {t('result.tabCompare')}
          </button>
        </div>
      </div>

      {isLoading && <LoadingState label={t('result.thinking')} />}

      {!isLoading && error && <p className="notice">{error}</p>}

      {!isLoading && !error && blockedNotice && (
        <p className="notice">{blockedNotice}</p>
      )}

      {!isLoading && !error && !blockedNotice && !hasResult && (
        <p className="result-empty">{t('result.empty')}</p>
      )}

      {!isLoading && hasResult && view === 'result' && (
        <div>
          <p className="result-text">{version.text}</p>

          <div className="result-foot">
            <button type="button" className="pill pill--action" onClick={handleCopy}>
              {copied ? t('result.copied') : t('result.copy')}
            </button>
            <button
              type="button"
              className="pill pill--action"
              onClick={() => onUseAsSource(version.text)}
            >
              {t('result.useAsSource')}
            </button>
            <button
              type="button"
              className="pill pill--action"
              onClick={onGenerate}
              disabled={!canGenerate}
            >
              {t('result.anotherVariant')}
            </button>
            <span className="meta-line">{formatMeta(version)}</span>
          </div>
        </div>
      )}

      {!isLoading && hasResult && view === 'compare' && (
        <DiffView
          before={version.original}
          after={version.text}
          toneLabel={t(`tones.short.${version.tone}`)}
          metaLine={formatMeta(version)}
        />
      )}
    </section>
  );
}

/**
 * Estado de espera: rótulo con puntos animados y líneas fantasma.
 *
 * @param {Object} props
 * @param {string} props.label - Texto del rótulo
 */
function LoadingState({ label }) {
  return (
    <div>
      <div className="thinking">
        {label}
        <span className="thinking-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
      <div className="skeleton-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
