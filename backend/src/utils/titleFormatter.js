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

/**
 * Palabras que no pueden cerrar un título. Al toparse con el límite de seis
 * palabras, el modelo corta donde le pilla y deja cosas como "Retraso en el
 * envío del resumen de".
 *
 * @constant {Set<string>}
 */
const TRAILING_WORDS = new Set([
  // español
  'de', 'del', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'con', 'para', 'por', 'en', 'a', 'al', 'y', 'e', 'o', 'u', 'que',
  'sobre', 'tras', 'ante', 'desde', 'hasta', 'sin', 'su', 'sus',
  // inglés
  'of', 'the', 'an', 'to', 'for', 'with', 'and', 'or', 'in', 'on', 'at', 'that',
]);

// Un título nunca es código ni lleva saltos de estructura
const INVALID_PATTERNS = [/```/, /<[a-z][\s\S]*>/i, /\{[\s\S]*\}/];

/**
 * Restos del razonamiento del modelo que a veces se cuelan en lugar del
 * título. Ocurre de verdad: se ha visto devolver " 5 words) - Good." mientras
 * comprobaba por su cuenta cuántas palabras llevaba.
 *
 * Un paréntesis o corchete que cierra sin haber abierto delata un fragmento
 * cortado, que es la señal más fiable de que eso no es un título.
 */
const LEAKED_REASONING = [
  /\b\d+\s*(words?|palabras?)\b/i,
  /\b(good|bad|correct|ok)\.?$/i,
  /^[)\]}]/,
];

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
  if (LEAKED_REASONING.some(pattern => pattern.test(title))) return null;
  if (hasUnbalancedBrackets(title)) return null;

  // El modelo se ha inventado que no puede titular
  if (/^sin t[íi]tulo$/i.test(title) || /^untitled$/i.test(title)) return null;

  if (title.length > MAX_LENGTH) {
    const cut = title.slice(0, MAX_LENGTH);
    const lastSpace = cut.lastIndexOf(' ');
    title = `${(lastSpace > 30 ? cut.slice(0, lastSpace) : cut).trim()}…`;
  }

  return dropTrailingWords(title);
}

/**
 * Quita las palabras vacías con las que el título se queda colgando.
 *
 * Solo actúa mientras quede un título con sentido: más vale "Paseo al centro
 * con" que quedarse sin nada.
 *
 * @param {string} title
 * @returns {string}
 *
 * @example
 * dropTrailingWords('Retraso en el envío del resumen de'); // 'Retraso en el envío del resumen'
 */
function dropTrailingWords(title) {
  let words = title.split(' ');

  while (words.length > 2 && TRAILING_WORDS.has(words[words.length - 1].toLowerCase())) {
    const candidato = words.slice(0, -1);
    if (candidato.join(' ').length < MIN_LENGTH) break;
    words = candidato;
  }

  return words.join(' ');
}

/**
 * ¿Hay algún paréntesis o corchete que cierre sin haberse abierto?
 *
 * Es la firma de un texto cortado por la mitad, no la de un título.
 *
 * @param {string} title
 * @returns {boolean}
 */
function hasUnbalancedBrackets(title) {
  const pares = { ')': '(', ']': '[' };
  const abiertos = [];

  for (const caracter of title) {
    if (caracter === '(' || caracter === '[') abiertos.push(caracter);
    else if (pares[caracter] && abiertos.pop() !== pares[caracter]) return true;
  }

  return abiertos.length > 0;
}

module.exports = { cleanTitle };
