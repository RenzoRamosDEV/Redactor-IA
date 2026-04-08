/**
 * Controller para el endpoint de reformulación de texto
 * 
 * Flujo de trabajo:
 * 1. Validar entrada (texto, tono, intensidad, etc.)
 * 2. Construir prompt cerrado para la IA
 * 3. Llamar al servicio de Groq para generar texto
 * 4. Validar salida (sin código, formato correcto)
 * 5. Responder con resultado, metadata y estado de límites
 * 
 * El middleware rateLimiter ya validó límites y adjuntó req.rateLimitState.
 * 
 * @module controllers/rewrite
 */

const { validateInput } = require('../utils/inputValidator');
const { validateOutput } = require('../utils/outputValidator');
const { buildPrompt } = require('../utils/promptBuilder');
const { reformulateText } = require('../services/groq.service');

/**
 * POST /api/rewrite
 * Reformula un texto según el tono e intensidad especificados.
 * 
 * @param {Object} req - Express request
 * @param {Object} req.body - Datos de la reformulación
 * @param {string} req.body.text - Texto a reformular (max 500 chars)
 * @param {string} req.body.tone - Tono deseado (rewrite, formal, fun, etc.)
 * @param {number} req.body.intensity - Intensidad del tono (0-100)
 * @param {boolean} req.body.keepLength - Si mantener longitud similar
 * @param {string} [req.body.extraInstruction] - Instrucción adicional (max 200 chars)
 * @param {Object} req.rateLimitState - Estado de límites adjuntado por rateLimiter middleware
 * @param {Object} res - Express response
 * @param {Function} next - Express next (para error handling)
 * 
 * @returns {Object} JSON con { result, meta, limits }
 * 
 * @example
 * POST /api/rewrite
 * {
 *   "text": "Hola, cómo estás?",
 *   "tone": "formal",
 *   "intensity": 70,
 *   "keepLength": true,
 *   "extraInstruction": "Mantén un tono cercano"
 * }
 * 
 * Response:
 * {
 *   "result": "Estimado/a, ¿cómo se encuentra?",
 *   "meta": { "toneApplied": "formal", "processingTimeMs": 1234 },
 *   "limits": { "remainingWindow": 7, "remainingDaily": 39, ... }
 * }
 */
async function rewrite(req, res, next) {
  try {
    // Extraer parámetros del body
    const { text, tone, intensity, keepLength, extraInstruction } = req.body;

    // Validar entrada (longitud, tipos, valores permitidos)
    const validationError = validateInput({ text, tone, intensity, keepLength, extraInstruction });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Construir prompt cerrado para evitar inyección de instrucciones
    const prompt = buildPrompt({ text, tone, intensity, keepLength, extraInstruction });
    const startTime = Date.now();

    // Llamar a Groq API para generar texto
    const result = await reformulateText(prompt);
    const processingTimeMs = Date.now() - startTime;

    // Validar salida (sin código, sin formato markdown, etc.)
    if (!validateOutput(result)) {
      return res.status(422).json({
        error: 'La respuesta generada no es válida. Por favor, inténtalo con un texto diferente.',
      });
    }

    // Responder con resultado, metadata y estado de límites
    return res.json({
      result,
      meta: {
        toneApplied: tone,
        processingTimeMs,
      },
      limits: req.rateLimitState || null,
    });
  } catch (err) {
    next(err); // Manejo centralizado de errores en errorHandler middleware
  }
}

module.exports = { rewrite };
