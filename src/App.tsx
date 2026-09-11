import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { AnalysisStatus, AuditResult, ScreenTab, ThemeMode } from './types';
import { Header, tabLabel } from './components/Header';
import { BottomNav, Sidebar } from './components/BottomNav';
import { ScanScreen } from './components/ScanScreen';
import { AnalysisScreen } from './components/AnalysisScreen';
import { ShareDossierScreen } from './components/ShareDossierScreen';
import { GrievanceScreen, type GrievanceDraft } from './components/GrievanceScreen';
import { PatternsScreen } from './components/PatternsScreen';
import { HelplineModal } from './components/HelplineModal';
import { analyzeImage, checkHealth, friendlyError, type HealthResponse } from './lib/api';
import { fetchImageAsDataUrl, isLowBandwidth, readFileAsDataUrl } from './lib/image';
import { loadRecent, removeRecent } from './lib/storage';
import { tokens } from './lib/theme';

const THEME_KEY = 'snitch_theme';

function initialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* ignore */
  }
  // First visit: follow the system preference.
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('scan');
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const t = tokens(theme);

  // ---- live analysis state (nothing pre-loaded) ----
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [statusLabel, setStatusLabel] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lastSource, setLastSource] = useState<File | string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<AuditResult[]>(() => loadRecent());
  const [draft, setDraft] = useState<GrievanceDraft | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);
  const [online, setOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [lowBw, setLowBw] = useState<boolean>(() => isLowBandwidth());
  const runRef = useRef(0);

  useEffect(() => {
    const updateNet = () => {
      setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
      setLowBw(isLowBandwidth());
    };
    window.addEventListener('online', updateNet);
    window.addEventListener('offline', updateNet);
    const conn = (navigator as any)?.connection || (navigator as any)?.mozConnection || (navigator as any)?.webkitConnection;
    conn?.addEventListener?.('change', updateNet);
    return () => {
      window.removeEventListener('online', updateNet);
      window.removeEventListener('offline', updateNet);
      conn?.removeEventListener?.('change', updateNet);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    checkHealth().then(setHealth);
  }, []);

  const go = useCallback((tab: ScreenTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /** Run a live analysis on a File or an image URL/data URL. */
  const runAnalysis = useCallback(
    async (src: File | string, label: string, force = false) => {
      const run = ++runRef.current;
      setLastSource(src);
      setError(null);
      setStatus('analyzing');
      setStatusLabel(`Preparing ${label}…`);
      setResult(null);
      setDraft(null);
      go('analysis');

      try {
        // Show the preview as early as possible.
        let dataUrl: string;
        if (typeof src === 'string') {
          dataUrl = src.startsWith('data:') ? src : await fetchImageAsDataUrl(src);
        } else {
          dataUrl = await readFileAsDataUrl(src);
        }
        if (run !== runRef.current) return;
        setPreviewImage(dataUrl);

        const res = await analyzeImage(dataUrl, {
          force,
          onStatus: (l) => run === runRef.current && setStatusLabel(l),
        });
        if (run !== runRef.current) return;
        setResult(res);
        setStatus('done');
        setRecent(loadRecent());
      } catch (err: any) {
        if (run !== runRef.current) return;
        setError(friendlyError(err));
        setStatus('error');
      }
    },
    [go],
  );

  const cancelAnalysis = () => {
    runRef.current++;
    setStatus(result ? 'done' : 'idle');
    setStatusLabel('');
    go('scan');
  };

  const openRecent = (r: AuditResult) => {
    runRef.current++;
    setResult({ ...r, cached: true });
    setPreviewImage(r.imageDataUrl);
    setLastSource(r.imageDataUrl);
    setError(null);
    setStatus('done');
    setDraft(null);
    go('analysis');
  };

  const handleRemoveRecent = (id: string) => {
    removeRecent(id);
    setRecent(loadRecent());
  };

  const apiLabel = health ? (health.configured ? 'Live analysis' : 'Scanning unavailable') : 'Checking…';
  const findingsCount = status === 'done' && result ? result.findings.length : 0;

  return (
    <div className={`min-h-dvh font-sans transition-colors duration-200 motion-reduce:transition-none lg:flex ${t.page}`}>
      <Sidebar
        currentTab={currentTab}
        theme={theme}
        onSelectTab={go}
        findingsCount={findingsCount}
        onToggleTheme={() => setTheme((p) => (p === 'dark' ? 'light' : 'dark'))}
        onHelplineClick={() => setIsHelplineOpen(true)}
        apiLabel={apiLabel}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header currentTab={currentTab} theme={theme} onToggleTheme={() => setTheme((p) => (p === 'dark' ? 'light' : 'dark'))} onHelplineClick={() => setIsHelplineOpen(true)} />

        {/* Desktop page title row */}
        <div className={`hidden lg:flex items-center justify-between px-8 pt-6 max-w-6xl w-full mx-auto`}>
          <span className={`font-citation-badge text-citation-badge uppercase tracking-wider font-semibold ${t.dim}`}>{tabLabel(currentTab)}</span>
          <span className={`px-2 py-[3px] rounded border font-citation-badge text-citation-badge uppercase font-semibold ${health ? (health.configured ? t.tealSoft : t.amberSoft) : t.neutralSoft}`}>{apiLabel}</span>
        </div>

        {/* Dynamic bottom padding for mobile:
            When on AnalysisScreen with findings, fixed bottom chrome is 132px+ (BottomNav + Action Bar).
            We allocate 11.5rem (~184px) + safe-area so the regulatory footer letters are never cut off.
            On other tabs, 6.5rem (~104px) + safe-area clears the 64px BottomNav with ample 40px clearance. */}
        <main
          id="main"
          className={`flex-1 w-full max-w-lg md:max-w-2xl lg:max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-20 lg:pt-6 ${
            currentTab === 'analysis' && status === 'done' && (result?.findings?.length ?? 0) > 0
              ? 'pb-[calc(11.5rem+env(safe-area-inset-bottom,0px))] landscape:pb-[calc(9.5rem+env(safe-area-inset-bottom,0px))] lg:pb-10'
              : 'pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] landscape:pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-10'
          } landscape:pt-[4.5rem]`}
        >
          {/* Offline / Low-Bandwidth Status Banner */}
          {!online && (
            <div role="status" className="mb-4 rounded-xl bg-[#FF7043]/15 border border-[#FF7043]/30 px-3.5 py-2.5 text-[12px] font-semibold text-[#FF7043] flex items-center gap-2.5 shadow-sm">
              <span className="material-symbols-outlined text-[20px] shrink-0" aria-hidden="true">wifi_off</span>
              <div className="flex flex-col">
                <span className="font-bold">Offline mode active</span>
                <span className="text-[11px] font-normal opacity-90">13 CCPA guidelines, grievance drafting, and previous scans remain fully usable offline.</span>
              </div>
            </div>
          )}
          {online && lowBw && (
            <div role="status" className="mb-4 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/25 px-3.5 py-2 text-[11px] font-citation-code text-[#2DD4BF] flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[16px] shrink-0" aria-hidden="true">speed</span>
              <span>Low-bandwidth network · Adaptive screenshot compression active (saving ~75% data)</span>
            </div>
          )}
          {currentTab === 'scan' && (
            <ScanScreen
              theme={theme}
              status={status}
              statusLabel={statusLabel}
              error={error}
              recent={recent}
              health={health}
              onAnalyze={(src, label) => runAnalysis(src, label)}
              onOpenRecent={openRecent}
              onRemoveRecent={handleRemoveRecent}
              onDismissError={() => {
                setError(null);
                setStatus(result ? 'done' : 'idle');
              }}
            />
          )}

          {currentTab === 'analysis' && (
            <AnalysisScreen
              theme={theme}
              status={status}
              statusLabel={statusLabel}
              previewImage={previewImage}
              result={result}
              error={error}
              onCancel={cancelAnalysis}
              onGoToScan={() => go('scan')}
              onReanalyze={() => lastSource && runAnalysis(lastSource, 'screenshot', true)}
              onGoToGrievance={() => go('grievance')}
              onGoToShare={() => go('share-dossier')}
            />
          )}

          {currentTab === 'share-dossier' && (
            <ShareDossierScreen theme={theme} result={status === 'done' ? result : null} onBackToAnalysis={() => go('analysis')} onGoToGrievance={() => go('grievance')} onGoToScan={() => go('scan')} />
          )}

          {currentTab === 'grievance' && (
            <GrievanceScreen
              theme={theme}
              result={status === 'done' ? result : null}
              draft={draft}
              onDraftChange={setDraft}
              onGoToAnalysis={() => go('analysis')}
              onGoToScan={() => go('scan')}
              onOpenHelpline={() => setIsHelplineOpen(true)}
            />
          )}

          {currentTab === '13-patterns' && <PatternsScreen theme={theme} onAuditPattern={() => go('scan')} />}

          <footer className={`mt-8 pt-4 border-t font-citation-code text-[11px] leading-snug ${t.border} ${t.dim}`}>
            Snitch helps you describe what you saw in the words the regulator already published. It is not legal advice and it never files anything on your behalf.
          </footer>
        </main>

        <BottomNav currentTab={currentTab} theme={theme} onSelectTab={go} findingsCount={findingsCount} />
      </div>

      <HelplineModal isOpen={isHelplineOpen} theme={theme} onClose={() => setIsHelplineOpen(false)} />
    </div>
  );
};

export default App;
