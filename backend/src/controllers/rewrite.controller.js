/**
 * Controller de la reformulación de texto.
 *
 * El middleware rateLimiter ya ha validado los límites y ha dejado el estado
 * en req.rateLimitState.
 *
 * @module controllers/rewrite
 */

const { validateInput } = require('../utils/inputValidator');
const { validateOutput } = require('../utils/outputValidator');
const { buildPrompt, buildTitlePrompt } = require('../utils/promptBuilder');
const { cleanTitle } = require('../utils/titleFormatter');
const { reformulateText, generateTitle } = require('../services/ai.service');

/**
 * Propone un nombre para el documento a partir del texto original.
 *
 * Es accesorio: si falla, la reformulación ya está hecha y no tiene sentido
 * devolver un error por no haber podido titularla. El cliente se queda con su
 * nombre derivado del texto.
 *
 * @param {string} text - Texto original del usuario
 * @returns {Promise<string|null>} Título limpio, o null si no se pudo generar
 */
async function resolveTitle(text) {
  try {
    return cleanTitle(await generateTitle(buildTitlePrompt(text)));
  } catch (err) {
    console.error('[rewrite] no se pudo generar el título:', err.message);
    return null;
  }
}

/**
 * POST /api/rewrite
 *
 * @param {Object} req - Express request; el cuerpo lleva text, tone,
 *   intensity, keepLength, extraInstruction y needsTitle
 * @param {Object} res - Express response
 * @param {Function} next - Express next, para que errorHandler traduzca el fallo
 * @returns {Object} JSON con { result, meta, limits }
 */
async function rewrite(req, res, next) {
  try {
    const { text, tone, intensity, keepLength, extraInstruction, needsTitle } = req.body;

    const validationError = validateInput({ text, tone, intensity, keepLength, extraInstruction, needsTitle });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const prompt = buildPrompt({ text, tone, intensity, keepLength, extraInstruction });
    const startTime = Date.now();

    const result = await reformulateText(prompt);
    const processingTimeMs = Date.now() - startTime;

    if (!validateOutput(result)) {
      return res.status(422).json({
        error: 'La respuesta generada no es válida. Por favor, inténtalo con un texto diferente.',
      });
    }

    // El nombre del documento se pide una sola vez, en su primera
    // reformulación; después el cliente ya lo tiene guardado.
    const title = needsTitle ? await resolveTitle(text) : null;

    return res.json({
      result,
      meta: {
        toneApplied: tone,
        processingTimeMs,
        title,
      },
      limits: req.rateLimitState || null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { rewrite };
