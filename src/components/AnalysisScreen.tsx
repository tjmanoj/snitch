import React, { useEffect, useMemo, useState } from 'react';
import type { AnalysisStatus, AuditResult, Finding, ThemeMode } from '../types';
import { confidenceClasses, confidenceLabel, tokens } from '../lib/theme';

interface AnalysisScreenProps {
  theme: ThemeMode;
  status: AnalysisStatus;
  statusLabel: string;
  previewImage: string | null;
  result: AuditResult | null;
  error: string | null;
  onCancel: () => void;
  onGoToScan: () => void;
  onReanalyze: () => void;
  onGoToGrievance: () => void;
  onGoToShare: () => void;
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  theme,
  status,
  statusLabel,
  previewImage,
  result,
  error,
  onCancel,
  onGoToScan,
  onReanalyze,
  onGoToGrievance,
  onGoToShare,
}) => {
  const t = tokens(theme);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [disputed, setDisputed] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);

  // Elapsed-seconds counter while the real request is in flight.
  useEffect(() => {
    if (status !== 'analyzing') {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.round((Date.now() - start) / 1000)), 500);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    setSelectedId(null);
    setDisputed([]);
  }, [result?.id]);

  const counts = useMemo(() => {
    const f = result?.findings ?? [];
    return {
      high: f.filter((x) => x.confidence === 'high').length,
      medium: f.filter((x) => x.confidence === 'medium').length,
      low: f.filter((x) => x.confidence === 'low').length,
    };
  }, [result]);

  const focusFinding = (id: number) => {
    setSelectedId(id);
    document.getElementById(`finding-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* ------------------------------------------------------------------ analysing */
  if (status === 'analyzing') {
    return (
      <div className="flex flex-col w-full pb-6 gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 lg:items-start">
        <div className="flex flex-col gap-3">
          <div className={`inline-flex items-center self-start gap-1.5 px-3 py-1 rounded-full shadow-sm border ${t.accentSoft}`} role="status" aria-live="polite">
            <span className={`w-2 h-2 rounded-full animate-ping motion-reduce:animate-none ${t.isDark ? 'bg-[#FF7043]' : 'bg-[#ae2b00]'}`} />
            <span className="font-citation-badge text-citation-badge uppercase tracking-wider font-semibold">Analysis in progress · live</span>
          </div>
          <h2 className={`font-display-lg-mobile text-display-lg-mobile md:font-display-lg tracking-tight ${t.text}`}>{statusLabel || 'Reading the screen…'}</h2>
          <p className={`font-body-md text-body-md leading-relaxed max-w-prose ${t.muted}`}>
            The model is looking at your screenshot and comparing what it sees against the 13 patterns in Annexure 1 of the 2023 Guidelines. This usually takes 5–20 seconds.
          </p>
          <div className={`font-citation-code text-citation-code ${t.dim}`}>{elapsed}s elapsed</div>
          <button type="button" onClick={onCancel} className={`self-start mt-1 min-h-[44px] px-4 rounded-lg border font-label-md text-label-md font-semibold ${t.secondaryBtn} ${t.focus}`}>
            Cancel
          </button>
        </div>

        <div className={`relative rounded-xl border overflow-hidden shadow-md ${t.card}`}>
          {previewImage ? (
            <div className="relative w-full">
              <img src={previewImage} alt="Screenshot being analysed" className="w-full h-auto max-h-[70dvh] object-contain block" />
              <div className="scan-beam pointer-events-none absolute inset-x-0 h-16 motion-reduce:hidden" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-0 bg-[#15151A]/20" aria-hidden="true" />
            </div>
          ) : (
            <div className={`h-64 flex items-center justify-center ${t.dim}`}>Preparing preview…</div>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ error */
  if (status === 'error' && !result) {
    return (
      <div className="flex flex-col w-full pb-6 gap-4 max-w-xl">
        <div className={`inline-flex items-center self-start gap-1.5 px-3 py-1 rounded-full shadow-sm border ${t.amberSoft}`}>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">error</span>
          <span className="font-citation-badge text-citation-badge uppercase tracking-wider font-semibold">Analysis failed</span>
        </div>
        <h2 className={`font-display-lg-mobile text-display-lg-mobile tracking-tight ${t.text}`}>We couldn’t analyse that screenshot.</h2>
        <p className={`font-body-md text-body-md leading-relaxed break-words ${t.muted}`} role="alert">{error}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onReanalyze} className={`min-h-[44px] px-4 rounded-lg font-label-md text-label-md font-semibold ${t.accentBg} ${t.focus}`}>Try again</button>
          <button type="button" onClick={onGoToScan} className={`min-h-[44px] px-4 rounded-lg border font-label-md text-label-md font-semibold ${t.secondaryBtn} ${t.focus}`}>Choose another screenshot</button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ empty */
  if (!result) {
    return (
      <div className="flex flex-col w-full pb-6 gap-4 max-w-xl">
        <span className={`font-citation-badge text-citation-badge tracking-wider uppercase font-semibold ${t.dim}`}>Analysis</span>
        <h2 className={`font-display-lg-mobile text-display-lg-mobile tracking-tight ${t.text}`}>Nothing analysed yet.</h2>
        <p className={`font-body-md text-body-md leading-relaxed ${t.muted}`}>
          Drop a screenshot on the Scan tab. Every finding on this screen comes from a live reading of your image — nothing is pre-loaded.
        </p>
        <button type="button" onClick={onGoToScan} className={`self-start min-h-[44px] px-4 rounded-lg font-label-md text-label-md font-semibold flex items-center gap-2 ${t.accentBg} ${t.focus}`}>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add_a_photo</span>
          Go to Scan
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ results */
  const findings = result.findings;
  const none = findings.length === 0;

  return (
    <div className="flex flex-col w-full pb-24 lg:pb-6 gap-4">
      {/* Header strip */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm border font-citation-badge text-citation-badge uppercase tracking-wider font-semibold ${none ? t.tealSoft : t.accentSoft}`}>
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{none ? 'verified' : 'flag'}</span>
            {none ? 'No dark patterns detected' : `${findings.length} dark pattern${findings.length === 1 ? '' : 's'} found`}
          </span>
          {result.cached && (
            <span className={`px-2 py-[3px] rounded border font-citation-badge text-citation-badge uppercase font-semibold ${t.neutralSoft}`} title="Restored from a previous real analysis on this device">
              From device cache
            </span>
          )}
        </div>
        <h2 className={`font-headline-lg text-headline-lg md:font-display-lg-mobile tracking-tight ${t.text}`}>
          {result.platformGuess} <span className={t.dim}>·</span> <span className={t.muted}>{result.screenType}</span>
        </h2>
        <p className={`font-body-md text-body-md leading-relaxed max-w-prose ${t.muted}`}>{result.summary}</p>
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-citation-code text-citation-code ${t.dim}`}>
          <span>Analysed {fmtTime(result.analyzedAt)}</span>
          {!none && (
            <span>
              {counts.high} high · {counts.medium} medium · {counts.low} low confidence
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-8 lg:items-start">
        {/* Screenshot with pins */}
        <div className="lg:sticky lg:top-6 flex flex-col gap-2">
          <div className={`rounded-xl border shadow-md overflow-hidden ${t.card} flex justify-center`}>
            <div className="relative inline-block max-w-full leading-[0]">
              <img
                src={result.imageDataUrl}
                alt={`Screenshot of ${result.platformGuess} ${result.screenType}`}
                className="block max-w-full h-auto max-h-[70dvh] object-contain"
              />
              {findings.map((f) => {
                const active = selectedId === f.id;
                return (
                  <React.Fragment key={f.id}>
                    {active && (
                      <div
                        aria-hidden="true"
                        className="absolute border-2 border-[#FF7043] rounded-sm shadow-[0_0_0_9999px_rgba(21,21,26,0.35)] pointer-events-none"
                        style={{ left: `${f.box.x * 100}%`, top: `${f.box.y * 100}%`, width: `${f.box.w * 100}%`, height: `${f.box.h * 100}%` }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => focusFinding(f.id)}
                      aria-label={`Finding ${f.id}: ${f.pattern}, ${confidenceLabel(f.confidence)}`}
                      aria-pressed={active}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-[12px] font-bold font-citation-code flex items-center justify-center shadow-lg ring-2 ring-white/90 transition-transform after:absolute after:-inset-2.5 after:rounded-full ${
                        active ? 'scale-125' : 'hover:scale-110'
                      } ${f.confidence === 'low' ? 'bg-[#6E6E78] text-white' : f.confidence === 'medium' ? 'bg-[#F0B35A] text-[#1a1a1f]' : 'bg-[#FF7043] text-white'} ${t.focus}`}
                      style={{ left: `${(f.box.x + f.box.w / 2) * 100}%`, top: `${(f.box.y + f.box.h / 2) * 100}%` }}
                    >
                      {f.id}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className={`flex items-center justify-between font-citation-code text-[11px] ${t.dim}`}>
            <span>Tap a marker to jump to its finding.</span>
            <button type="button" onClick={onReanalyze} className={`inline-flex items-center gap-1.5 min-h-[44px] px-2 underline-offset-2 hover:underline ${t.focus} rounded`}>
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">refresh</span>
              Re-run analysis
            </button>
          </div>
        </div>

        {/* Findings */}
        <div className="flex flex-col gap-3">
          {/* Desktop action bar: placed at top of findings so desktop users have immediate access */}
          {!none && (
            <div className={`hidden lg:flex items-center gap-3 p-3 rounded-xl border shadow-sm ${t.card}`}>
              <button
                id="desktop-draft-complaint"
                type="button"
                onClick={onGoToGrievance}
                className={`flex-1 min-h-[44px] rounded-lg font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm ${t.accentBg} ${t.focus}`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">gavel</span>
                Draft complaint
              </button>
              <button
                id="desktop-share-card"
                type="button"
                onClick={onGoToShare}
                className={`flex-1 min-h-[44px] rounded-lg border font-label-md text-label-md font-semibold flex items-center justify-center gap-2 ${t.secondaryBtn} ${t.focus}`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">ios_share</span>
                Share card
              </button>
            </div>
          )}

          {none ? (
            <div className={`p-5 rounded-xl border shadow-sm flex flex-col gap-2 ${t.card}`}>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[22px] ${t.teal}`} aria-hidden="true">verified_user</span>
                <span className={`font-headline-sm text-headline-sm font-bold ${t.text}`}>This screen looks clean.</span>
              </div>
              <p className={`font-body-sm text-body-sm leading-relaxed ${t.muted}`}>
                The model did not see any of the 13 prohibited patterns on this screenshot. Dark patterns often live on the <em>next</em> step — the payment page, the cancel flow — so try screenshotting that screen too.
              </p>
              <button type="button" onClick={onGoToScan} className={`self-start mt-1 min-h-[44px] px-4 rounded-lg font-label-md text-label-md font-semibold ${t.accentBg} ${t.focus}`}>
                Scan another screen
              </button>
            </div>
          ) : (
            findings.map((f: Finding) => {
              const active = selectedId === f.id;
              const isDisputed = disputed.includes(f.id);
              return (
                <article
                  id={`finding-${f.id}`}
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  className={`p-4 rounded-xl border shadow-sm flex flex-col gap-2 transition-colors ${t.card} ${active ? (t.isDark ? 'border-[#FF7043]' : 'border-[#ae2b00]') : ''} ${isDisputed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-7 h-7 rounded-full shrink-0 text-[12px] font-bold font-citation-code flex items-center justify-center ${
                        f.confidence === 'low' ? 'bg-[#6E6E78] text-white' : f.confidence === 'medium' ? 'bg-[#F0B35A] text-[#1a1a1f]' : 'bg-[#FF7043] text-white'
                      }`}
                      aria-hidden="true"
                    >
                      {f.id}
                    </span>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className={`font-headline-sm text-headline-sm font-bold uppercase tracking-wide ${t.accent}`}>{f.pattern}</h3>
                        <span className={`px-2 py-[2px] rounded border font-citation-badge text-citation-badge ${t.neutralSoft}`}>Annexure 1 · Item {f.annexItem}</span>
                        <span className={`px-2 py-[2px] rounded border font-citation-badge text-citation-badge uppercase font-semibold ${confidenceClasses(t, f.confidence)}`}>{confidenceLabel(f.confidence)}</span>
                      </div>
                      <blockquote className={`font-body-md text-body-md italic border-l-2 pl-3 ${t.isDark ? 'border-[#33333C] text-[#F1EFE9]' : 'border-[#e2bfb6] text-[#1b1b20]'}`}>“{f.evidence}”</blockquote>
                      <p className={`font-body-sm text-body-sm leading-relaxed ${t.muted}`}>{f.explanation}</p>
                      <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t mt-1 font-citation-code text-[11px] ${t.isDark ? 'border-[#33333C]/60 text-[#787672]' : 'border-[#e2bfb6]/60 text-[#8e7069]'}`}>
                        <span className="font-medium truncate max-w-[240px] sm:max-w-none">{f.clause}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDisputed((d) => (d.includes(f.id) ? d.filter((x) => x !== f.id) : [...d, f.id]));
                          }}
                          className={`inline-flex items-center gap-1.5 min-h-[36px] px-2.5 py-1 rounded-lg border font-label-md text-xs font-semibold transition-colors ${
                            isDisputed
                              ? t.isDark
                                ? 'bg-[#FF7043]/15 text-[#FF7043] border-[#FF7043]/40'
                                : 'bg-[#ffdad6] text-[#ae2b00] border-[#d1431a]/40'
                              : t.secondaryBtn
                          } ${t.focus}`}
                        >
                          <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                            {isDisputed ? 'undo' : 'flag'}
                          </span>
                          <span>{isDisputed ? 'Marked wrong · undo' : 'Dispute finding'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {!none && (
            <p className={`font-citation-code text-[11px] leading-snug ${t.dim}`}>
              Confidence is the model’s own estimate. A genuine, disclosed limit is not a dark pattern — you decide what to report.
            </p>
          )}
        </div>
      </div>

      {/* Actions: sticky bottom bar on phones, positioned safely above BottomNav without safe-area clipping */}
      <div className={`fixed lg:hidden bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] landscape:bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-40 px-4 pb-3 pt-2.5 border-t backdrop-blur-xl ${t.isDark ? 'bg-[#15151A]/95 border-[#33333C]' : 'bg-[#fbf8ff]/95 border-[#e2bfb6]/40'}`}>
        <div className="max-w-lg md:max-w-2xl mx-auto flex gap-2">
          <button
            id="draft-complaint"
            type="button"
            disabled={none}
            onClick={onGoToGrievance}
            className={`flex-1 min-h-[48px] rounded-lg font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${t.accentBg} ${t.focus}`}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">gavel</span>
            Draft complaint
          </button>
          <button
            id="share-card"
            type="button"
            onClick={onGoToShare}
            className={`flex-1 min-h-[48px] rounded-lg border font-label-md text-label-md font-semibold flex items-center justify-center gap-2 ${t.secondaryBtn} ${t.focus}`}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">ios_share</span>
            Share card
          </button>
        </div>
      </div>
    </div>
  );
};
