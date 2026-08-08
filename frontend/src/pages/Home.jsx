/**
 * Pantalla única de la aplicación.
 *
 * Mantiene el documento en edición (texto original, ajustes de estilo y
 * versiones generadas), habla con el backend y reparte el estado entre el
 * historial, el editor y el raíl de estilo.
 *
 * @module pages/Home
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '../components/AppHeader';
import HistoryRail from '../components/HistoryRail';
import DocumentHeader from '../components/DocumentHeader';
import SourceSection from '../components/SourceSection';
import ResultSection from '../components/ResultSection';
import StyleRail from '../components/StyleRail';
import { useDocuments } from '../hooks/useDocuments';
import { getLimits, rewriteText } from '../services/api';
import { deriveTitle } from '../utils/documents';
import {
  DAILY_LIMIT,
  DEFAULT_INTENSITY,
  DEFAULT_KEEP_LENGTH,
  DEFAULT_TONE,
  MAX_CHARS,
  WINDOW_LIMIT,
} from '../constants';

/** @constant {number} Espera antes de volcar el documento a localStorage */
const PERSIST_DELAY_MS = 700;

/**
 * Identificador de documento.
 * @returns {string}
 */
function createId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `doc-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

/**
 * Documento en blanco que hereda los ajustes de estilo actuales.
 *
 * @param {Object} [style] - Ajustes de estilo a conservar
 * @returns {Object}
 */
function createDraft(style) {
  const now = Date.now();

  return {
    id: createId(),
    title: '',
    customTitle: false,
    original: '',
    tone: style?.tone ?? DEFAULT_TONE,
    intensity: style?.intensity ?? DEFAULT_INTENSITY,
    keepLength: style?.keepLength ?? DEFAULT_KEEP_LENGTH,
    extraInstruction: style?.extraInstruction ?? '',
    versions: [],
    createdAt: now,
    updatedAt: now,
  };
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'es';

  const { documents, saveDocument } = useDocuments();

  const [doc, setDoc] = useState(createDraft);
  const [activeIndex, setActiveIndex] = useState(0);
  const [view, setView] = useState('result');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [limits, setLimits] = useState({
    remainingWindow: WINDOW_LIMIT,
    remainingDaily: DAILY_LIMIT,
    windowResetAt: null,
    dailyResetAt: null,
    blockedBy: null,
  });

  // El documento puede cambiar mientras una petición está en vuelo; guardamos
  // a cuál pertenece para no colgarle la versión al documento equivocado.
  const activeDocId = useRef(doc.id);
  activeDocId.current = doc.id;

  const isBlocked = limits.blockedBy !== null;

  // El nombre lo pone la IA en la primera reformulación y el usuario puede
  // cambiarlo. Hasta entonces se deriva del propio texto, para no dejar el
  // documento sin nombre mientras se escribe.
  const title = doc.title || deriveTitle(doc.original, t('document.untitled'));

  const usage = {
    windowUsed: Math.min(
      WINDOW_LIMIT,
      Math.max(0, WINDOW_LIMIT - limits.remainingWindow)
    ),
    windowLimit: WINDOW_LIMIT,
    dailyUsed: Math.min(
      DAILY_LIMIT,
      Math.max(0, DAILY_LIMIT - limits.remainingDaily)
    ),
    dailyLimit: DAILY_LIMIT,
  };

  const canGenerate =
    Boolean(doc.original.trim()) &&
    doc.original.length <= MAX_CHARS &&
    !isLoading &&
    !isBlocked;

  // ── Límites ────────────────────────────────────────────────────────────

  /** Estado inicial de límites: la fuente de verdad es el backend. */
  useEffect(() => {
    getLimits()
      .then(setLimits)
      .catch(() => {
        /* si el backend no responde, se mantienen los valores optimistas */
      });
  }, []);

  /** Desbloqueo optimista en cuanto vence el tramo (o el día). */
  useEffect(() => {
    if (!isBlocked) return;

    const resetAt =
      limits.blockedBy === 'daily' ? limits.dailyResetAt : limits.windowResetAt;
    if (!resetAt) return;

    const delay = Math.max(0, resetAt - Date.now());
    const timeoutId = setTimeout(() => {
      setLimits(prev => ({ ...prev, blockedBy: null }));
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [isBlocked, limits.blockedBy, limits.windowResetAt, limits.dailyResetAt]);

  // ── Persistencia ───────────────────────────────────────────────────────

  /** Solo se guardan documentos con algún resultado, y con algo de retardo. */
  useEffect(() => {
    if (doc.versions.length === 0) return;

    const timeoutId = setTimeout(() => {
      saveDocument({ ...doc, title });
    }, PERSIST_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [doc, title, saveDocument]);

  // ── Acciones ───────────────────────────────────────────────────────────

  /**
   * Aplica cambios parciales al documento en edición.
   * @param {Object} patch - Campos a sobrescribir
   */
  const updateDoc = useCallback(patch => {
    setDoc(prev => ({ ...prev, ...patch }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    const requestDocId = doc.id;
    const request = {
      text: doc.original,
      tone: doc.tone,
      intensity: doc.intensity,
      keepLength: doc.keepLength,
      extraInstruction: doc.extraInstruction,
      // Solo en la primera reformulación del documento, y nunca si el usuario
      // ya le ha puesto nombre a mano.
      needsTitle: doc.versions.length === 0 && !doc.customTitle,
    };

    setIsLoading(true);
    setError('');
    setView('result');

    try {
      const data = await rewriteText(request);

      if (data.limits) setLimits({ ...data.limits, blockedBy: null });

      // Se cambió de documento mientras respondía la IA: el resultado ya no
      // corresponde a lo que hay en pantalla.
      if (activeDocId.current !== requestDocId) return;

      const version = {
        text: data.result,
        original: request.text,
        tone: request.tone,
        intensity: request.intensity,
        keepLength: request.keepLength,
        extraInstruction: request.extraInstruction,
        processingTimeMs: data.meta?.processingTimeMs ?? null,
        createdAt: Date.now(),
      };

      setDoc(prev => ({
        ...prev,
        // Un rename manual siempre gana al nombre propuesto por la IA
        title:
          data.meta?.title && !prev.customTitle ? data.meta.title : prev.title,
        versions: [...prev.versions, version],
        updatedAt: Date.now(),
      }));
      setActiveIndex(doc.versions.length);
    } catch (err) {
      if (err.limits) setLimits(err.limits);
      if (activeDocId.current === requestDocId) {
        setError(
          err.isNetworkError
            ? t('errors.network')
            : err.message || t('errors.generic')
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [canGenerate, doc, t]);

  const handleSelectDocument = useCallback(
    id => {
      const stored = documents.find(d => d.id === id);
      if (!stored) return;

      setDoc(stored);
      setActiveIndex(Math.max(0, stored.versions.length - 1));
      setView('result');
      setError('');
      setDrawerOpen(false);
    },
    [documents]
  );

  const handleNewDocument = useCallback(() => {
    setDoc(current => createDraft(current));
    setActiveIndex(0);
    setView('result');
    setError('');
    setDrawerOpen(false);
  }, []);

  const handleClear = useCallback(() => {
    updateDoc({ original: '' });
    setError('');
  }, [updateDoc]);

  const handleRename = useCallback(
    newTitle => {
      updateDoc({ title: newTitle, customTitle: true, updatedAt: Date.now() });
    },
    [updateDoc]
  );

  const handleUseAsSource = useCallback(
    text => {
      updateDoc({ original: text });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateDoc]
  );

  // ── Presentación ───────────────────────────────────────────────────────

  const secondsFormat = useMemo(
    () =>
      new Intl.NumberFormat(language, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [language]
  );

  /**
   * Línea de metadatos de una versión: "1,4 s · profesional · intensidad 60".
   */
  const formatMeta = useCallback(
    version =>
      [
        version.processingTimeMs != null &&
          t('result.metaSeconds', {
            seconds: secondsFormat.format(version.processingTimeMs / 1000),
          }),
        t(`tones.short.${version.tone}`).toLowerCase(),
        t('result.metaIntensity', { value: version.intensity }),
      ]
        .filter(Boolean)
        .join(' · '),
    [t, secondsFormat]
  );

  const blockedNotice = isBlocked
    ? limits.blockedBy === 'daily'
      ? t('notice.dailyBlocked', { count: DAILY_LIMIT })
      : t('notice.windowBlocked', { count: WINDOW_LIMIT })
    : '';

  /** El cajón del historial se cierra con Escape. */
  useEffect(() => {
    if (!drawerOpen) return;

    const onKeyDown = event => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <div className={`app${drawerOpen ? ' app--drawer-open' : ''}`}>
      <AppHeader
        drawerOpen={drawerOpen}
        onToggleDrawer={() => setDrawerOpen(open => !open)}
      />

      <div className="app-shell">
        <HistoryRail
          documents={documents}
          activeId={doc.id}
          onSelect={handleSelectDocument}
          onNew={handleNewDocument}
        />

        <div
          className="drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />

        <main className="editor">
          <DocumentHeader title={title} onRename={handleRename} />

          <SourceSection
            value={doc.original}
            onChange={original => updateDoc({ original })}
            onGenerate={handleGenerate}
            onClear={handleClear}
            isLoading={isLoading}
            canGenerate={canGenerate}
          />

          <ResultSection
            versions={doc.versions}
            activeIndex={activeIndex}
            onSelectVersion={setActiveIndex}
            view={view}
            onViewChange={setView}
            isLoading={isLoading}
            error={error}
            blockedNotice={blockedNotice}
            onUseAsSource={handleUseAsSource}
            onGenerate={handleGenerate}
            canGenerate={canGenerate}
            formatMeta={formatMeta}
          />
        </main>

        <StyleRail
          tone={doc.tone}
          onToneChange={tone => updateDoc({ tone })}
          intensity={doc.intensity}
          onIntensityChange={intensity => updateDoc({ intensity })}
          keepLength={doc.keepLength}
          onKeepLengthChange={keepLength => updateDoc({ keepLength })}
          extraInstruction={doc.extraInstruction}
          onExtraInstructionChange={extraInstruction =>
            updateDoc({ extraInstruction })
          }
          usage={usage}
          limits={limits}
        />
      </div>
    </div>
  );
}
