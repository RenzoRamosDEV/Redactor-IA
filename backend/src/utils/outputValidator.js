/**
 * Validador de salida de la IA
 * 
 * Verifica que el texto generado por la IA sea válido:
 * - Existe y es string
 * - Tiene longitud mínima (5 caracteres)
 * - No contiene código o markup (solo lenguaje natural)
 * 
 * Esto previene que la IA devuelva código, JSON, HTML, o formato markdown
 * cuando se le pide reformular texto natural.
 * 
 * @module utils/outputValidator
 */

// Patrones para detectar código/markup en la salida de la IA
const TECH_OUTPUT_PATTERNS = [
  /<[a-z][\s\S]*>/i,         // HTML tags
  /function\s*\(/,            // JS functions
  /SELECT\s+.+\s+FROM/i,     // SQL queries
  /import\s+.+\s+from/,      // JS/Python imports
  /```/,                      // Markdown code blocks
  /console\.(log|error)/,    // Console calls
];

/**
 * Valida que el texto generado por la IA sea lenguaje natural válido.
 * 
 * @param {string} text - Texto generado por la IA
 * @returns {boolean} true si es válido, false si contiene código o formato no deseado
 * 
 * @example
 * const result = await reformulateText(prompt);
 * if (!validateOutput(result)) {
 *   return res.status(422).json({ error: 'Respuesta inválida' });
 * }
 */
function validateOutput(text) {
  // Validar que existe y es string
  if (!text || typeof text !== 'string') return false;
  
  // Validar longitud mínima
  if (text.trim().length < 5) return false;
  
  // Rechazar si contiene patrones de código/markup
  for (const pattern of TECH_OUTPUT_PATTERNS) {
    if (pattern.test(text)) return false;
  }
  
  return true; // Válido
}

module.exports = { validateOutput };
