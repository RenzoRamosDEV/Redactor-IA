/**
 * Middleware centralizado de manejo de errores
 * 
 * Captura errores de toda la aplicación y los convierte en respuestas JSON apropiadas.
 * 
 * Casos especiales manejados:
 * - 429 / Rate Limit de Groq: Mensaje específico al usuario sobre esperar
 * - Otros errores: Respuesta genérica 500 sin exponer detalles internos
 * 
 * Todos los errores se loguean en consola para debugging.
 * 
 * @module middlewares/errorHandler
 */

/**
 * Middleware de Express para manejo centralizado de errores.
 * Debe registrarse como último middleware en server.js (después de todas las rutas).
 * 
 * @param {Error} err - Error capturado
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next (no usado, requerido por firma de error middleware)
 * 
 * @example
 * // En server.js:
 * app.use('/api', routes);
 * app.use(errorHandler); // Siempre al final
 * 
 * // En un controller:
 * try {
 *   const result = await someAsyncOperation();
 * } catch (err) {
 *   next(err); // El errorHandler lo capturará
 * }
 */
function errorHandler(err, req, res, next) {
  const msg = err.message || '';
  const status = err.status || err.statusCode || 500;
  
  // Loguear error para debugging
  console.error('[ERROR]', status, msg);

  // Manejar rate limit de Groq (429)
  if (status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
    return res.status(429).json({ 
      error: 'Se ha superado el límite de uso de la IA. Por favor, espera unos minutos antes de volver a intentarlo.' 
    });
  }

  // Error genérico 500 (sin exponer detalles internos al cliente)
  res.status(500).json({ 
    error: 'Ha ocurrido un error interno. Inténtalo de nuevo más tarde.' 
  });
}

module.exports = { errorHandler };
