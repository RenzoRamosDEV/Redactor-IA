/**
 * Tonos disponibles para reformular el texto.
 *
 * Solo se guardan los identificadores: las etiquetas visibles viven en
 * `locales/*.json` bajo `tones.option.*` (lista del raíl) y `tones.short.*`
 * (línea de metadatos y historial).
 *
 * @module constants/tones
 */

/** @type {string[]} Identificadores en el orden en que se muestran */
export const TONE_IDS = [
  'rewrite',
  'formal',
  'fun',
  'casual',
  'professional',
  'direct',
  'persuasive',
  'creative',
];

/** @constant {number} Máximo de caracteres del texto original por intento */
export const MAX_CHARS = 500;

/** @constant {string} Tono preseleccionado */
export const DEFAULT_TONE = 'rewrite';

/** @constant {number} Intensidad inicial (0-100) */
export const DEFAULT_INTENSITY = 60;

/** @constant {boolean} Si por defecto se limita el crecimiento del texto */
export const DEFAULT_KEEP_LENGTH = true;

/** @constant {number} Máximo de caracteres de la instrucción extra */
export const MAX_EXTRA_INSTRUCTION_CHARS = 200;
