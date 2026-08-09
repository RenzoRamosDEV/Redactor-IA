/**
 * Manejo centralizado de errores. Va registrado el último en server.js.
 *
 * @module middlewares/errorHandler
 */

/**
 * Convierte cualquier error en una respuesta JSON con un mensaje que el
 * usuario pueda entender, sin exponer detalles internos.
 *
 * @param {Error} err - Error capturado; se respeta su `status` si lo trae
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next (obligatorio en la firma)
 */
function errorHandler(err, req, res, next) {
  const msg = err.message || '';
  const status = err.status || err.statusCode || 500;

  console.error('[ERROR]', status, msg);

  if (status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
    return res.status(429).json({
      error: 'Se ha superado el límite de uso de la IA. Por favor, espera unos minutos antes de volver a intentarlo.'
    });
  }

  // La IA no respondió, tardó demasiado o devolvió algo inservible. Es
  // transitorio, así que conviene decirlo en lugar de dar un error genérico.
  if (status === 502 || status === 503 || status === 504) {
    return res.status(503).json({
      error: 'La IA no está disponible en este momento. Inténtalo de nuevo en unos segundos.',
    });
  }

  res.status(500).json({
    error: 'Ha ocurrido un error interno. Inténtalo de nuevo más tarde.'
  });
}

module.exports = { errorHandler };
