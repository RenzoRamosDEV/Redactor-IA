const TONES = [
  { id: 'rewrite', label: 'Mejorar redacción' },
  { id: 'formal',  label: 'Más formal' },
  { id: 'fun',     label: 'Más divertido' },
  { id: 'casual',  label: 'Más casual' },
  { id: 'professional', label: 'Más profesional' },
  { id: 'direct',  label: 'Más directo' },
  { id: 'persuasive', label: 'Más persuasivo' },
  { id: 'creative', label: 'Más creativo' },
];

export default function ToneSelectorCard({
  selectedTone = 'rewrite', onToneChange,
  intensity = 60, onIntensityChange,
  keepLength = true, onKeepLengthChange,
  extraInstruction = '', onExtraInstructionChange,
  theme = {},
}) {
  return (
    <div style={{
      background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow, padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '20px',
      transition: 'background 0.2s, border-color 0.2s',
    }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '17px', fontWeight: '600', color: theme.textPrimary, margin: 0, transition: 'color 0.2s' }}>Configuración del estilo</h2>
        <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px', transition: 'color 0.2s' }}>Elige cómo quieres que se vea el texto generado.</p>
      </div>

      {/* Tone grid */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary, marginBottom: '10px', transition: 'color 0.2s' }}>Tono principal</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {TONES.map(tone => {
            const active = selectedTone === tone.id;
            return (
              <button
                key={tone.id}
                onClick={() => onToneChange && onToneChange(tone.id)}
                style={{
                  padding: '10px 14px', borderRadius: '10px',
                  border: active ? `1px solid ${theme.accentBg}` : `1px solid ${theme.border}`,
                  background: active ? theme.accentBg : theme.cardBg,
                  color: active ? theme.accentText : theme.textSecondary,
                  fontSize: '13px', fontWeight: '500',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}
              >
                {tone.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Intensity slider */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary, marginBottom: '10px', transition: 'color 0.2s' }}>Nivel de intensidad</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: theme.textMuted, flexShrink: 0, transition: 'color 0.2s' }}>Suave</span>
          <input
            type="range" min={0} max={100} value={intensity}
            onChange={e => onIntensityChange && onIntensityChange(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', color: theme.textMuted, flexShrink: 0, transition: 'color 0.2s' }}>Alto</span>
        </div>
      </div>

      {/* Keep length */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: `1px dashed ${theme.border}`, borderRadius: '12px', padding: '14px 16px',
        transition: 'border-color 0.2s',
      }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary, margin: 0, transition: 'color 0.2s' }}>Mantener longitud</p>
          <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px', transition: 'color 0.2s' }}>Evita que el texto crezca demasiado</p>
        </div>
        <button
          onClick={() => onKeepLengthChange && onKeepLengthChange(!keepLength)}
          style={{
            position: 'relative', width: '44px', height: '24px',
            borderRadius: '999px', border: 'none', cursor: 'pointer',
            background: keepLength ? theme.accentBg : theme.toggleTrackOff,
            transition: 'background 0.2s', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: '4px',
            left: keepLength ? '24px' : '4px',
            width: '16px', height: '16px',
            borderRadius: '50%', background: '#fff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transition: 'left 0.2s',
          }} />
        </button>
      </div>

      {/* Extra instruction */}
      <div style={{ border: `1px dashed ${theme.border}`, borderRadius: '12px', padding: '14px 16px', transition: 'border-color 0.2s' }}>
        <p style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary, marginBottom: '8px', transition: 'color 0.2s' }}>Instrucción extra</p>
        <textarea
          value={extraInstruction}
          onChange={e => onExtraInstructionChange && onExtraInstructionChange(e.target.value)}
          rows={2} maxLength={200}
          placeholder="Ej.: Haz que suene más cercano y convincente, pero manteniendo un tono profesional."
          style={{
            width: '100%', resize: 'none', border: 'none', background: 'transparent',
            fontSize: '13px', color: theme.textSecondary, lineHeight: '1.5',
            outline: 'none', fontFamily: 'inherit', transition: 'color 0.2s',
          }}
        />
      </div>
    </div>
  );
}
