/**
 * Cliente HTTP para comunicación con el backend
 * 
 * Gestiona todas las peticiones al API del servidor de reformulación de texto.
 * 
 * @module services/api
 */

/**
 * URL base del API
 * Se obtiene de variable de entorno VITE_API_URL o usa localhost por defecto
 * @private
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * @typedef {Object} LimitState
 * @property {number} remainingWindow - Intentos restantes en ventana de 15min
 * @property {number} remainingDaily - Intentos restantes hoy
 * @property {number} windowResetAt - Timestamp cuando se reinicia la ventana
 * @property {number} dailyResetAt - Timestamp cuando se reinicia el contador diario
 * @property {'window'|'daily'|null} blockedBy - Tipo de límite que bloquea (si aplica)
 */

/**
 * @typedef {Object} RewriteRequest
 * @property {string} text - Texto a reformular (max 500 chars)
 * @property {string} tone - Tono a aplicar (ver constants/tones.js)
 * @property {number} intensity - Intensidad del tono (0-100)
 * @property {boolean} keepLength - Mantener longitud similar al original
 * @property {string} [extraInstruction] - Instrucción adicional opcional
 */

/**
 * @typedef {Object} RewriteResponse
 * @property {string} result - Texto reformulado
 * @property {Object} meta - Metadatos de la operación
 * @property {string} meta.toneApplied - Tono aplicado
 * @property {number} meta.processingTimeMs - Tiempo de procesamiento en ms
 * @property {LimitState} limits - Estado actual de límites
 */

/**
 * Obtiene el estado actual de límites de uso sin consumir intentos
 * 
 * Útil para sincronizar el estado del cliente con el servidor,
 * especialmente después de recargar la página.
 * 
 * @returns {Promise<LimitState>} Estado de límites del usuario
 * @throws {Error} Si hay error de red o el servidor no responde
 * 
 * @example
 * const limits = await getLimits();
 * console.log(`Intentos restantes: ${limits.remainingWindow}/8`);
 */
export async function getLimits() {
  const response = await fetch(`${API_URL}/api/limits`);
  const data = await response.json();
  return data.limits;
}

/**
 * Envía un texto para ser reformulado por la IA
 * 
 * Consume 1 intento de los límites establecidos (ventana y diario).
 * Si se exceden los límites, lanza un error con código 429.
 * 
 * @param {RewriteRequest} params - Parámetros de la reformulación
 * @returns {Promise<RewriteResponse>} Texto reformulado y metadatos
 * @throws {Error} Error con mensaje de usuario si falla la petición.
 *                 Si es error 429, incluye propiedad `limits` con estado actual.
 * 
 * @example
 * try {
 *   const result = await rewriteText({
 *     text: 'Hola mundo',
 *     tone: 'formal',
 *     intensity: 60,
 *     keepLength: true,
 *     extraInstruction: 'Hazlo breve'
 *   });
 *   console.log(result.result); // "Saludos cordiales."
 * } catch (err) {
 *   if (err.limits) {
 *     console.log('Límite alcanzado:', err.limits.blockedBy);
 *   }
 * }
 */
export async function rewriteText({ text, tone, intensity, keepLength, extraInstruction }) {
  let response;

  try {
    response = await fetch(`${API_URL}/api/rewrite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tone, intensity, keepLength, extraInstruction }),
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

  // Si la respuesta no es OK, lanzar error con mensaje amigable
  if (!response.ok) {
    const err = new Error(data.error || 'Error al procesar la solicitud.');
    
    // Adjuntar estado de límites si viene en la respuesta (error 429)
    if (data.limits) {
      err.limits = data.limits;
    }
    
    throw err;
  }

  return data;
}
