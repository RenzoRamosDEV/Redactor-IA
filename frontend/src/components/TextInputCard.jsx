const MAX_CHARS = 500;

export default function TextInputCard({ inputText = '', onInputChange, onClear, onGenerate, isLoading = false, isBlocked = false, errorMessage = '', theme = {} }) {
  const charCount = inputText.length;
  const pct = Math.min((charCount / MAX_CHARS) * 100, 100);
  const canGenerate = !isLoading && !isBlocked && charCount > 0;

  return (
    <div style={{
      background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow, padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '16px',
      transition: 'background 0.2s, border-color 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: '600', color: theme.textPrimary, margin: 0, transition: 'color 0.2s' }}>Escribe tu texto</h2>
          <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px', transition: 'color 0.2s' }}>Máximo {MAX_CHARS} caracteres por intento.</p>
        </div>
        {isBlocked ? (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: '500', color: theme.errorText,
            background: theme.errorBg, border: `1px solid ${theme.errorBorder}`,
            borderRadius: '999px', padding: '4px 12px', transition: 'all 0.2s',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.errorText, display: 'inline-block' }} />
            Bloqueado temporalmente
          </span>
        ) : (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: '500', color: theme.successText,
            background: theme.successBg, border: `1px solid ${theme.successBorder}`,
            borderRadius: '999px', padding: '4px 12px', transition: 'all 0.2s',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.successText, display: 'inline-block' }} />
            Listo para redactar
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        value={inputText}
        onChange={e => onInputChange && onInputChange(e.target.value)}
        maxLength={MAX_CHARS}
        rows={6}
        placeholder="Escribe o pega tu texto aquí..."
        disabled={isBlocked}
        style={{
          width: '100%', resize: 'none', borderRadius: '12px',
          border: `1px solid ${theme.border}`, background: theme.inputBg,
          padding: '14px 16px', fontSize: '14px', color: theme.textSecondary,
          lineHeight: '1.6', outline: 'none', fontFamily: 'inherit',
          opacity: isBlocked ? 0.6 : 1, transition: 'background 0.2s, border-color 0.2s, color 0.2s',
        }}
      />

      {/* Counter */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: theme.textMuted, marginBottom: '6px', transition: 'color 0.2s' }}>
          <span>Caracteres usados</span>
          <span>{charCount}/{MAX_CHARS}</span>
        </div>
        <div style={{ width: '100%', background: theme.border, borderRadius: '999px', height: '5px' }}>
          <div style={{ width: `${pct}%`, background: pct > 90 ? '#ef4444' : theme.accentBg, borderRadius: '999px', height: '5px', transition: 'width 0.2s' }} />
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div style={{ borderRadius: '10px', border: `1px solid ${theme.errorBorder}`, background: theme.errorBg, padding: '10px 14px', transition: 'all 0.2s' }}>
          <p style={{ fontSize: '13px', color: theme.errorText, margin: 0 }}>{errorMessage}</p>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={onClear}
          style={{
            padding: '9px 20px', borderRadius: '10px', border: `1px solid ${theme.border}`,
            background: theme.cardBg, fontSize: '14px', fontWeight: '500', color: theme.textMuted,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s, color 0.2s',
          }}
        >
          Limpiar
        </button>
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          style={{
            padding: '9px 20px', borderRadius: '10px', border: 'none',
            background: canGenerate ? theme.accentBg : theme.textMuted,
            fontSize: '14px', fontWeight: '500', color: theme.accentText,
            cursor: canGenerate ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}
        >
          {isLoading ? 'Generando...' : isBlocked ? 'En espera' : 'Generar texto'}
        </button>
      </div>
    </div>
  );
}
