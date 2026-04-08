import { useCountdown } from '../hooks/useCountdown';
import { WINDOW_LIMIT, DAILY_LIMIT } from '../constants';

/**
 * Header del redactor de IA.
 * Muestra el título, subtítulo, contadores de límites (tramo 15 min y diario) con tooltips,
 * y un botón para alternar entre modo claro/oscuro.
 * 
 * @param {Object} props - Props del componente
 * @param {Object} props.limits - Objeto de límites desde el backend
 * @param {number} props.limits.remainingWindow - Intentos restantes en ventana de 15 min
 * @param {number} props.limits.remainingDaily - Intentos restantes hoy
 * @param {string|null} props.limits.blockedBy - 'window' | 'daily' | null
 * @param {string|null} props.limits.windowResetAt - ISO timestamp de reset de ventana
 * @param {string|null} props.limits.dailyResetAt - ISO timestamp de reset diario
 * @param {number} [props.windowLimit=8] - Límite de ventana (fallback)
 * @param {number} [props.dailyLimit=40] - Límite diario (fallback)
 * @param {boolean} [props.darkMode=false] - Si está en modo oscuro
 * @param {Function} props.onToggleDark - Callback para alternar modo oscuro
 * @param {Object} [props.theme={}] - Objeto de tema (lightTheme o darkTheme)
 * 
 * @returns {JSX.Element} Header component
 * 
 * @example
 * <Header
 *   limits={limitsState}
 *   darkMode={isDark}
 *   onToggleDark={() => setIsDark(!isDark)}
 *   theme={isDark ? darkTheme : lightTheme}
 * />
 */
export default function Header({ limits, windowLimit = WINDOW_LIMIT, dailyLimit = DAILY_LIMIT, darkMode = false, onToggleDark, theme = {} }) {
  // Extraer datos de límites (con fallbacks)
  const {
    remainingWindow = windowLimit,
    remainingDaily  = dailyLimit,
    blockedBy       = null,
    windowResetAt   = null,
    dailyResetAt    = null,
  } = limits || {};

  // Determinar si el usuario está bloqueado por ventana o día
  const isWindowBlocked = blockedBy === 'window';
  const isDailyBlocked  = blockedBy === 'daily';

  // Countdowns en vivo (MM:SS)
  const windowCountdown = useCountdown(windowResetAt);
  const dailyCountdown  = useCountdown(dailyResetAt);

  // Estilos base para tarjetas de límites
  const cardBase = {
    borderRadius: '12px', padding: '12px 20px',
    background: theme.cardBg,
    boxShadow: theme.shadowSm,
    textAlign: 'center', minWidth: '130px',
    minHeight: '68px', // altura fija para evitar desalineación
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    transition: 'background 0.2s, border-color 0.2s',
    cursor: 'help', // indica tooltip en hover
  };

  return (
    <header style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        
        {/* ========== TÍTULO Y SUBTÍTULO ========== */}
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: theme.textPrimary, letterSpacing: '-0.5px', lineHeight: 1.2, margin: 0, transition: 'color 0.2s' }}>
            Redactor IA de textos
          </h1>
          <p style={{ marginTop: '6px', color: theme.textMuted, fontSize: '14px', lineHeight: 1.5, transition: 'color 0.2s' }}>
            Escribe, mejora y reformula textos con distintos tonos usando inteligencia artificial.
          </p>
        </div>

        {/* ========== CONTADORES Y TOGGLE DARK MODE ========== */}
        <div style={{ display: 'flex', gap: '12px', flexShrink: 0, marginTop: '4px', alignItems: 'flex-start' }}>
          
          {/* Contador ventana 15 min */}
          <div
            style={{
              ...cardBase,
              border: `1px solid ${isWindowBlocked ? theme.errorBorder : theme.border}`,
              background: isWindowBlocked ? theme.errorBg : theme.cardBg,
            }}
            title={remainingWindow < windowLimit && windowCountdown ? `Se reinicia en ${windowCountdown}` : 'Límite de intentos cada 15 minutos'}
          >
            <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', transition: 'color 0.2s' }}>Tramo 15 min</p>
            <p style={{
              fontSize: '24px', fontWeight: '700', lineHeight: 1,
              color: isWindowBlocked ? theme.errorText : remainingWindow === 0 ? theme.warnText : theme.textPrimary,
              transition: 'color 0.2s',
            }}>
              {remainingWindow}/{windowLimit}
            </p>
          </div>

          {/* Contador diario */}
          <div
            style={{
              ...cardBase,
              border: `1px solid ${isDailyBlocked ? theme.errorBorder : theme.border}`,
              background: isDailyBlocked ? theme.errorBg : theme.cardBg,
            }}
            title={isDailyBlocked && dailyCountdown ? `Se reinicia en ${dailyCountdown}` : 'Límite de intentos por día (medianoche España)'}
          >
            <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', transition: 'color 0.2s' }}>Hoy (diario)</p>
            <p style={{
              fontSize: '24px', fontWeight: '700', lineHeight: 1,
              color: isDailyBlocked ? theme.errorText : remainingDaily === 0 ? theme.warnText : theme.textPrimary,
              transition: 'color 0.2s',
            }}>
              {remainingDaily}/{dailyLimit}
            </p>
          </div>

          {/* Botón toggle modo oscuro */}
          <button
            onClick={onToggleDark}
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              border: `1px solid ${theme.border}`,
              background: theme.cardBg,
              boxShadow: theme.shadowSm,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.2s, border-color 0.2s',
              marginTop: '14px',
            }}
          >
            {darkMode ? (
              /* Sun icon - modo claro */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              /* Moon icon - modo oscuro */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
