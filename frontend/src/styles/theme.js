/**
 * Sistema de temas (claro/oscuro) de la aplicación
 * 
 * Define los tokens de diseño para ambos modos de visualización.
 * Todos los componentes deben usar estos tokens en lugar de colores hardcodeados.
 * 
 * @module styles/theme
 */

/**
 * @typedef {Object} Theme
 * @property {string} pageBg - Color de fondo de la página
 * @property {string} cardBg - Color de fondo de tarjetas
 * @property {string} inputBg - Color de fondo de inputs
 * @property {string} subtleBg - Color de fondo sutil para áreas secundarias
 * @property {string} border - Color de bordes por defecto
 * @property {string} borderFocus - Color de bordes en estado focus
 * @property {string} textPrimary - Color de texto principal
 * @property {string} textSecondary - Color de texto secundario
 * @property {string} textMuted - Color de texto apagado/sutil
 * @property {string} textPlaceholder - Color de placeholders
 * @property {string} accentBg - Color de fondo de botones de acción
 * @property {string} accentText - Color de texto sobre accentBg
 * @property {string} successText - Color de texto de éxito
 * @property {string} successBg - Color de fondo de éxito
 * @property {string} successBorder - Color de borde de éxito
 * @property {string} errorText - Color de texto de error
 * @property {string} errorBg - Color de fondo de error
 * @property {string} errorBorder - Color de borde de error
 * @property {string} warnText - Color de texto de advertencia
 * @property {string} warnBg - Color de fondo de advertencia
 * @property {string} warnBorder - Color de borde de advertencia
 * @property {string} toggleTrackOff - Color de toggle en estado off
 * @property {string} shadow - Sombra por defecto
 * @property {string} shadowSm - Sombra pequeña
 */

/**
 * Tema claro (por defecto)
 * Basado en la paleta Slate de Tailwind CSS
 * @type {Theme}
 */
export const lightTheme = {
  // Fondos
  pageBg:        '#f1f5f9',  // slate-100
  cardBg:        '#ffffff',  // white
  inputBg:       '#f8fafc',  // slate-50
  subtleBg:      '#f8fafc',  // slate-50
  
  // Bordes
  border:        '#e2e8f0',  // slate-200
  borderFocus:   '#94a3b8',  // slate-400
  
  // Texto
  textPrimary:   '#0f172a',  // slate-900
  textSecondary: '#374151',  // gray-700
  textMuted:     '#64748b',  // slate-500
  textPlaceholder:'#94a3b8', // slate-400
  
  // Acento
  accentBg:      '#0f172a',  // slate-900
  accentText:    '#ffffff',  // white
  
  // Estados - Éxito
  successText:   '#16a34a',  // green-600
  successBg:     '#f0fdf4',  // green-50
  successBorder: '#bbf7d0',  // green-200
  
  // Estados - Error
  errorText:     '#dc2626',  // red-600
  errorBg:       '#fff5f5',  // red-50
  errorBorder:   '#fca5a5',  // red-300
  
  // Estados - Advertencia
  warnText:      '#d97706',  // amber-600
  warnBg:        '#fffbeb',  // amber-50
  warnBorder:    '#fde68a',  // amber-200
  
  // Miscelánea
  toggleTrackOff: '#cbd5e1', // slate-300
  shadow:         '0 1px 4px rgba(0,0,0,0.06)',
  shadowSm:       '0 1px 3px rgba(0,0,0,0.06)',
};

/**
 * Tema oscuro
 * Optimizado para reducir fatiga visual en ambientes con poca luz
 * @type {Theme}
 */
export const darkTheme = {
  // Fondos
  pageBg:        '#0f172a',  // slate-900
  cardBg:        '#1e293b',  // slate-800
  inputBg:       '#0f172a',  // slate-900
  subtleBg:      '#1e293b',  // slate-800
  
  // Bordes
  border:        '#334155',  // slate-700
  borderFocus:   '#475569',  // slate-600
  
  // Texto
  textPrimary:   '#f1f5f9',  // slate-100
  textSecondary: '#cbd5e1',  // slate-300
  textMuted:     '#94a3b8',  // slate-400
  textPlaceholder:'#475569', // slate-600
  
  // Acento
  accentBg:      '#f1f5f9',  // slate-100 (invertido)
  accentText:    '#0f172a',  // slate-900 (invertido)
  
  // Estados - Éxito
  successText:   '#4ade80',  // green-400
  successBg:     '#052e16',  // green-950
  successBorder: '#166534',  // green-800
  
  // Estados - Error
  errorText:     '#f87171',  // red-400
  errorBg:       '#450a0a',  // red-950
  errorBorder:   '#7f1d1d',  // red-900
  
  // Estados - Advertencia
  warnText:      '#fbbf24',  // amber-400
  warnBg:        '#451a03',  // amber-950
  warnBorder:    '#92400e',  // amber-800
  
  // Miscelánea
  toggleTrackOff: '#475569', // slate-600
  shadow:         '0 1px 4px rgba(0,0,0,0.3)',
  shadowSm:       '0 1px 3px rgba(0,0,0,0.3)',
};
