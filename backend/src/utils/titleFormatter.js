/**
 * Limpieza del título que devuelve la IA.
 *
 * Aunque el prompt pide solo el título, los modelos tienden a envolverlo en
 * comillas, anteponer "Título:" o cerrarlo con punto. Esto se muestra tal cual
 * como nombre del documento, así que conviene normalizarlo antes de enviarlo.
 *
 * @module utils/titleFormatter
 */

/** @constant {number} Longitud máxima del título */
const MAX_LENGTH = 70;

/** @constant {number} Longitud mínima para darlo por válido */
const MIN_LENGTH = 3;

// Un título nunca es código ni lleva saltos de estructura
const INVALID_PATTERNS = [/```/, /<[a-z][\s\S]*>/i, /\{[\s\S]*\}/];

/**
 * Normaliza el título propuesto por la IA.
 *
 * @param {string|null} raw - Respuesta cruda del modelo
 * @returns {string|null} Título limpio, o null si no sirve
 *
 * @example
 * cleanTitle('Título: "Retraso del informe trimestral."');
 * // 'Retraso del informe trimestral'
 */
function cleanTitle(raw) {
  if (!raw || typeof raw !== 'string') return null;

  // Solo la primera línea: si el modelo se explaya, el resto sobra
  let title = raw.split('\n')[0].trim();

  title = title.replace(/^(t[íi]tulo|title)\s*:\s*/i, '');
  title = title.replace(/^["'«»“”¿¡]+|["'«»“”.,;:]+$/g, '');
  title = title.replace(/\s+/g, ' ').trim();

  if (title.length < MIN_LENGTH) return null;
  if (INVALID_PATTERNS.some(pattern => pattern.test(title))) return null;

  // El modelo se ha inventado que no puede titular
  if (/^sin t[íi]tulo$/i.test(title) || /^untitled$/i.test(title)) return null;

  if (title.length > MAX_LENGTH) {
    const cut = title.slice(0, MAX_LENGTH);
    const lastSpace = cut.lastIndexOf(' ');
    title = `${(lastSpace > 30 ? cut.slice(0, lastSpace) : cut).trim()}…`;
  }

  return title;
}

module.exports = { cleanTitle };
