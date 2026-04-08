import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import TextInputCard from '../components/TextInputCard';
import ToneSelectorCard from '../components/ToneSelectorCard';
import ResultCard from '../components/ResultCard';
import { rewriteText, getLimits } from '../services/api';
import { lightTheme, darkTheme } from '../theme';

const WINDOW_LIMIT = 8;
const DAILY_LIMIT  = 40;

export default function Home() {
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('darkMode') === 'true'; } catch { return false; }
  });

  const theme = darkMode ? darkTheme : lightTheme;

  // Sync <html> class and body bg for dark mode CSS selector + smooth bg transition
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    document.body.style.backgroundColor = theme.pageBg;
    document.body.style.color = theme.textPrimary;
    try { localStorage.setItem('darkMode', darkMode); } catch {}
  }, [darkMode, theme.pageBg, theme.textPrimary]);

  const toggleDark = () => setDarkMode(d => !d);

  // ── Form state ──
  const [inputText, setInputText]       = useState('');
  const [selectedTone, setSelectedTone] = useState('rewrite');
  const [intensity, setIntensity]       = useState(60);
  const [keepLength, setKeepLength]     = useState(true);
  const [extraInstruction, setExtra]    = useState('');

  // ── Result state ──
  const [generatedText, setGeneratedText]   = useState('');
  const [isLoading, setIsLoading]           = useState(false);
  const [errorMessage, setErrorMessage]     = useState('');
  const [processingTime, setProcessingTime] = useState(null);

  // ── Limit state (backend is source of truth) ──
  const [limits, setLimits] = useState({
    remainingWindow: WINDOW_LIMIT,
    remainingDaily:  DAILY_LIMIT,
    windowResetAt:   null,
    dailyResetAt:    null,
    blockedBy:       null,
  });

  const isBlocked = limits.blockedBy !== null;

  // Load initial limits from backend on mount
  useEffect(() => {
    getLimits().then(setLimits).catch(err => console.error('Error loading limits:', err));
  }, []);

  // Auto-clear block once reset time passes (client-side optimistic unlock)
  useEffect(() => {
    if (!isBlocked) return;
    const resetAt = limits.blockedBy === 'daily' ? limits.dailyResetAt : limits.windowResetAt;
    if (!resetAt) return;
    const delay = resetAt - Date.now();
    if (delay <= 0) { setLimits(prev => ({ ...prev, blockedBy: null })); return; }
    const tid = setTimeout(() => setLimits(prev => ({ ...prev, blockedBy: null })), delay);
    return () => clearTimeout(tid);
  }, [isBlocked, limits.blockedBy, limits.windowResetAt, limits.dailyResetAt]);

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim() || isLoading || isBlocked) return;
    setIsLoading(true);
    setErrorMessage('');
    setGeneratedText('');

    try {
      const data = await rewriteText({ text: inputText, tone: selectedTone, intensity, keepLength, extraInstruction });
      setGeneratedText(data.result);
      setProcessingTime((data.meta?.processingTimeMs / 1000).toFixed(1));
      if (data.limits) setLimits({ ...data.limits, blockedBy: null });
    } catch (err) {
      if (err.limits) {
        setLimits(err.limits);
      } else if (err.message?.includes('429') || err.message?.toLowerCase().includes('límite')) {
        setLimits(prev => ({ ...prev, remainingWindow: 0, blockedBy: 'window' }));
      }
      setErrorMessage(err.message || 'Error desconocido. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, selectedTone, intensity, keepLength, extraInstruction, isLoading, isBlocked]);

  const handleClear = () => {
    setInputText('');
    setGeneratedText('');
    setErrorMessage('');
    setProcessingTime(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.pageBg, padding: '40px 24px', transition: 'background 0.2s' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <Header
          limits={limits}
          windowLimit={WINDOW_LIMIT}
          dailyLimit={DAILY_LIMIT}
          darkMode={darkMode}
          onToggleDark={toggleDark}
          theme={theme}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px' }}>
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
