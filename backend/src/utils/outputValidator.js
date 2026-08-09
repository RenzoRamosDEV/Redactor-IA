/**
 * Validación de la salida de la IA: evita devolver al usuario código, JSON o
 * markdown cuando lo que se pidió fue reformular texto natural.
 *
 * @module utils/outputValidator
 */

const TECH_OUTPUT_PATTERNS = [
  /<[a-z][\s\S]*>/i,         // HTML tags
  /function\s*\(/,            // JS functions
  /SELECT\s+.+\s+FROM/i,     // SQL queries
  /import\s+.+\s+from/,      // JS/Python imports
  /```/,                      // Markdown code blocks
  /console\.(log|error)/,    // Console calls
];

/**
 * @param {string} text - Texto generado por la IA
 * @returns {boolean} false si trae código o formato que no debería
 */
function validateOutput(text) {
  if (!text || typeof text !== 'string') return false;
  
  if (text.trim().length < 5) return false;
  
  for (const pattern of TECH_OUTPUT_PATTERNS) {
    if (pattern.test(text)) return false;
  }
  
  return true;
}

module.exports = { validateOutput };
