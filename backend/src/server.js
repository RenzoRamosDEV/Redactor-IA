/**
 * Servidor Express del Redactor IA.
 *
 * Variables de entorno: ver backend/.env.example.
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

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Sin origin son curl o Postman; localhost en cualquier puerto cubre los
    // arranques de Vite, que cambia de puerto cuando el suyo está ocupado.
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    const allowed = process.env.FRONTEND_URL;
    if (allowed && origin === allowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST'],
}));

// El texto va topado a 500 caracteres, así que 10kb sobran de largo
app.use(express.json({ limit: '10kb' }));

app.use('/api', rewriteRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server] Running on port ${PORT}`);
});

module.exports = app;
