/**
 * Vista "Comparar": original y resultado enfrentados, con las palabras
 * eliminadas y añadidas resaltadas.
 *
 * @module components/DiffView
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { diffWords } from '../utils/diffWords';

/**
 * @param {Object} props
 * @param {string} props.before - Texto original de esta versión
 * @param {string} props.after - Texto reformulado
 * @param {string} props.toneLabel - Tono aplicado, para el encabezado derecho
 * @param {string} props.metaLine - Línea de metadatos de la versión
 */
export default function DiffView({ before, after, toneLabel, metaLine }) {
  const { t } = useTranslation();
  const diff = useMemo(() => diffWords(before, after), [before, after]);
  const unchanged = diff.removals === 0 && diff.additions === 0;

  return (
    <div>
      <div className="diff-grid">
        <div className="diff-col diff-col--before">
          <div className="diff-col-label">{t('compare.before')}</div>
          <p className="diff-text diff-text--before">
            {diff.before.map((segment, index) => (
              <Segment key={index} segment={segment} />
            ))}
          </p>
        </div>

        <div className="diff-col">
          <div className="diff-col-label">
            {t('compare.after', { tone: toneLabel })}
          </div>
          <p className="diff-text diff-text--after">
            {diff.after.map((segment, index) => (
              <Segment key={index} segment={segment} />
            ))}
          </p>
        </div>
      </div>

      <div className="diff-legend">
        {unchanged ? (
          <span>{t('compare.identical')}</span>
        ) : (
          <>
            <span className="diff-legend-item">
              <span className="diff-swatch diff-swatch--del" aria-hidden="true" />
              {t('compare.removals', { count: diff.removals })}
            </span>
            <span className="diff-legend-item">
              <span className="diff-swatch diff-swatch--add" aria-hidden="true" />
              {t('compare.additions', { count: diff.additions })}
            </span>
          </>
        )}
        <span className="meta-line">{metaLine}</span>
      </div>
    </div>
  );
}

/**
 * Un tramo de texto del diff, resaltado según su tipo.
 *
 * @param {Object} props
 * @param {{text: string, type: 'equal'|'removed'|'added'}} props.segment
 */
function Segment({ segment }) {
  if (segment.type === 'equal') return segment.text;

  return (
    <span className={segment.type === 'removed' ? 'diff-del' : 'diff-add'}>
      {segment.text}
    </span>
  );
}
