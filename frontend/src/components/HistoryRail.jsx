/**
 * Raíl izquierdo: historial de textos reformulados, agrupado por día.
 *
 * @module components/HistoryRail
 */

import { useTranslation } from 'react-i18next';
import { formatTime, groupByDay } from '../utils/documents';

/**
 * @param {Object} props
 * @param {Object[]} props.documents - Documentos guardados
 * @param {string|null} props.activeId - Documento abierto ahora mismo
 * @param {Function} props.onSelect - Recibe el id del documento elegido
 * @param {Function} props.onNew - Empieza un documento en blanco
 */
export default function HistoryRail({ documents, activeId, onSelect, onNew }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'es';

  const groups = groupByDay(documents, {
    language,
    todayLabel: t('history.today'),
    yesterdayLabel: t('history.yesterday'),
  });

  return (
    <aside className="rail rail--left om-scroll" aria-label={t('history.title')}>
      <div className="history-head">
        <span className="eyebrow">{t('history.title')}</span>
        <button type="button" className="history-new" onClick={onNew}>
          {t('history.new')}
        </button>
      </div>

      {groups.length === 0 && <p className="history-empty">{t('history.empty')}</p>}

      {groups.map(group => (
        <div className="history-group" key={group.key}>
          <div className="history-group-label">{group.label}</div>

          {group.items.map(doc => {
            const last = doc.versions[doc.versions.length - 1];

            return (
              <button
                type="button"
                key={doc.id}
                className="history-item"
                aria-current={doc.id === activeId}
                onClick={() => onSelect(doc.id)}
              >
                <span className="history-item-meta">
                  <span className="history-item-tone">
                    {t(`tones.short.${last.tone}`)}
                  </span>
                  <span className="history-item-time">
                    {formatTime(doc.updatedAt, language)}
                  </span>
                </span>
                <span className="history-item-preview">{doc.title}</span>
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
