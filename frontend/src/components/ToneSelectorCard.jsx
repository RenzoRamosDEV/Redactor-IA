import { useTranslation } from 'react-i18next';
import { TONES, DEFAULT_TONE, DEFAULT_INTENSITY, DEFAULT_KEEP_LENGTH, DEFAULT_EXTRA_INSTRUCTION } from '../constants';

/**
 * Tarjeta de selección de tono y configuración de estilo.
 * Incluye grid de tonos, slider de intensidad, toggle de mantener longitud, y textarea para instrucción extra.
 * 
 * @param {Object} props - Props del componente
 * @param {string} [props.selectedTone='rewrite'] - ID del tono seleccionado
 * @param {Function} props.onToneChange - Callback cuando cambia el tono: (toneId: string) => void
 * @param {number} [props.intensity=60] - Nivel de intensidad del tono (0-100)
 * @param {Function} props.onIntensityChange - Callback cuando cambia intensidad: (value: number) => void
 * @param {boolean} [props.keepLength=true] - Si se debe mantener longitud similar al original
 * @param {Function} props.onKeepLengthChange - Callback cuando cambia keepLength: (value: boolean) => void
 * @param {string} [props.extraInstruction=''] - Instrucción adicional para la IA (max 200 chars)
 * @param {Function} props.onExtraInstructionChange - Callback cuando cambia instrucción: (text: string) => void
 * @param {Object} [props.theme={}] - Objeto de tema (lightTheme o darkTheme)
 * 
 * @returns {JSX.Element} ToneSelectorCard component
 * 
 * @example
 * <ToneSelectorCard
 *   selectedTone={tone}
 *   onToneChange={setTone}
 *   intensity={intensity}
 *   onIntensityChange={setIntensity}
 *   keepLength={keepLength}
 *   onKeepLengthChange={setKeepLength}
 *   extraInstruction={extra}
 *   onExtraInstructionChange={setExtra}
 *   theme={currentTheme}
 * />
 */
export default function ToneSelectorCard({
  selectedTone = DEFAULT_TONE, onToneChange,
  intensity = DEFAULT_INTENSITY, onIntensityChange,
  keepLength = DEFAULT_KEEP_LENGTH, onKeepLengthChange,
  extraInstruction = DEFAULT_EXTRA_INSTRUCTION, onExtraInstructionChange,
  theme = {},
}) {
  // Hook de traducción
  const { t } = useTranslation();
  
  return (
    <div style={{
      background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow, padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '20px',
      transition: 'background 0.2s, border-color 0.2s',
    }}>
      
      {/* ========== HEADER ========== */}
      <div>
        <h2 style={{ fontSize: '17px', fontWeight: '600', color: theme.textPrimary, margin: 0, transition: 'color 0.2s' }}>{t('toneSelector.title')}</h2>
        <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px', transition: 'color 0.2s' }}>{t('toneSelector.subtitle')}</p>
      </div>

      {/* ========== GRID DE TONOS ========== */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary, marginBottom: '10px', transition: 'color 0.2s' }}>{t('toneSelector.mainTone')}</p>
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
                {t(`tones.${tone.id}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========== SLIDER DE INTENSIDAD ========== */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary, marginBottom: '10px', transition: 'color 0.2s' }}>{t('toneSelector.intensityLevel')}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: theme.textMuted, flexShrink: 0, transition: 'color 0.2s' }}>{t('toneSelector.intensitySoft')}</span>
          <input
            type="range" min={0} max={100} value={intensity}
            onChange={e => onIntensityChange && onIntensityChange(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', color: theme.textMuted, flexShrink: 0, transition: 'color 0.2s' }}>{t('toneSelector.intensityHigh')}</span>
        </div>
      </div>

      {/* ========== TOGGLE MANTENER LONGITUD ========== */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: `1px dashed ${theme.border}`, borderRadius: '12px', padding: '14px 16px',
        transition: 'border-color 0.2s',
      }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary, margin: 0, transition: 'color 0.2s' }}>{t('toneSelector.keepLengthTitle')}</p>
          <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px', transition: 'color 0.2s' }}>{t('toneSelector.keepLengthDesc')}</p>
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

      {/* ========== INSTRUCCIÓN EXTRA ========== */}
      <div style={{ border: `1px dashed ${theme.border}`, borderRadius: '12px', padding: '14px 16px', transition: 'border-color 0.2s' }}>
        <p style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary, marginBottom: '8px', transition: 'color 0.2s' }}>{t('toneSelector.extraInstructionTitle')}</p>
        <textarea
          value={extraInstruction}
          onChange={e => onExtraInstructionChange && onExtraInstructionChange(e.target.value)}
          rows={2} maxLength={200}
          placeholder={t('toneSelector.extraInstructionPlaceholder')}
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
