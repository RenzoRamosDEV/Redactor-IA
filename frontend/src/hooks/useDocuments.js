/**
 * Historial de documentos persistido en localStorage.
 *
 * Un documento entra en el historial cuando tiene al menos una versión
 * generada; los borradores sin resultado no se guardan. Se conservan los
 * {@link MAX_DOCUMENTS} más recientes.
 *
 * @module hooks/useDocuments
 */

import { useCallback, useEffect, useState } from 'react';

/** @constant {string} Clave de localStorage */
const STORAGE_KEY = 'redactor-ia:documents:v1';

/** @constant {number} Documentos que se conservan como máximo */
const MAX_DOCUMENTS = 40;

/**
 * Lee el historial guardado, descartando cualquier cosa con forma inesperada
 * (versión anterior del formato, JSON corrupto, modo privado sin storage).
 *
 * @returns {Object[]}
 */
function readStoredDocuments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      doc =>
        doc &&
        typeof doc.id === 'string' &&
        typeof doc.updatedAt === 'number' &&
        Array.isArray(doc.versions) &&
        doc.versions.length > 0
    );
  } catch {
    return [];
  }
}

/**
 * Gestiona la lista de documentos guardados.
 *
 * @returns {{
 *   documents: Object[],
 *   saveDocument: (doc: Object) => void,
 *   deleteDocument: (id: string) => void
 * }}
 */
export function useDocuments() {
  const [documents, setDocuments] = useState(readStoredDocuments);

  // Persistir en cada cambio; si el navegador no deja escribir, se sigue
  // trabajando solo en memoria.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch {
      /* almacenamiento no disponible (modo privado o cuota agotada) */
    }
  }, [documents]);

  /**
   * Inserta o actualiza un documento y lo deja al principio de la lista.
   */
  const saveDocument = useCallback(doc => {
    setDocuments(prev =>
      [doc, ...prev.filter(d => d.id !== doc.id)]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_DOCUMENTS)
    );
  }, []);

  const deleteDocument = useCallback(id => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  return { documents, saveDocument, deleteDocument };
}
