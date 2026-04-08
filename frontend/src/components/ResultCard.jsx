import { useState } from 'react';
import { useCountdown } from '../hooks/useCountdown';

const TONE_LABELS = {
  rewrite: 'Mejorar redacción', formal: 'Formal', fun: 'Divertido',
  casual: 'Casual', professional: 'Profesional', direct: 'Directo',
  persuasive: 'Persuasivo', creative: 'Creativo',
};

export default function ResultCard({
  generatedText = '', isLoading = false, selectedTone = 'rewrite',
  processingTime = null, limits, windowLimit = 8, dailyLimit = 40, theme = {},
}) {
  const [copied, setCopied] = useState(false);

  const {
    remainingWindow = windowLimit,
    remainingDaily  = dailyLimit,
    blockedBy       = null,
    windowResetAt   = null,
  } = limits || {};

  const isBlocked = blockedBy !== null;

  const windowUsed    = windowLimit - remainingWindow;
  const windowUsedPct = Math.round((windowUsed / windowLimit) * 100);
  const dailyUsed     = dailyLimit - remainingDaily;
  const dailyUsedPct  = Math.round((dailyUsed / dailyLimit) * 100);

  const windowCountdown = useCountdown(blockedBy === 'window' ? windowResetAt : null);

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function barColor(pct) {
    return pct >= 100 ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#22c55e';
  }

  return (
    <div style={{
      background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow, padding: '24px',
      transition: 'background 0.2s, border-color 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: '600', color: theme.textPrimary, margin: 0, transition: 'color 0.2s' }}>Resultado generado</h2>
          <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px', transition: 'color 0.2s' }}>Vista previa del texto mejorado por la IA.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isLoading && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: '500', color: theme.warnText,
              background: theme.warnBg, border: `1px solid ${theme.warnBorder}`,
              borderRadius: '999px', padding: '4px 12px', transition: 'all 0.2s',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.warnText, display: 'inline-block', animation: 'pulse 1s infinite' }} />
              Generando respuesta...
            </span>
          )}
          <button
            onClick={handleCopy}
            disabled={!generatedText}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 16px', borderRadius: '10px',
              border: `1px solid ${theme.border}`, background: theme.cardBg,
              fontSize: '13px', fontWeight: '500', color: theme.textSecondary,
              cursor: generatedText ? 'pointer' : 'not-allowed',
              opacity: generatedText ? 1 : 0.5, fontFamily: 'inherit',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {copied ? 'Copiado' : 'Copiar texto'}
          </button>
        </div>
      </div>

      {/* Content row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>
        {/* Result box */}
        <div style={{
          borderRadius: '12px', border: `1px solid ${theme.border}`,
          background: theme.inputBg, padding: '16px', minHeight: '140px',
          transition: 'background 0.2s, border-color 0.2s',
        }}>
          {isLoading ? (
            <div>
              <div style={{ height: '12px', background: theme.border, borderRadius: '6px', marginBottom: '8px', width: '100%' }} />
              <div style={{ height: '12px', background: theme.border, borderRadius: '6px', marginBottom: '8px', width: '85%' }} />
              <div style={{ height: '12px', background: theme.border, borderRadius: '6px', width: '70%' }} />
            </div>
          ) : generatedText ? (
            <p style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap', transition: 'color 0.2s' }}>{generatedText}</p>
          ) : (
            <p style={{ fontSize: '13px', color: theme.textPlaceholder, fontStyle: 'italic', margin: 0, transition: 'color 0.2s' }}>
              El texto generado aparecerá aquí...
            </p>
          )}
        </div>

        {/* Status panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '14px 16px',
            transition: 'border-color 0.2s',
          }}>
            <p style={{ fontSize: '10px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', transition: 'color 0.2s' }}>
              ESTADO DEL SISTEMA
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Row label="Motor de redacción" theme={theme}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: isBlocked ? theme.errorText : theme.successText, transition: 'color 0.2s' }}>
                  {isBlocked ? 'Bloqueado' : 'Activo'}
                </span>
              </Row>
              <Row label="Tono seleccionado" theme={theme}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textPrimary, transition: 'color 0.2s' }}>
                  {TONE_LABELS[selectedTone] || selectedTone}
                </span>
              </Row>
              {processingTime && (
                <Row label="Tiempo de respuesta" theme={theme}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textPrimary, transition: 'color 0.2s' }}>{processingTime} s</span>
                </Row>
              )}
              <Row label="Tramo 15 min" theme={theme}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: remainingWindow === 0 ? theme.errorText : theme.textPrimary, transition: 'color 0.2s' }}>
                  {windowUsed}/{windowLimit}
                </span>
              </Row>
              {windowUsed > 0 && windowCountdown && (
                <Row label="Reinicio en" theme={theme}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textPrimary, transition: 'color 0.2s', fontVariantNumeric: 'tabular-nums' }}>
                    {windowCountdown}
                  </span>
                </Row>
              )}
              <Row label="Hoy (diario)" theme={theme}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: remainingDaily === 0 ? theme.errorText : theme.textPrimary, transition: 'color 0.2s' }}>
                  {dailyUsed}/{dailyLimit}
                </span>
              </Row>
            </div>

            {/* Window bar */}
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '4px', transition: 'color 0.2s' }}>15 min</p>
              <div style={{ background: theme.border, borderRadius: '999px', height: '4px' }}>
                <div style={{ width: `${windowUsedPct}%`, height: '4px', borderRadius: '999px', background: barColor(windowUsedPct), transition: 'width 0.4s' }} />
              </div>
            </div>

            {/* Daily bar */}
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '4px', transition: 'color 0.2s' }}>Diario</p>
              <div style={{ background: theme.border, borderRadius: '999px', height: '4px' }}>
                <div style={{ width: `${dailyUsedPct}%`, height: '4px', borderRadius: '999px', background: barColor(dailyUsedPct), transition: 'width 0.4s' }} />
              </div>
            </div>
          </div>

          {/* Block warning */}
          {isBlocked && (
            <div style={{
              borderRadius: '12px', border: `1px solid ${theme.errorBorder}`,
              background: theme.errorBg, padding: '14px 16px', transition: 'all 0.2s',
            }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: theme.errorText, marginBottom: '6px', transition: 'color 0.2s' }}>
                {blockedBy === 'daily' ? 'Límite diario alcanzado' : 'Límite de tramo alcanzado'}
              </p>
              <p style={{ fontSize: '12px', color: theme.errorText, lineHeight: '1.5', margin: 0, opacity: 0.85, transition: 'color 0.2s' }}>
                {blockedBy === 'daily'
                  ? `Has agotado los ${dailyLimit} intentos de hoy. Vuelve mañana a las 00:00 (hora de España).`
                  : `Has usado los ${windowLimit} intentos del tramo.`}
              </p>
              {blockedBy === 'window' && windowCountdown && (
                <p style={{ fontSize: '20px', fontWeight: '700', color: theme.errorText, marginTop: '8px', letterSpacing: '0.05em', transition: 'color 0.2s' }}>
                  {windowCountdown}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, theme, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: theme.textMuted, transition: 'color 0.2s' }}>{label}</span>
      {children}
    </div>
  );
}
