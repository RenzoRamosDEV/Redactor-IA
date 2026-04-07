function errorHandler(err, req, res, next) {
  const msg = err.message || '';
  const status = err.status || err.statusCode || 500;
  console.error('[ERROR]', status, msg);

  // Quota / rate limit from Groq or Gemini
  if (status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
    return res.status(429).json({ error: 'Se ha superado el límite de uso de la IA. Por favor, espera unos minutos antes de volver a intentarlo.' });
  }

  res.status(500).json({ error: 'Ha ocurrido un error interno. Inténtalo de nuevo más tarde.' });
}

module.exports = { errorHandler };
