/**
 * Configuración de tonos disponibles para reformulación de texto
 * 
 * Define los diferentes estilos que puede aplicar la IA al texto.
 */

/**
 * @typedef {Object} Tone
 * @property {string} id - Identificador único del tono
 * @property {string} label - Etiqueta visible para el usuario
 */

/** @type {Tone[]} Lista de tonos disponibles */
export const TONES = [
  { id: 'rewrite', label: 'Mejorar redacción' },
  { id: 'formal', label: 'Más formal' },
  { id: 'fun', label: 'Más divertido' },
  { id: 'casual', label: 'Más casual' },
  { id: 'professional', label: 'Más profesional' },
  { id: 'direct', label: 'Más directo' },
  { id: 'persuasive', label: 'Más persuasivo' },
  { id: 'creative', label: 'Más creativo' },
];

/**
 * Mapeo de IDs de tono a sus etiquetas
 * Útil para mostrar el tono seleccionado sin buscar en el array
 */
export const TONE_LABELS = {
  rewrite: 'Mejorar redacción',
  formal: 'Formal',
  fun: 'Divertido',
  casual: 'Casual',
  professional: 'Profesional',
  direct: 'Directo',
  persuasive: 'Persuasivo',
  creative: 'Creativo',
};

/** @constant {number} Máximo de caracteres permitidos por intento */
export const MAX_CHARS = 500;

/** @constant {string} Tono por defecto */
export const DEFAULT_TONE = 'rewrite';

/** @constant {number} Valor por defecto de intensidad (0-100) */
export const DEFAULT_INTENSITY = 60;

/** @constant {boolean} Valor por defecto para mantener longitud del texto */
export const DEFAULT_KEEP_LENGTH = true;

/** @constant {string} Valor por defecto para instrucción extra */
export const DEFAULT_EXTRA_INSTRUCTION = '';

/** @constant {number} Máximo de caracteres para instrucción extra */
export const MAX_EXTRA_INSTRUCTION_CHARS = 200;
