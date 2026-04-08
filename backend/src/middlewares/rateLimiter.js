/**
 * Middleware de rate limiting dual (ventana deslizante + límite diario)
 * 
 * Implementa dos límites independientes por IP:
 * - Ventana: máximo 8 intentos en ventana deslizante de 15 minutos
 * - Diario: máximo 40 intentos por día calendario (medianoche Europe/Madrid)
 * 
 * Almacenamiento en memoria (Map), se pierde al reiniciar el servidor.
 * 
 * Funcionamiento:
 * - Al recibir request, obtiene/crea registro para la IP
 * - Resetea contadores si han expirado (ventana o día)
 * - Verifica límites antes de incrementar
 * - Si está bloqueado, responde 429 con estado de límites
 * - Si ok, incrementa contadores y adjunta req.rateLimitState para el controller
 * 
 * @module middlewares/rateLimiter
 */

const WINDOW_LIMIT = 8;
const WINDOW_MS    = 15 * 60 * 1000; // 15 min
const DAILY_LIMIT  = 40;
const TZ           = 'Europe/Madrid';

// Almacén in-memory: Map<ip, { windowCount, windowResetAt, dailyCount, dailyDate }>
const store = new Map();

/**
 * Retorna la fecha actual "YYYY-MM-DD" en zona horaria Europe/Madrid
 * @returns {string} Fecha en formato ISO (YYYY-MM-DD)
 */
function todayInMadrid() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date());
}

/**
 * Calcula el timestamp (ms) de la próxima medianoche en Europe/Madrid
 * @returns {number} Timestamp en milisegundos
 */
function nextMidnightMadrid() {
  const now = new Date();
  // Build today's date in Madrid, then advance one day
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);

  const y = parseInt(parts.find(p => p.type === 'year').value);
  const m = parseInt(parts.find(p => p.type === 'month').value) - 1;
  const d = parseInt(parts.find(p => p.type === 'day').value);

  // Construct midnight of *tomorrow* in Madrid as a UTC timestamp
  const madridMidnight = new Date(
    new Date(`${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}T00:00:00`)
      .toLocaleString('en-US', { timeZone: TZ })
  );
  // Advance by 1 day in wall-clock time
  madridMidnight.setDate(madridMidnight.getDate() + 1);

  // Re-interpret as the UTC instant when Madrid hits that midnight
  // Simpler: offset approach — get current UTC offset for Madrid then compute
  const madridNow = new Date(now.toLocaleString('en-US', { timeZone: TZ }));
  const utcOffset = now - madridNow; // ms difference UTC vs Madrid local
  const tomorrowMidnightLocal = new Date(y, m, d + 1, 0, 0, 0, 0);
  return tomorrowMidnightLocal.getTime() + utcOffset;
}

/**
 * Obtiene o crea el registro de límites para una IP.
 * Resetea contadores si han expirado (ventana o día).
 * 
 * @param {string} ip - Dirección IP del cliente
 * @returns {Object} Registro de límites { windowCount, windowResetAt, dailyCount, dailyDate }
 */
function getRecord(ip) {
  const now   = Date.now();
  const today = todayInMadrid();
  let rec = store.get(ip);

  if (!rec) {
    rec = {
      windowCount:   0,
      windowResetAt: now + WINDOW_MS,
      dailyCount:    0,
      dailyDate:     today,
    };
    store.set(ip, rec);
  }

  // Reset window if expired
  if (now >= rec.windowResetAt) {
    rec.windowCount   = 0;
    rec.windowResetAt = now + WINDOW_MS;
  }

  // Reset daily counter if calendar day has changed
  if (rec.dailyDate !== today) {
    rec.dailyCount = 0;
    rec.dailyDate  = today;
  }

  return rec;
}

/**
 * Construye el objeto de estado de límites para responder al cliente.
 * 
 * @param {Object} rec - Registro de límites de la IP
 * @returns {Object} Estado de límites { remainingWindow, remainingDaily, windowResetAt, dailyResetAt, blockedBy }
 */
function buildState(rec) {
  return {
    remainingWindow: Math.max(0, WINDOW_LIMIT - rec.windowCount),
    remainingDaily:  Math.max(0, DAILY_LIMIT  - rec.dailyCount),
    windowResetAt:   rec.windowResetAt,
    dailyResetAt:    nextMidnightMadrid(),
    blockedBy:       null,
  };
}

/**
 * Middleware principal de rate limiting.
 * Valida límites, consume un intento si ok, o bloquea con 429 si excedido.
 * Adjunta req.rateLimitState para que el controller lo incluya en la respuesta.
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
function rateLimiter(req, res, next) {
  const ip  = req.ip || req.socket?.remoteAddress || 'unknown';
  const rec = getRecord(ip);

  // Check limits before incrementing
  if (rec.dailyCount >= DAILY_LIMIT) {
    const state = { ...buildState(rec), blockedBy: 'daily' };
    return res.status(429).json({ error: 'Límite diario alcanzado. Vuelve mañana.', limits: state });
  }
  if (rec.windowCount >= WINDOW_LIMIT) {
    const state = { ...buildState(rec), blockedBy: 'window' };
    return res.status(429).json({ error: 'Demasiados intentos en 15 minutos. Espera un momento.', limits: state });
  }

  // Consume one attempt
  rec.windowCount += 1;
  rec.dailyCount  += 1;

  // Attach state for the controller
  req.rateLimitState = buildState(rec);

  next();
}

/**
 * Endpoint GET /api/limits para obtener el estado de límites sin consumir intentos.
 * Útil para que el frontend sincronice el estado al cargar la app.
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con estado de límites
 */
function getLimitStatus(req, res) {
  const ip  = req.ip || req.socket?.remoteAddress || 'unknown';
  const rec = getRecord(ip);
  const state = buildState(rec);
  
  // Check if blocked
  if (rec.dailyCount >= DAILY_LIMIT) {
    state.blockedBy = 'daily';
  } else if (rec.windowCount >= WINDOW_LIMIT) {
    state.blockedBy = 'window';
  }
  
  return res.json({ limits: state });
}

module.exports = { rateLimiter, getLimitStatus };
