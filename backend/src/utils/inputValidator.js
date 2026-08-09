/**
 * Validación de la entrada del endpoint de reformulación.
 *
 * Es la primera barrera: todo lo que pase de aquí acaba dentro de un prompt
 * que se envía a la IA.
 *
 * @module utils/inputValidator
 */

const ALLOWED_TONES = ['rewrite', 'formal', 'fun', 'casual', 'professional', 'direct', 'persuasive', 'creative'];
const MIN_LENGTH = 5;
const MAX_LENGTH = 500;

// Solo se reformula lenguaje natural; esto descarta código y markup
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
 * @param {Object} params - text, tone, intensity, keepLength y, opcionales,
 *   extraInstruction y needsTitle
 * @returns {string|null} Mensaje de error para el usuario, o null si es válido
 */
function validateInput({ text, tone, intensity, keepLength, extraInstruction, needsTitle }) {
  if (!text || typeof text !== 'string') {
    return 'El campo texto es obligatorio.';
  }
  
  if (text.trim().length < MIN_LENGTH) {
    return `El texto debe tener al menos ${MIN_LENGTH} caracteres.`;
  }
  
  if (text.length > MAX_LENGTH) {
    return `El texto no puede superar ${MAX_LENGTH} caracteres.`;
  }
  
  if (!ALLOWED_TONES.includes(tone)) {
    return 'El tono seleccionado no es válido.';
  }
  
  if (typeof intensity !== 'number' || intensity < 0 || intensity > 100) {
    return 'La intensidad debe estar entre 0 y 100.';
  }
  
  if (typeof keepLength !== 'boolean') {
    return 'El campo keepLength debe ser booleano.';
  }
  
  if (extraInstruction && typeof extraInstruction !== 'string') {
    return 'La instrucción extra no es válida.';
  }
  if (extraInstruction && extraInstruction.length > 200) {
    return 'La instrucción extra no puede superar 200 caracteres.';
  }

  if (needsTitle !== undefined && typeof needsTitle !== 'boolean') {
    return 'El campo needsTitle debe ser booleano.';
  }
  
  for (const pattern of TECH_PATTERNS) {
    if (pattern.test(text)) {
      return 'Solo se permite reformular texto redactado en lenguaje natural.';
    }
  }
  
  return null;
}

module.exports = { validateInput };
