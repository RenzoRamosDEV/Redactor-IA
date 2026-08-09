/**
 * Límite de uso por IP: 8 intentos por tramo de 15 minutos y 40 al día,
 * contando el día natural en Europe/Madrid.
 *
 * El recuento vive en memoria, así que se pierde al reiniciar el servidor y
 * cada instancia lleva el suyo.
 *
 * @module middlewares/rateLimiter
 */

const WINDOW_LIMIT = 8;
const WINDOW_MS    = 15 * 60 * 1000; // 15 min
const DAILY_LIMIT  = 40;
const TZ           = 'Europe/Madrid';

/** @type {Map<string, {windowCount: number, windowResetAt: number, dailyCount: number, dailyDate: string}>} */
const store = new Map();

/**
 * @returns {string} Fecha de hoy en Madrid, como "YYYY-MM-DD"
 */
function todayInMadrid() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date());
}

/**
 * @returns {number} Instante de la próxima medianoche en Madrid
 */
function nextMidnightMadrid() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);

  const y = parseInt(parts.find(p => p.type === 'year').value);
  const m = parseInt(parts.find(p => p.type === 'month').value) - 1;
  const d = parseInt(parts.find(p => p.type === 'day').value);

  const madridMidnight = new Date(
    new Date(`${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}T00:00:00`)
      .toLocaleString('en-US', { timeZone: TZ })
  );
  // Advance by 1 day in wall-clock time
  madridMidnight.setDate(madridMidnight.getDate() + 1);

  const madridNow = new Date(now.toLocaleString('en-US', { timeZone: TZ }));
  const utcOffset = now - madridNow; // ms difference UTC vs Madrid local
  const tomorrowMidnightLocal = new Date(y, m, d + 1, 0, 0, 0, 0);
  return tomorrowMidnightLocal.getTime() + utcOffset;
}

/**
 * Registro de la IP, creándolo o reiniciando sus contadores si toca.
 *
 * @param {string} ip
 * @returns {Object}
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

  if (now >= rec.windowResetAt) {
    rec.windowCount   = 0;
    rec.windowResetAt = now + WINDOW_MS;
  }

  if (rec.dailyDate !== today) {
    rec.dailyCount = 0;
    rec.dailyDate  = today;
  }

  return rec;
}

/**
 * @param {Object} rec - Registro de la IP
 * @returns {Object} Lo que se devuelve al cliente para pintar los contadores
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
 * Consume un intento, o corta con 429 si ya no quedan. Deja el estado en
 * req.rateLimitState para que el controller lo devuelva.
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
function rateLimiter(req, res, next) {
  const ip  = req.ip || req.socket?.remoteAddress || 'unknown';
  const rec = getRecord(ip);

  if (rec.dailyCount >= DAILY_LIMIT) {
    const state = { ...buildState(rec), blockedBy: 'daily' };
    return res.status(429).json({ error: 'Límite diario alcanzado. Vuelve mañana.', limits: state });
  }
  if (rec.windowCount >= WINDOW_LIMIT) {
    const state = { ...buildState(rec), blockedBy: 'window' };
    return res.status(429).json({ error: 'Demasiados intentos en 15 minutos. Espera un momento.', limits: state });
  }

  rec.windowCount += 1;
  rec.dailyCount  += 1;

  req.rateLimitState = buildState(rec);

  next();
}

/**
 * GET /api/limits — consulta el estado sin consumir intentos, para que el
 * frontend se sincronice al cargar.
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
function getLimitStatus(req, res) {
  const ip  = req.ip || req.socket?.remoteAddress || 'unknown';
  const rec = getRecord(ip);
  const state = buildState(rec);
  
  if (rec.dailyCount >= DAILY_LIMIT) {
    state.blockedBy = 'daily';
  } else if (rec.windowCount >= WINDOW_LIMIT) {
    state.blockedBy = 'window';
  }
  
  return res.json({ limits: state });
}

module.exports = { rateLimiter, getLimitStatus };
