/**
 * Servidor Express principal para el Redactor IA
 * 
 * Configura y arranca un servidor HTTP con:
 * - Seguridad básica (Helmet)
 * - CORS dinámico para localhost en cualquier puerto
 * - Rate limiting dual (ventana + diario)
 * - Rutas API para reformulación de texto
 * - Manejo centralizado de errores
 * 
 * Variables de entorno requeridas:
 * - GROQ_API_KEY: Clave de API de Groq
 * - PORT: Puerto del servidor (default: 3001)
 * - ALLOWED_ORIGINS (opcional): lista separada por coma de orígenes permitidos
 * 
 * @module server
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorHandler');
const rewriteRoutes = require('./routes/rewrite.routes');

const app = express();
const PORT = process.env.PORT || 3001;
const rawAllowedOrigins = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '';
const configuredOrigins = rawAllowedOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ──────────────────────────────────────────────────────────────
// Middlewares de seguridad
// ──────────────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (curl, Postman) y cualquier puerto localhost
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    // Permitir orígenes configurados explícitamente para producción
    if (configuredOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST'],
}));

// ──────────────────────────────────────────────────────────────
// Body parsing (límite 10kb para prevenir payloads grandes)
// ──────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));

// ──────────────────────────────────────────────────────────────
// Rutas de la API
// ──────────────────────────────────────────────────────────────

app.use('/api', rewriteRoutes);

// ──────────────────────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ──────────────────────────────────────────────────────────────
// Manejo centralizado de errores
// ──────────────────────────────────────────────────────────────

app.use(errorHandler);

// ──────────────────────────────────────────────────────────────
// Inicio del servidor
// ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server] Running on port ${PORT}`);
});

module.exports = app;
