/**
 * Servicio de integración con la API de Gemini (Google AI).
 *
 * Se llama a la API REST directamente con fetch en lugar de usar un SDK: las
 * dos peticiones que hace la aplicación son simples y así se controla al
 * detalle la configuración de generación, incluido el nivel de razonamiento,
 * que es justo lo que hay que ajustar aquí (ver THINKING_LEVEL).
 *
 * Requiere variable de entorno:
 * - GEMINI_API_KEY: Clave de API de Google AI Studio
 * - GEMINI_MODEL: Modelo a usar (opcional, por defecto gemini-3.6-flash)
 *
 * @module services/gemini
 */

require('dotenv').config();

/** @constant {string} Endpoint base de la API */
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/** @constant {string} Modelo por defecto: rápido y suficiente para reformular */
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

/**
 * Los modelos Gemini 3 razonan antes de responder y ese razonamiento consume
 * el mismo presupuesto de tokens que la respuesta. Con el nivel por defecto se
 * gastaba casi todo pensando: los títulos llegaban vacíos y las
 * reformulaciones cortadas a media frase.
 *
 * @constant {string}
 */
const THINKING_LEVEL = 'low';

/** @constant {number} Tiempo máximo de espera por respuesta */
const TIMEOUT_MS = 30000;

/**
 * Pide una generación de texto al modelo.
 *
 * @param {string} prompt - Prompt completo
 * @param {Object} options
 * @param {number} options.temperature - Aleatoriedad de la respuesta
 * @param {number} options.maxOutputTokens - Tope de tokens (razonamiento incluido)
 * @returns {Promise<string>} Texto generado, ya recortado
 * @throws {Error} Con `status` puesto, para que errorHandler lo traduzca
 * @private
 */
async function generate(prompt, { temperature, maxOutputTokens }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const err = new Error('Falta la variable de entorno GEMINI_API_KEY.');
    err.status = 500;
    throw err;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens,
          thinkingConfig: { thinkingLevel: THINKING_LEVEL },
        },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = err.name === 'AbortError';
    const wrapped = new Error(
      timedOut
        ? 'La IA ha tardado demasiado en responder.'
        : 'No se ha podido contactar con la IA.'
    );
    wrapped.status = 503;
    throw wrapped;
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(
      data.error?.message || `La IA respondió con un error ${response.status}.`
    );
    err.status = response.status;
    throw err;
  }

  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts || [])
    .map(part => part.text || '')
    .join('')
    .trim();

  if (!text) {
    // Sin texto: o lo paró el filtro de seguridad, o se acabaron los tokens
    const reason =
      candidate?.finishReason || data.promptFeedback?.blockReason || 'desconocido';
    const err = new Error(`La IA no devolvió texto (motivo: ${reason}).`);
    err.status = 502;
    throw err;
  }

  return text;
}

/**
 * Reformula un texto.
 *
 * @param {string} prompt - Prompt construido con buildPrompt()
 * @returns {Promise<string>} Texto reformulado
 * @throws {Error} Si la API falla o no devuelve texto
 *
 * @example
 * const result = await reformulateText(buildPrompt({ text: 'Hola', tone: 'formal', ... }));
 */
async function reformulateText(prompt) {
  return generate(prompt, { temperature: 0.7, maxOutputTokens: 2048 });
}

/**
 * Propone el nombre de un documento.
 *
 * Temperatura baja: aquí no se busca creatividad, sino una etiqueta corta y
 * estable. La respuesta llega sin limpiar; de eso se encarga el controller.
 *
 * @param {string} prompt - Prompt construido con buildTitlePrompt()
 * @returns {Promise<string>} Título propuesto
 * @throws {Error} Si la API falla o no devuelve texto
 */
async function generateTitle(prompt) {
  return generate(prompt, { temperature: 0.3, maxOutputTokens: 256 });
}

module.exports = { reformulateText, generateTitle };
