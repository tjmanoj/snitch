import React, { useEffect, useRef, useState } from 'react';
import type { AnalysisStatus, AuditResult, ThemeMode } from '../types';
import { tokens } from '../lib/theme';
import { SAMPLES } from '../lib/samples';
import type { HealthResponse } from '../lib/api';

interface ScanScreenProps {
  theme: ThemeMode;
  status: AnalysisStatus;
  statusLabel: string;
  error: string | null;
  recent: AuditResult[];
  health: HealthResponse | null;
  onAnalyze: (src: File | string, label: string) => void;
  onOpenRecent: (result: AuditResult) => void;
  onRemoveRecent: (id: string) => void;
  onDismissError: () => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({
  theme,
  status,
  statusLabel,
  error,
  recent,
  health,
  onAnalyze,
  onOpenRecent,
  onRemoveRecent,
  onDismissError,
}) => {
  const t = tokens(theme);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteHint, setPasteHint] = useState<string | null>(null);
  const busy = status === 'analyzing';

  // Ctrl/Cmd+V anywhere on this screen analyses the clipboard image.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (busy) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            onAnalyze(file, 'Pasted screenshot');
            return;
          }
        }
      }
      setPasteHint('No image in the clipboard. Copy a screenshot first, then paste.');
      setTimeout(() => setPasteHint(null), 2500);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [busy, onAnalyze]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPasteHint('That file is not an image. Please choose a PNG or JPG screenshot.');
      setTimeout(() => setPasteHint(null), 3000);
      return;
    }
    onAnalyze(file, file.name);
  };

  const handlePasteButton = async () => {
    try {
      if (navigator.clipboard && 'read' in navigator.clipboard) {
        const items = await (navigator.clipboard as any).read();
        for (const item of items) {
          const imageType = (item.types as string[]).find((ty) => ty.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            onAnalyze(new File([blob], 'clipboard.png', { type: imageType }), 'Pasted screenshot');
            return;
          }
        }
        setPasteHint('No image in the clipboard. Copy a screenshot first, then paste.');
      } else {
        setPasteHint('Your browser blocks clipboard reading. Press Ctrl+V / ⌘V instead.');
      }
    } catch {
      setPasteHint('Clipboard permission was denied. Press Ctrl+V / ⌘V instead.');
    }
    setTimeout(() => setPasteHint(null), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-6 gap-4 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8 lg:items-start">
      {/* ------------------------------------------------------------ LEFT: hero + drop zone */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-6">
        {/* Regulatory Status Badge Strip */}
        <div className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border shadow-sm ${t.card}`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75 motion-reduce:hidden"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]"></span>
            </span>
            <span className={`font-citation-badge text-citation-badge tracking-wider uppercase font-semibold truncate ${t.muted}`}>
              India · CCPA Guidelines on Dark Patterns, 2023
            </span>
          </div>
          <span className={`shrink-0 px-2 py-[2px] font-citation-badge text-citation-badge uppercase rounded font-bold border ${health ? (health.configured ? t.tealSoft : t.amberSoft) : t.neutralSoft}`}>
            {health ? (health.configured ? `Live · ${health.model}` : 'API key missing') : 'Connecting…'}
          </span>
        </div>

        {/* Hero */}
        <div className="flex flex-col gap-1 pt-1">
          <h1 className={`font-display-lg-mobile text-display-lg-mobile md:font-display-lg tracking-tight ${t.text}`}>
            Screenshot the trick. <br />
            <span className={t.accent}>We’ll name it</span> and report it.
          </h1>
          <p className={`font-body-md text-body-md mt-1 leading-relaxed max-w-prose ${t.muted}`}>
            Upload any checkout, subscription or booking screen. Snitch reads it live, names each dark pattern, cites the rule it breaks, and drafts your complaint.
          </p>
        </div>

        {/* Drop zone */}
        <div
          id="drop-zone"
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (busy) return;
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={`relative flex flex-col items-center justify-center rounded-xl p-6 shadow-md transition-colors duration-200 min-h-[240px] lg:min-h-[320px] border-2 border-dashed ${
            isDragging ? 'border-[#2DD4BF] bg-[#2DD4BF]/5' : t.isDark ? 'bg-[#1B1B21] border-[#444450]' : 'bg-white border-[#d9d6ce]'
          }`}
        >
          {(['top-2 left-2 border-t-2 border-l-2', 'top-2 right-2 border-t-2 border-r-2', 'bottom-2 left-2 border-b-2 border-l-2', 'bottom-2 right-2 border-b-2 border-r-2'] as const).map((c) => (
            <div key={c} className={`absolute w-3 h-3 ${c} ${t.isDark ? 'border-[#33333C]' : 'border-[#d9d6ce]'}`} />
          ))}

          {busy ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3 text-center" role="status" aria-live="polite">
              <div className={`w-10 h-10 border-4 rounded-full animate-spin motion-reduce:animate-none ${t.isDark ? 'border-[#FF7043] border-t-transparent' : 'border-[#ae2b00] border-t-transparent'}`} />
              <span className={`font-headline-sm text-headline-sm font-bold ${t.text}`}>Analysing your screenshot</span>
              <span className={`font-citation-code text-citation-code ${t.muted}`}>{statusLabel}</span>
            </div>
          ) : (
            <>
              <div className={`w-14 h-14 rounded-full border flex items-center justify-center mb-3 shadow-sm ${t.isDark ? 'bg-[#23232B] border-[#33333C] text-[#FF7043]' : 'bg-[#f0edf4] border-[#e2bfb6] text-[#ae2b00]'}`}>
                <div className="relative flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]" aria-hidden="true">document_scanner</span>
                  <span className={`material-symbols-outlined text-[15px] absolute -bottom-1 -right-1 rounded-full p-0.5 border ${t.isDark ? 'text-[#2DD4BF] bg-[#1B1B21] border-[#33333C]' : 'text-[#006b5e] bg-white border-[#e2bfb6]'}`} aria-hidden="true">
                    add_a_photo
                  </span>
                </div>
              </div>

              <div className="text-center mb-4">
                <span className={`font-headline-sm text-headline-sm block font-bold ${t.text}`}>Drop or paste a screenshot</span>
                <span className={`font-body-sm text-body-sm block mt-0.5 ${t.dim}`}>Works with any app or website · PNG or JPG</span>
              </div>

              <input
                id="screenshot-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.currentTarget.value = '';
                }}
              />

              <div className="flex flex-col w-full gap-2 sm:flex-row">
                <button
                  id="choose-screenshot"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full min-h-[44px] rounded-lg font-label-md text-label-md py-2 px-4 flex items-center justify-center gap-2 active:scale-[0.99] shadow-md transition-all font-semibold ${t.accentBg} ${t.focus}`}
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">upload_file</span>
                  <span>Choose screenshot</span>
                </button>

                <button
                  id="paste-clipboard"
                  type="button"
                  onClick={handlePasteButton}
                  className={`w-full min-h-[44px] rounded-lg font-label-md text-label-md py-2 px-4 flex items-center justify-center gap-2 active:scale-[0.99] transition-all border font-semibold ${t.secondaryBtn} ${t.focus}`}
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">content_paste</span>
                  <span>Paste clipboard</span>
                  <span className={`font-citation-code text-[10px] px-1.5 py-0.5 rounded border ${t.isDark ? 'bg-[#1B1B21] border-[#33333C] text-[#A8A6A0]' : 'bg-[#f0edf4] border-[#e2bfb6] text-[#5a413a]'}`}>⌘V</span>
                </button>
              </div>

              <div className={`flex items-center gap-1.5 mt-4 font-citation-code text-citation-code text-center ${t.dim}`}>
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">shield_lock</span>
                <span>Sent securely to our server for analysis · not stored · key never reaches your browser</span>
              </div>
            </>
          )}
        </div>

        {pasteHint && (
          <div role="status" className={`px-3.5 py-2.5 rounded-lg border font-body-sm text-body-sm ${t.amberSoft}`}>
            {pasteHint}
          </div>
        )}

        {error && status === 'error' && (
          <div role="alert" className={`p-3.5 rounded-lg border flex items-start gap-3 ${t.isDark ? 'bg-[#2a1a16] border-[#FF7043]/40' : 'bg-[#ffe9e3] border-[#d1431a]/40'}`}>
            <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${t.accent}`} aria-hidden="true">error</span>
            <div className="flex flex-col gap-1 min-w-0">
              <span className={`font-label-md text-label-md font-bold ${t.text}`}>Analysis didn’t go through</span>
              <p className={`font-body-sm text-body-sm leading-relaxed break-words ${t.muted}`}>{error}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <button type="button" onClick={onDismissError} className={`font-label-md text-label-md px-2.5 py-1 rounded border ${t.secondaryBtn} ${t.focus}`}>
                  Dismiss
                </button>
                {recent.length > 0 && (
                  <button type="button" onClick={() => onOpenRecent(recent[0])} className={`font-label-md text-label-md px-2.5 py-1 rounded ${t.accentBg} ${t.focus}`}>
                    Open last real scan
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ RIGHT: samples, recent, how it works */}
      <div className="flex flex-col gap-4">
        {/* Samples — inputs only; results are always live */}
        <section className="flex flex-col gap-2" aria-labelledby="samples-heading">
          <div className="flex items-center justify-between">
            <span id="samples-heading" className={`font-citation-badge text-citation-badge tracking-wider uppercase font-semibold ${t.dim}`}>Try a sample screen</span>
            <span className={`font-citation-badge text-citation-badge uppercase font-semibold ${t.teal}`}>Analysed live</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                id={`sample-${s.id}`}
                type="button"
                disabled={busy}
                onClick={() => onAnalyze(s.url, s.label)}
                className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm text-left transition-all active:scale-[0.99] disabled:opacity-50 ${t.card} ${t.isDark ? 'hover:bg-[#23232B]' : 'hover:bg-[#f5f2fa]'} ${t.focus}`}
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${t.isDark ? 'bg-[#23232B] border-[#33333C] text-[#FF7043]' : 'bg-[#f0edf4] border-[#e2bfb6] text-[#ae2b00]'}`}>
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{s.icon}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-label-md text-label-md truncate font-bold ${t.text}`}>{s.label}</span>
                  <span className={`font-body-sm text-body-sm truncate ${t.muted}`}>{s.hint}</span>
                </div>
                <span className={`material-symbols-outlined text-[18px] ml-auto shrink-0 ${t.dim}`} aria-hidden="true">arrow_forward</span>
              </button>
            ))}
          </div>
          <p className={`font-citation-code text-[11px] leading-snug ${t.dim}`}>
            Samples are illustrative mock screens shipped with the app. The findings you see for them are produced live by the model, not stored in the code.
          </p>
        </section>

        {/* Recent real scans (on-device cache) */}
        {recent.length > 0 && (
          <section className="flex flex-col gap-2" aria-labelledby="recent-heading">
            <div className="flex items-center justify-between">
              <span id="recent-heading" className={`font-citation-badge text-citation-badge tracking-wider uppercase font-semibold ${t.dim}`}>Recent scans on this device</span>
              <span className={`font-citation-badge text-citation-badge uppercase font-semibold ${t.dim}`}>{recent.length} saved</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {recent.map((r) => (
                <div key={r.id} className={`flex items-center gap-3 p-2.5 rounded-xl border shadow-sm ${t.card}`}>
                  <button
                    type="button"
                    onClick={() => onOpenRecent(r)}
                    className={`flex items-center gap-3 min-w-0 flex-1 text-left rounded-lg ${t.focus}`}
                    aria-label={`Open scan of ${r.platformGuess}`}
                  >
                    <img src={r.imageDataUrl} alt="" className="w-10 h-14 object-cover rounded border border-black/20 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className={`font-label-md text-label-md truncate font-bold ${t.text}`}>{r.platformGuess}</span>
                      <span className={`font-body-sm text-body-sm truncate ${t.muted}`}>
                        {r.findings.length} finding{r.findings.length === 1 ? '' : 's'} · {new Date(r.analyzedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveRecent(r.id)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${t.dim} ${t.hoverAccent} ${t.focus}`}
                    aria-label="Remove from recent scans"
                    title="Remove"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="flex flex-col gap-2 pt-1" aria-labelledby="how-heading">
          <div className="flex items-center justify-between">
            <span id="how-heading" className={`font-citation-badge text-citation-badge tracking-wider uppercase font-semibold ${t.dim}`}>How it works</span>
            <span className={`font-citation-badge text-citation-badge uppercase font-semibold ${t.accent}`}>Vision + rulebook</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {[
              ['01 // CAPTURE', 'Capture', 'Screenshot any timer, hidden fee, pre-ticked box or hard-to-find “No thanks”.', t.accent],
              ['02 // NAME IT', 'Name it', 'The model reads the screen and matches what it sees against the 13 prohibited patterns, with a confidence level.', t.teal],
              ['03 // FILE IT', 'File it', 'Get a grievance for the National Consumer Helpline (1915 / INGRAM). You review it. You send it.', t.accent],
            ].map(([k, h, d, col]) => (
              <div key={k} className={`p-3.5 rounded-xl border shadow-sm flex items-start gap-3 ${t.card}`}>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-citation-code text-citation-code font-bold ${col}`}>{k}</span>
                    <span className={`font-headline-sm text-headline-sm font-bold ${t.text}`}>{h}</span>
                  </div>
                  <p className={`font-body-sm text-body-sm mt-1 leading-snug ${t.muted}`}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className={`p-3.5 rounded-lg border flex items-start gap-3 ${t.cardAlt} ${t.muted}`}>
          <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${t.teal}`} aria-hidden="true">policy</span>
          <div className="flex flex-col gap-0.5">
            <span className={`font-label-md text-label-md font-bold ${t.text}`}>Consumer Protection Act, 2019 · CCPA Guidelines, 2023</span>
            <p className="font-body-sm text-body-sm leading-relaxed">
              Snitch helps you describe what you saw in the words the regulator already published. It is not legal advice and never submits anything on your behalf.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
