/**
 * Servicio de integración con Groq API
 * 
 * Utiliza el modelo Llama 3.3 70B Versatile de Groq para reformular texto.
 * 
 * Configuración:
 * - Modelo: llama-3.3-70b-versatile
 * - Temperature: 0.7 (balance entre creatividad y coherencia)
 * - Max tokens: 1024 (suficiente para textos reformulados)
 * 
 * Requiere variable de entorno:
 * - GROQ_API_KEY: Clave de API de Groq
 * 
 * @module services/groq
 */

require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Reformula un texto usando Groq API (Llama 3.3 70B).
 * 
 * @param {string} prompt - Prompt completo construido con buildPrompt()
 * @returns {Promise<string>} Texto reformulado por la IA
 * @throws {Error} Si Groq devuelve respuesta vacía o hay error de red/API
 * 
 * @example
 * const prompt = buildPrompt({ text: 'Hola', tone: 'formal', ... });
 * const result = await reformulateText(prompt);
 * // result: "Estimado/a, buenos días..."
 */
async function reformulateText(prompt) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,   // Balance creatividad/coherencia
    max_tokens: 1024,   // Suficiente para reformulaciones
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq devolvió una respuesta vacía.');
  return text;
}

/**
 * Genera el nombre de un documento a partir de su texto.
 *
 * Temperatura baja y pocos tokens: aquí no se busca creatividad, sino una
 * etiqueta corta y estable. La respuesta llega sin limpiar; de eso se encarga
 * el controller.
 *
 * @param {string} prompt - Prompt construido con buildTitlePrompt()
 * @returns {Promise<string|null>} Título propuesto, o null si no devolvió nada
 * @throws {Error} Si hay error de red o de la API
 */
async function generateTitle(prompt) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 32,
  });

  return completion.choices[0]?.message?.content?.trim() || null;
}

module.exports = { reformulateText, generateTitle };
