/**
 * Cliente HTTP del backend.
 *
 * @module services/api
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * @typedef {Object} LimitState
 * @property {number} remainingWindow - Intentos que quedan en el tramo de 15 min
 * @property {number} remainingDaily - Intentos que quedan hoy
 * @property {number} windowResetAt - Cuándo se reinicia el tramo
 * @property {number} dailyResetAt - Cuándo se reinicia el contador diario
 * @property {'window'|'daily'|null} blockedBy - Qué límite bloquea, si alguno
 */

/**
 * @typedef {Object} RewriteRequest
 * @property {string} text - Texto a reformular
 * @property {string} tone - Tono a aplicar
 * @property {number} intensity - Intensidad del tono (0-100)
 * @property {boolean} keepLength - Evitar que el texto crezca
 * @property {string} [extraInstruction] - Instrucción libre
 * @property {boolean} [needsTitle] - Pedir que la IA nombre el documento
 */

/**
 * @typedef {Object} RewriteResponse
 * @property {string} result - Texto reformulado
 * @property {Object} meta - Tono aplicado, tiempo de proceso y título propuesto
 * @property {LimitState} limits - Estado de límites tras consumir el intento
 */

/**
 * Consulta el estado de límites sin gastar un intento.
 *
 * @returns {Promise<LimitState>}
 */
export async function getLimits() {
  const response = await fetch(`${API_URL}/api/limits`);
  const data = await response.json();
  return data.limits;
}

/**
 * Envía un texto a reformular. Consume un intento.
 *
 * @param {RewriteRequest} params
 * @returns {Promise<RewriteResponse>}
 * @throws {Error} Con `limits` si el error es por límite alcanzado, o con
 *   `isNetworkError` si no se pudo contactar con el servidor.
 */
export async function rewriteText({ text, tone, intensity, keepLength, extraInstruction, needsTitle }) {
  let response;

  try {
    response = await fetch(`${API_URL}/api/rewrite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tone, intensity, keepLength, extraInstruction, needsTitle }),
    });
  } catch {
    // Servidor caído, sin conexión o CORS: el navegador solo da un
    // "Failed to fetch" que no sirve de nada al usuario. Se marca para que la
    // interfaz ponga un mensaje propio y traducido.
    const err = new Error('network');
    err.isNetworkError = true;
    throw err;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    // Respuesta que no es JSON (un proxy devolviendo HTML, por ejemplo)
    data = {};
  }

  if (!response.ok) {
    const err = new Error(data.error || 'Error al procesar la solicitud.');
    if (data.limits) err.limits = data.limits;
    throw err;
  }

  return data;
}
