import { MAX_CHARS } from '../constants';

/**
 * Tarjeta de entrada de texto con validación de caracteres y controles.
 * Incluye textarea, contador de caracteres con barra de progreso, estado de bloqueo, y botones de limpiar/generar.
 * 
 * @param {Object} props - Props del componente
 * @param {string} [props.inputText=''] - Texto actual del usuario
 * @param {Function} props.onInputChange - Callback cuando cambia el texto: (newText: string) => void
 * @param {Function} props.onClear - Callback para limpiar el texto
 * @param {Function} props.onGenerate - Callback para generar texto con IA
 * @param {boolean} [props.isLoading=false] - Si está generando texto
 * @param {boolean} [props.isBlocked=false] - Si el usuario está bloqueado por límites
 * @param {string} [props.errorMessage=''] - Mensaje de error a mostrar
 * @param {Object} [props.theme={}] - Objeto de tema (lightTheme o darkTheme)
 * 
 * @returns {JSX.Element} TextInputCard component
 * 
 * @example
 * <TextInputCard
 *   inputText={text}
 *   onInputChange={setText}
 *   onClear={() => setText('')}
 *   onGenerate={handleGenerate}
 *   isLoading={loading}
 *   isBlocked={limits.blockedBy !== null}
 *   theme={currentTheme}
 * />
 */
export default function TextInputCard({ inputText = '', onInputChange, onClear, onGenerate, isLoading = false, isBlocked = false, errorMessage = '', theme = {} }) {
  // Cálculos de progreso y validación
  const charCount = inputText.length;
  const pct = Math.min((charCount / MAX_CHARS) * 100, 100);
  const exceedsLimit = charCount > MAX_CHARS;
  const canGenerate = !isLoading && !isBlocked && charCount > 0 && !exceedsLimit;

  return (
    <div style={{
      background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow, padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '16px',
      transition: 'background 0.2s, border-color 0.2s',
    }}>
      
      {/* ========== HEADER: TÍTULO + BADGE DE ESTADO ========== */}
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

      {/* ========== TEXTAREA ========== */}
      <textarea
        value={inputText}
        onChange={e => onInputChange && onInputChange(e.target.value)}
        rows={6}
        placeholder="Escribe o pega tu texto aquí..."
        disabled={isBlocked}
        style={{
          width: '100%', resize: 'none', borderRadius: '12px',
          border: `1px solid ${exceedsLimit ? theme.errorBorder : theme.border}`, 
          background: theme.inputBg,
          padding: '14px 16px', fontSize: '14px', color: theme.textSecondary,
          lineHeight: '1.6', outline: 'none', fontFamily: 'inherit',
          opacity: isBlocked ? 0.6 : 1, transition: 'background 0.2s, border-color 0.2s, color 0.2s',
        }}
      />

      {/* ========== CONTADOR DE CARACTERES Y BARRA DE PROGRESO ========== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: exceedsLimit ? theme.errorText : theme.textMuted, marginBottom: '6px', transition: 'color 0.2s' }}>
          <span>{exceedsLimit ? 'Límite excedido' : 'Caracteres usados'}</span>
          <span style={{ fontWeight: exceedsLimit ? '600' : '400' }}>{charCount}/{MAX_CHARS}</span>
        </div>
        <div style={{ width: '100%', background: theme.border, borderRadius: '999px', height: '5px' }}>
          <div style={{ width: `${Math.min(pct, 100)}%`, background: exceedsLimit ? '#ef4444' : theme.accentBg, borderRadius: '999px', height: '5px', transition: 'width 0.2s, background 0.2s' }} />
        </div>
        {exceedsLimit && (
          <p style={{ fontSize: '11px', color: theme.errorText, marginTop: '6px', marginBottom: 0 }}>
            Reduce el texto en {charCount - MAX_CHARS} caracteres para poder generar.
          </p>
        )}
      </div>

      {/* ========== MENSAJE DE ERROR ========== */}
      {errorMessage && (
        <div style={{ borderRadius: '10px', border: `1px solid ${theme.errorBorder}`, background: theme.errorBg, padding: '10px 14px', transition: 'all 0.2s' }}>
          <p style={{ fontSize: '13px', color: theme.errorText, margin: 0 }}>{errorMessage}</p>
        </div>
      )}

      {/* ========== BOTONES: LIMPIAR + GENERAR ========== */}
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
          {isLoading ? 'Generando...' : isBlocked ? 'En espera' : exceedsLimit ? 'Texto muy largo' : 'Generar texto'}
        </button>
      </div>
    </div>
  );
}
