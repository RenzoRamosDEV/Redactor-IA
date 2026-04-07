const { validateInput } = require('../utils/inputValidator');
const { validateOutput } = require('../utils/outputValidator');
const { buildPrompt } = require('../utils/promptBuilder');
const { reformulateText } = require('../services/gemini.service');

async function rewrite(req, res, next) {
  try {
    const { text, tone, intensity, keepLength, extraInstruction } = req.body;

    const validationError = validateInput({ text, tone, intensity, keepLength, extraInstruction });
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

    return res.json({
      result,
      meta: {
        toneApplied: tone,
        processingTimeMs,
      },
      limits: req.rateLimitState || null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { rewrite };
