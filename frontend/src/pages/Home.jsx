/**
 * Página principal de la aplicación de reformulación de texto
 * 
 * Gestiona el estado global de la aplicación incluyendo:
 * - Formulario de entrada de texto
 * - Configuración de tono e intensidad
 * - Límites de uso (ventana 15min y diario)
 * - Modo oscuro/claro
 * - Resultados de la IA
 * 
 * @module pages/Home
 */

import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import TextInputCard from '../components/TextInputCard';
import ToneSelectorCard from '../components/ToneSelectorCard';
import ResultCard from '../components/ResultCard';
import { rewriteText, getLimits } from '../services/api';
import { lightTheme, darkTheme } from '../styles/theme';
import { WINDOW_LIMIT, DAILY_LIMIT, DEFAULT_INTENSITY, DEFAULT_KEEP_LENGTH } from '../constants';

/**
 * Componente principal de la aplicación
 * Orquesta todos los componentes y gestiona el estado compartido
 */
export default function Home() {
  // ──────────────────────────────────────────────────────────────
  // Estado: Modo oscuro
  // ──────────────────────────────────────────────────────────────
  
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('darkMode') === 'true';
    } catch {
      return false;
    }
  });

  const theme = darkMode ? darkTheme : lightTheme;

  /**
   * Sincroniza el modo oscuro con el DOM y localStorage
   */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    document.body.style.backgroundColor = theme.pageBg;
    document.body.style.color = theme.textPrimary;
    
    try {
      localStorage.setItem('darkMode', darkMode);
    } catch {
      // Ignorar error de localStorage en modo privado
    }
  }, [darkMode, theme.pageBg, theme.textPrimary]);

  const toggleDark = () => setDarkMode(d => !d);

  // ──────────────────────────────────────────────────────────────
  // Estado: Formulario de entrada
  // ──────────────────────────────────────────────────────────────
  
  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('rewrite');
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY);
  const [keepLength, setKeepLength] = useState(DEFAULT_KEEP_LENGTH);
  const [extraInstruction, setExtra] = useState('');

  // ──────────────────────────────────────────────────────────────
  // Estado: Resultado de la IA
  // ──────────────────────────────────────────────────────────────
  
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingTime, setProcessingTime] = useState(null);

  // ──────────────────────────────────────────────────────────────
  // Estado: Límites de uso (fuente de verdad: backend)
  // ──────────────────────────────────────────────────────────────
  
  const [limits, setLimits] = useState({
    remainingWindow: WINDOW_LIMIT,
    remainingDaily: DAILY_LIMIT,
    windowResetAt: null,
    dailyResetAt: null,
    blockedBy: null,
  });

  const isBlocked = limits.blockedBy !== null;

  /**
   * Carga el estado inicial de límites desde el backend
   * Se ejecuta una vez al montar el componente
   */
  useEffect(() => {
    getLimits()
      .then(setLimits)
      .catch(err => console.error('Error loading limits:', err));
  }, []);

  /**
   * Auto-desbloqueo cuando expira el tiempo de cooldown
   * Optimista: desbloquea en el cliente antes de la próxima petición
   */
  useEffect(() => {
    if (!isBlocked) return;
    
    const resetAt = limits.blockedBy === 'daily'
      ? limits.dailyResetAt
      : limits.windowResetAt;
    
    if (!resetAt) return;
    
    const delay = resetAt - Date.now();
    
    if (delay <= 0) {
      setLimits(prev => ({ ...prev, blockedBy: null }));
      return;
    }
    
    const timeoutId = setTimeout(() => {
      setLimits(prev => ({ ...prev, blockedBy: null }));
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [isBlocked, limits.blockedBy, limits.windowResetAt, limits.dailyResetAt]);

  // ──────────────────────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────────────────────
  
  /**
   * Envía el texto al backend para ser reformulado
   * Actualiza el estado de límites con la respuesta del servidor
   */
  const handleGenerate = useCallback(async () => {
    if (!inputText.trim() || isLoading || isBlocked) return;
    
    setIsLoading(true);
    setErrorMessage('');
    setGeneratedText('');

    try {
      const data = await rewriteText({
        text: inputText,
        tone: selectedTone,
        intensity,
        keepLength,
        extraInstruction,
      });
      
      setGeneratedText(data.result);
      setProcessingTime((data.meta?.processingTimeMs / 1000).toFixed(1));
      
      // Actualizar límites desde la respuesta del servidor
      if (data.limits) {
        setLimits({ ...data.limits, blockedBy: null });
      }
    } catch (err) {
      // Error de límite alcanzado (429)
      if (err.limits) {
        setLimits(err.limits);
      } else if (err.message?.includes('429') || err.message?.toLowerCase().includes('límite')) {
        // Fallback: marcar como bloqueado si no viene el estado
        setLimits(prev => ({ ...prev, remainingWindow: 0, blockedBy: 'window' }));
      }
      
      setErrorMessage(err.message || 'Error desconocido. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, selectedTone, intensity, keepLength, extraInstruction, isLoading, isBlocked]);

  /**
   * Limpia el formulario y los resultados
   */
  const handleClear = () => {
    setInputText('');
    setGeneratedText('');
    setErrorMessage('');
    setProcessingTime(null);
  };

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────
  
  return (
    <div style={{
      minHeight: '100vh',
      background: theme.pageBg,
      padding: '40px 24px',
      transition: 'background 0.2s',
    }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        {/* Cabecera con contadores y toggle de modo oscuro */}
        <Header
          limits={limits}
          windowLimit={WINDOW_LIMIT}
          dailyLimit={DAILY_LIMIT}
          darkMode={darkMode}
          onToggleDark={toggleDark}
          theme={theme}
        />

        {/* Grid de entrada y configuración */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
          marginBottom: '20px',
        }}>
          {/* Tarjeta de entrada de texto */}
          <TextInputCard
            inputText={inputText}
            onInputChange={setInputText}
            onClear={handleClear}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            isBlocked={isBlocked}
            errorMessage={errorMessage}
            theme={theme}
          />
          
          {/* Tarjeta de configuración de tono */}
          <ToneSelectorCard
            selectedTone={selectedTone}
            onToneChange={setSelectedTone}
            intensity={intensity}
            onIntensityChange={setIntensity}
            keepLength={keepLength}
            onKeepLengthChange={setKeepLength}
            extraInstruction={extraInstruction}
            onExtraInstructionChange={setExtra}
            theme={theme}
          />
        </div>

        {/* Tarjeta de resultado */}
        <ResultCard
          generatedText={generatedText}
          isLoading={isLoading}
          selectedTone={selectedTone}
          processingTime={processingTime}
          limits={limits}
          windowLimit={WINDOW_LIMIT}
          dailyLimit={DAILY_LIMIT}
          theme={theme}
        />
      </div>
    </div>
  );
}
