/**
 * Helpers de documentos: nombre derivado del texto y agrupación por día
 * para el historial del raíl izquierdo.
 *
 * @module utils/documents
 */

/** @constant {number} Longitud máxima del título derivado */
const TITLE_MAX = 58;

/**
 * Deriva un nombre legible a partir del texto original.
 *
 * Toma la primera frase; si es demasiado larga, corta por la última palabra
 * que quepa y añade puntos suspensivos. El usuario puede sobrescribirlo con
 * "Renombrar".
 *
 * @param {string} text - Texto original del documento
 * @param {string} fallback - Nombre a usar si el texto está vacío
 * @returns {string}
 *
 * @example
 * deriveTitle('Os escribo para comentaros que el informe no estará listo. Gracias.', 'Sin título');
 * // 'Os escribo para comentaros que el informe no estará…'
 */
export function deriveTitle(text, fallback) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;

  // Primera frase completa, si termina antes del límite
  const sentence = clean.match(/^(.{1,58}?)(?:[.!?…]|$)/);
  let title = sentence ? sentence[1].trim() : clean;

  if (title.length > TITLE_MAX) {
    title = title.slice(0, TITLE_MAX);
  }

  if (title.length < clean.length) {
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 24) title = title.slice(0, lastSpace);
    title = `${title.replace(/[,;:]$/, '')}…`;
  }

  return title;
}

/**
 * Hora local en formato HH:MM.
 *
 * @param {number} timestamp - Timestamp Unix en ms
 * @param {string} language - Código de idioma ('es' | 'en')
 * @returns {string}
 */
export function formatTime(timestamp, language) {
  return new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

/**
 * Días completos de diferencia entre dos timestamps, comparando fechas
 * naturales y no intervalos de 24 h (así "ayer a las 23:50" sigue siendo ayer).
 *
 * @param {number} timestamp - Timestamp Unix en ms
 * @param {number} now - Timestamp de referencia
 * @returns {number}
 */
function daysAgo(timestamp, now) {
  const a = new Date(timestamp);
  const b = new Date(now);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86400000);
}

/**
 * @typedef {Object} DocumentGroup
 * @property {string} key - Clave estable para React
 * @property {string} label - Encabezado del grupo ("Hoy", "Ayer", "12 may")
 * @property {Object[]} items - Documentos del grupo, del más reciente al más antiguo
 */

/**
 * Agrupa documentos por día natural de su última actualización.
 *
 * @param {Object[]} documents - Documentos (se ordenan por `updatedAt` descendente)
 * @param {Object} options
 * @param {string} options.language - Idioma activo, para el formato de fecha
 * @param {string} options.todayLabel - Etiqueta del grupo de hoy
 * @param {string} options.yesterdayLabel - Etiqueta del grupo de ayer
 * @param {number} [options.now] - Timestamp de referencia (por defecto, ahora)
 * @returns {DocumentGroup[]}
 */
export function groupByDay(
  documents,
  { language, todayLabel, yesterdayLabel, now = Date.now() }
) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
  });

  const groups = [];
  const byKey = new Map();

  for (const doc of [...documents].sort((a, b) => b.updatedAt - a.updatedAt)) {
    const distance = daysAgo(doc.updatedAt, now);
    const key = new Date(doc.updatedAt).toDateString();
    const label =
      distance <= 0
        ? todayLabel
        : distance === 1
          ? yesterdayLabel
          : dateFormat.format(new Date(doc.updatedAt));

    let group = byKey.get(key);
    if (!group) {
      group = { key, label, items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.items.push(doc);
  }

  return groups;
}
