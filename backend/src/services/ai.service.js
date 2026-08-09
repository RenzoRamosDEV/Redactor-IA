/**
 * Cliente de IA, contra cualquier API compatible con OpenAI.
 *
 * El servicio no sabe qué proveedor hay detrás: habla el formato
 * `/chat/completions` y toma del entorno a dónde apunta, con qué clave y con
 * qué modelo. Cambiar de modelo —o de proveedor— es editar el `.env` y
 * reiniciar; no se toca código.
 *
 * Sirve para dos escenarios:
 *
 * 1. **Directo contra el proveedor.** Gemini expone una interfaz compatible
 *    con OpenAI, que es la configuración por defecto.
 * 2. **A través de LiteLLM.** Apuntando AI_BASE_URL al proxy (por defecto
 *    http://localhost:4000/v1), los modelos se declaran en
 *    `litellm_config.yaml` y AI_MODEL pasa a ser el alias de uno de ellos.
 *    Ahí es donde se configuran varios proveedores y los reintentos entre
 *    modelos cuando uno agota su cuota.
 *
 * Variables de entorno:
 * - AI_BASE_URL: raíz de la API (sin /chat/completions)
 * - AI_API_KEY: clave; si falta, se usa GEMINI_API_KEY
 * - AI_MODEL: modelo o alias a usar
 * - AI_REASONING_EFFORT: cuánto puede razonar el modelo antes de responder
 *
 * @module services/ai
 */

require('dotenv').config();

/** @constant {string} Raíz de la API, sin barra final */
const BASE_URL = (
  process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai'
).replace(/\/+$/, '');

/** @constant {string} Modelo o alias con el que se generan las respuestas */
const MODEL = process.env.AI_MODEL || 'gemini-3.5-flash';

/**
 * Los modelos que razonan antes de responder gastan ese razonamiento del mismo
 * presupuesto de tokens que la respuesta. Sin bajarlo, se iba casi todo en
 * pensar y llegaban títulos vacíos y reformulaciones cortadas a media frase.
 *
 * Los modelos que no razonan ignoran el parámetro, así que es seguro enviarlo
 * siempre.
 *
 * @constant {string}
 */
const REASONING_EFFORT = process.env.AI_REASONING_EFFORT || 'low';

/** @constant {number} Tiempo máximo de espera por respuesta */
const TIMEOUT_MS = 30000;

/**
 * Pide una generación al modelo configurado.
 *
 * @param {string} prompt - Prompt completo
 * @param {Object} options
 * @param {number} options.temperature - Aleatoriedad de la respuesta
 * @param {number} options.maxTokens - Tope de tokens (razonamiento incluido)
 * @returns {Promise<string>} Texto generado, ya recortado
 * @throws {Error} Con `status` puesto, para que errorHandler lo traduzca
 * @private
 */
async function complete(prompt, { temperature, maxTokens }) {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const err = new Error('Falta la clave de la IA (AI_API_KEY o GEMINI_API_KEY).');
    err.status = 500;
    throw err;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
        reasoning_effort: REASONING_EFFORT,
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

  const choice = data.choices?.[0];
  const text = (choice?.message?.content || '').trim();

  if (!text) {
    // Sin texto: o lo paró el filtro de contenido, o se acabaron los tokens
    const reason = choice?.finish_reason || 'desconocido';
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
  return complete(prompt, { temperature: 0.7, maxTokens: 2048 });
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
  return complete(prompt, { temperature: 0.3, maxTokens: 256 });
}

/**
 * Configuración activa, para el arranque y el health check.
 *
 * @returns {{baseUrl: string, model: string}}
 */
function describeProvider() {
  return { baseUrl: BASE_URL, model: MODEL };
}

module.exports = { reformulateText, generateTitle, describeProvider };
