import { useCountdown } from '../hooks/useCountdown';

export default function Header({ limits, windowLimit = 8, dailyLimit = 40, darkMode = false, onToggleDark, theme = {} }) {
  const {
    remainingWindow = windowLimit,
    remainingDaily  = dailyLimit,
    blockedBy       = null,
    windowResetAt   = null,
    dailyResetAt    = null,
  } = limits || {};

  const isWindowBlocked = blockedBy === 'window';
  const isDailyBlocked  = blockedBy === 'daily';

  // Live countdowns
  const windowCountdown = useCountdown(windowResetAt);
  const dailyCountdown  = useCountdown(dailyResetAt);

  const cardBase = {
    borderRadius: '12px', padding: '12px 20px',
    background: theme.cardBg,
    boxShadow: theme.shadowSm,
    textAlign: 'center', minWidth: '130px',
    transition: 'background 0.2s, border-color 0.2s',
  };

  return (
    <header style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Title */}
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: theme.textPrimary, letterSpacing: '-0.5px', lineHeight: 1.2, margin: 0, transition: 'color 0.2s' }}>
            Redactor IA de textos
          </h1>
          <p style={{ marginTop: '6px', color: theme.textMuted, fontSize: '14px', lineHeight: 1.5, transition: 'color 0.2s' }}>
            Escribe, mejora y reformula textos con distintos tonos usando inteligencia artificial.
          </p>
        </div>

        {/* Right side: counters + dark toggle */}
        <div style={{ display: 'flex', gap: '12px', flexShrink: 0, marginTop: '4px', alignItems: 'flex-start' }}>
          {/* Window counter */}
          <div style={{
            ...cardBase,
            border: `1px solid ${isWindowBlocked ? theme.errorBorder : theme.border}`,
            background: isWindowBlocked ? theme.errorBg : theme.cardBg,
          }}>
            <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', transition: 'color 0.2s' }}>Tramo 15 min</p>
            <p style={{
              fontSize: '24px', fontWeight: '700', lineHeight: 1,
              color: isWindowBlocked ? theme.errorText : remainingWindow === 0 ? theme.warnText : theme.textPrimary,
              transition: 'color 0.2s',
            }}>
              {remainingWindow}/{windowLimit}
            </p>
            {/* Live countdown — shows only when window reset time is known */}
            {windowResetAt && windowCountdown && (
              <p style={{
                fontSize: '11px', fontWeight: '600', marginTop: '5px', letterSpacing: '0.04em',
                color: isWindowBlocked ? theme.errorText : theme.textMuted,
                transition: 'color 0.2s',
              }}>
                {windowCountdown}
              </p>
            )}
          </div>

          {/* Daily counter */}
          <div style={{
            ...cardBase,
            border: `1px solid ${isDailyBlocked ? theme.errorBorder : theme.border}`,
            background: isDailyBlocked ? theme.errorBg : theme.cardBg,
          }}>
            <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', transition: 'color 0.2s' }}>Hoy (diario)</p>
            <p style={{
              fontSize: '24px', fontWeight: '700', lineHeight: 1,
              color: isDailyBlocked ? theme.errorText : remainingDaily === 0 ? theme.warnText : theme.textPrimary,
              transition: 'color 0.2s',
            }}>
              {remainingDaily}/{dailyLimit}
            </p>
            {isDailyBlocked && dailyCountdown && (
              <p style={{ fontSize: '11px', fontWeight: '600', color: theme.errorText, marginTop: '5px', transition: 'color 0.2s' }}>
                {dailyCountdown}
              </p>
            )}
          </div>

          {/* Dark mode toggle */}
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
              /* Sun icon */
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
              /* Moon icon */
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
