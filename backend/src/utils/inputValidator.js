/**
 * Validador de entrada para el endpoint de reformulación
 * 
 * Valida:
 * - Tipos de datos correctos
 * - Longitud del texto (5-500 caracteres)
 * - Tono permitido
 * - Intensidad en rango válido (0-100)
 * - Instrucción extra (max 200 caracteres)
 * - Filtrado de código/markup (solo lenguaje natural permitido)
 * 
 * @module utils/inputValidator
 */

const ALLOWED_TONES = ['rewrite', 'formal', 'fun', 'casual', 'professional', 'direct', 'persuasive', 'creative'];
const MIN_LENGTH = 5;
const MAX_LENGTH = 500;

// Patrones para detectar código/markup en el texto (solo lenguaje natural permitido)
const TECH_PATTERNS = [
  /<[a-z][\s\S]*>/i,         // HTML tags
  /function\s*\(/,            // JS functions
  /SELECT\s+.+\s+FROM/i,     // SQL queries
  /import\s+.+\s+from/,      // JS/Python imports
  /\{[\s\S]*\}/,              // JSON/objects (broad match)
  /```/,                      // Markdown code blocks
  /console\.(log|error)/,    // Console calls
  /#include/,                 // C/C++ includes
  /def\s+\w+\s*\(/,          // Python function definitions
];

/**
 * Valida los parámetros de entrada para reformulación de texto.
 * Retorna null si todo es válido, o un string con el error si hay problemas.
 * 
 * @param {Object} params - Parámetros de entrada
 * @param {string} params.text - Texto a reformular
 * @param {string} params.tone - Tono deseado (debe estar en ALLOWED_TONES)
 * @param {number} params.intensity - Intensidad del tono (0-100)
 * @param {boolean} params.keepLength - Si mantener longitud similar
 * @param {string} [params.extraInstruction] - Instrucción adicional (opcional, max 200 chars)
 * 
 * @returns {string|null} Mensaje de error o null si es válido
 * 
 * @example
 * const error = validateInput({ text: 'Hola', tone: 'formal', intensity: 50, keepLength: true });
 * if (error) {
 *   return res.status(400).json({ error });
 * }
 */
function validateInput({ text, tone, intensity, keepLength, extraInstruction, needsTitle }) {
  // Validar que el texto exista y sea string
  if (!text || typeof text !== 'string') {
    return 'El campo texto es obligatorio.';
  }
  
  // Validar longitud mínima
  if (text.trim().length < MIN_LENGTH) {
    return `El texto debe tener al menos ${MIN_LENGTH} caracteres.`;
  }
  
  // Validar longitud máxima
  if (text.length > MAX_LENGTH) {
    return `El texto no puede superar ${MAX_LENGTH} caracteres.`;
  }
  
  // Validar que el tono sea uno de los permitidos
  if (!ALLOWED_TONES.includes(tone)) {
    return 'El tono seleccionado no es válido.';
  }
  
  // Validar intensidad (0-100)
  if (typeof intensity !== 'number' || intensity < 0 || intensity > 100) {
    return 'La intensidad debe estar entre 0 y 100.';
  }
  
  // Validar keepLength sea booleano
  if (typeof keepLength !== 'boolean') {
    return 'El campo keepLength debe ser booleano.';
  }
  
  // Validar instrucción extra (opcional)
  if (extraInstruction && typeof extraInstruction !== 'string') {
    return 'La instrucción extra no es válida.';
  }
  if (extraInstruction && extraInstruction.length > 200) {
    return 'La instrucción extra no puede superar 200 caracteres.';
  }

  // Validar petición de título (opcional)
  if (needsTitle !== undefined && typeof needsTitle !== 'boolean') {
    return 'El campo needsTitle debe ser booleano.';
  }
  
  // Filtrar código/markup - solo lenguaje natural permitido
  for (const pattern of TECH_PATTERNS) {
    if (pattern.test(text)) {
      return 'Solo se permite reformular texto redactado en lenguaje natural.';
    }
  }
  
  return null; // Todo válido
}

module.exports = { validateInput };
