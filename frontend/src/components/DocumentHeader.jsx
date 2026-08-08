/**
 * Título del documento con renombrado en línea.
 *
 * @module components/DocumentHeader
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * @param {Object} props
 * @param {string} props.title - Título mostrado (derivado del texto o puesto a mano)
 * @param {Function} props.onRename - Recibe el nuevo título confirmado
 */
export default function DocumentHeader({ title, onRename }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const startEditing = () => {
    setDraft(title);
    setEditing(true);
  };

  const commit = () => {
    const clean = draft.trim();
    if (clean && clean !== title) onRename(clean);
    setEditing(false);
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditing(false);
    }
  };

  return (
    <div className="doc-head">
      {editing ? (
        <input
          ref={inputRef}
          className="doc-title-input"
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          aria-label={t('document.renameLabel')}
          maxLength={80}
        />
      ) : (
        <h1 className="doc-title">{title}</h1>
      )}

      <button
        type="button"
        className="pill"
        // Sin esto, el blur del input cerraría la edición antes del click y el
        // propio click volvería a abrirla.
        onMouseDown={editing ? event => event.preventDefault() : undefined}
        onClick={editing ? commit : startEditing}
      >
        {editing ? t('document.renameSave') : t('document.rename')}
      </button>
    </div>
  );
}
