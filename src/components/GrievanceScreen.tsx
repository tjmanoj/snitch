import React, { useEffect, useRef, useState } from 'react';
import type { AuditResult, GrievanceRequest, ThemeMode } from '../types';
import { tokens } from '../lib/theme';
import { draftGrievance, friendlyError, templateGrievance } from '../lib/api';

export interface GrievanceDraft {
  resultId: string;
  tone: 'formal' | 'simple';
  subject: string;
  body: string;
  source: 'model' | 'template';
}

interface GrievanceScreenProps {
  theme: ThemeMode;
  result: AuditResult | null;
  draft: GrievanceDraft | null;
  onDraftChange: (d: GrievanceDraft | null) => void;
  onGoToAnalysis: () => void;
  onGoToScan: () => void;
  onOpenHelpline: () => void;
}

const NCH_URL = 'https://consumerhelpline.gov.in';

export const GrievanceScreen: React.FC<GrievanceScreenProps> = ({ theme, result, draft, onDraftChange, onGoToAnalysis, onGoToScan, onOpenHelpline }) => {
  const t = tokens(theme);

  // Complainant details start EMPTY. Nothing is pre-filled.
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [tone, setTone] = useState<'formal' | 'simple'>(draft?.tone ?? 'formal');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const abortRef = useRef<{ cancelled: boolean } | null>(null);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  const buildPayload = (): GrievanceRequest | null => {
    if (!result || result.findings.length === 0) return null;
    return {
      platform: result.platformGuess,
      screenType: result.screenType,
      observedAt: result.analyzedAt,
      findings: result.findings.map((f) => ({ pattern: f.pattern, annexItem: f.annexItem, evidence: f.evidence, explanation: f.explanation, confidence: f.confidence })),
      complainant: {
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        orderId: orderId.trim() || undefined,
        amount: amount.trim() || undefined,
      },
      tone,
    };
  };

  const generate = async (nextTone: 'formal' | 'simple' = tone) => {
    const payload = buildPayload();
    if (!payload || !result) return;
    payload.tone = nextTone;
    const token = { cancelled: false };
    abortRef.current = token;
    setLoading(true);
    setError(null);
    setReviewed(false);
    try {
      const res = await draftGrievance(payload);
      if (token.cancelled) return;
      onDraftChange({ resultId: result.id, tone: nextTone, subject: res.subject, body: res.body, source: 'model' });
    } catch (err: any) {
      if (token.cancelled) return;
      const tpl = templateGrievance(payload);
      onDraftChange({ resultId: result.id, tone: nextTone, subject: tpl.subject, body: tpl.body, source: 'template' });
      setError(`${friendlyError(err, 'draft')} In the meantime, a template filled from your real findings is shown below — read it and edit it before sending.`);
    } finally {
      if (!token.cancelled) setLoading(false);
    }
  };

  // Generate once per analysis result.
  useEffect(() => {
    if (!result || result.findings.length === 0) return;
    if (draft && draft.resultId === result.id) return;
    generate(tone);
    return () => {
      if (abortRef.current) abortRef.current.cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.id]);

  const canSend = !!draft && reviewed && !loading;

  const copyAll = async () => {
    if (!draft) return;
    const text = `Subject: ${draft.subject}\n\n${draft.body}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Complaint copied. Paste it into the helpline form.');
    } catch {
      showToast('Copy failed — select the text and copy manually.');
    }
  };

  /* -------------------------------------------------- guards */
  if (!result) {
    return (
      <div className="flex flex-col w-full pb-6 gap-4 max-w-xl">
        <span className={`font-citation-badge text-citation-badge tracking-wider uppercase font-semibold ${t.dim}`}>Grievance</span>
        <h2 className={`font-display-lg-mobile text-display-lg-mobile tracking-tight ${t.text}`}>Analyse a screenshot first.</h2>
        <p className={`font-body-md text-body-md leading-relaxed ${t.muted}`}>The complaint is written from the real findings of your scan, so there is nothing to draft yet.</p>
        <button type="button" onClick={onGoToScan} className={`self-start min-h-[44px] px-4 rounded-lg font-label-md text-label-md font-semibold ${t.accentBg} ${t.focus}`}>Go to Scan</button>
      </div>
    );
  }
  if (result.findings.length === 0) {
    return (
      <div className="flex flex-col w-full pb-6 gap-4 max-w-xl">
        <span className={`font-citation-badge text-citation-badge tracking-wider uppercase font-semibold ${t.dim}`}>Grievance</span>
        <h2 className={`font-display-lg-mobile text-display-lg-mobile tracking-tight ${t.text}`}>Nothing to complain about — good news.</h2>
        <p className={`font-body-md text-body-md leading-relaxed ${t.muted}`}>The last scan of {result.platformGuess} found no prohibited patterns, so no grievance is needed. Try the next screen in the flow (payment, cancel) if something felt off.</p>
        <button type="button" onClick={onGoToScan} className={`self-start min-h-[44px] px-4 rounded-lg font-label-md text-label-md font-semibold ${t.accentBg} ${t.focus}`}>Scan another screen</button>
      </div>
    );
  }

  /* -------------------------------------------------- main */
  const inputCls = `w-full min-h-[44px] rounded-lg border px-3 text-[16px] md:text-[14px] ${t.input} ${t.focus}`;
  const labelCls = `font-citation-badge text-citation-badge uppercase tracking-wider font-semibold ${t.dim}`;

  return (
    <div className="flex flex-col w-full pb-6 gap-4">
      <div className="flex flex-col gap-1">
        <button type="button" onClick={onGoToAnalysis} className={`self-start inline-flex items-center gap-1 font-label-md text-label-md ${t.muted} ${t.hoverText} ${t.focus} rounded`}>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
          Back to findings
        </button>
        <h2 className={`font-headline-lg text-headline-lg md:font-display-lg-mobile tracking-tight ${t.text}`}>Grievance to the National Consumer Helpline</h2>
        <p className={`font-body-md text-body-md leading-relaxed max-w-prose ${t.muted}`}>
          Written live from the {result.findings.length} finding{result.findings.length === 1 ? '' : 's'} on {result.platformGuess}. Fill in your details, read it, then send it yourself on the portal or by calling 1915.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8 lg:items-start">
        {/* Form */}
        <div className={`p-4 rounded-xl border shadow-sm flex flex-col gap-3 ${t.card}`}>
          <span className={labelCls}>Your details (optional — never pre-filled)</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className={`font-body-sm text-body-sm ${t.muted}`}>Your name</span>
              <input id="g-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="As on your ID" autoComplete="name" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={`font-body-sm text-body-sm ${t.muted}`}>Mobile number</span>
              <input id="g-phone" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" inputMode="tel" autoComplete="tel" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={`font-body-sm text-body-sm ${t.muted}`}>Email</span>
              <input id="g-email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" inputMode="email" autoComplete="email" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={`font-body-sm text-body-sm ${t.muted}`}>Order / booking ID</span>
              <input id="g-order" className={inputCls} value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Optional" />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className={`font-body-sm text-body-sm ${t.muted}`}>Amount affected (₹)</span>
              <input id="g-amount" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 49 — hidden fee or unconsented charge" inputMode="decimal" />
            </label>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <span className={labelCls}>Tone</span>
            <div className="flex gap-2" role="radiogroup" aria-label="Tone">
              {(['formal', 'simple'] as const).map((tn) => (
                <button
                  key={tn}
                  type="button"
                  role="radio"
                  aria-checked={tone === tn}
                  onClick={() => setTone(tn)}
                  className={`min-h-[40px] px-3 rounded-lg border font-label-md text-label-md font-semibold capitalize ${tone === tn ? t.accentSoft : t.secondaryBtn} ${t.focus}`}
                >
                  {tn === 'formal' ? 'Formal' : 'Simple English'}
                </button>
              ))}
            </div>
          </div>

          <button
            id="regenerate"
            type="button"
            disabled={loading}
            onClick={() => generate(tone)}
            className={`min-h-[44px] rounded-lg font-label-md text-label-md font-semibold flex items-center justify-center gap-2 disabled:opacity-50 ${t.accentBg} ${t.focus}`}
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true">{loading ? 'progress_activity' : 'auto_awesome'}</span>
            {loading ? 'Drafting…' : draft ? 'Regenerate with these details' : 'Draft complaint'}
          </button>

          <div className={`p-3 rounded-lg border flex items-start gap-2 ${t.cardAlt}`}>
            <span className={`material-symbols-outlined text-[18px] shrink-0 ${t.teal}`} aria-hidden="true">info</span>
            <p className={`font-body-sm text-body-sm leading-relaxed ${t.muted}`}>
              <strong className={t.text}>You send it. Snitch never submits on your behalf.</strong> This is not legal advice. Attach the screenshot when you file.
            </p>
          </div>
        </div>

        {/* Draft */}
        <div className={`p-4 rounded-xl border shadow-sm flex flex-col gap-3 ${t.card}`}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={labelCls}>Complaint text · editable</span>
            {draft && (
              <span className={`px-2 py-[2px] rounded border font-citation-badge text-citation-badge uppercase font-semibold ${draft.source === 'model' ? t.tealSoft : t.amberSoft}`}>
                {draft.source === 'model' ? 'Drafted live' : 'Template fallback'}
              </span>
            )}
          </div>

          {error && (
            <div role="alert" className={`px-3 py-2 rounded-lg border font-body-sm text-body-sm ${t.amberSoft}`}>
              {error}
            </div>
          )}

          {loading && !draft ? (
            <div className={`flex flex-col gap-2 py-6 items-center text-center ${t.muted}`} role="status" aria-live="polite">
              <div className={`w-8 h-8 border-4 rounded-full animate-spin motion-reduce:animate-none ${t.isDark ? 'border-[#FF7043] border-t-transparent' : 'border-[#ae2b00] border-t-transparent'}`} />
              <span className="font-body-sm text-body-sm">Writing your grievance from the findings…</span>
            </div>
          ) : draft ? (
            <>
              <label className="flex flex-col gap-1">
                <span className={`font-body-sm text-body-sm ${t.muted}`}>Subject</span>
                <input id="g-subject" className={inputCls} value={draft.subject} onChange={(e) => onDraftChange({ ...draft, subject: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1">
                <span className={`font-body-sm text-body-sm ${t.muted}`}>Body</span>
                <textarea
                  id="g-body"
                  className={`w-full rounded-lg border px-3 py-2 text-[16px] md:text-[14px] leading-relaxed min-h-[320px] resize-y ${t.input} ${t.focus}`}
                  value={draft.body}
                  onChange={(e) => onDraftChange({ ...draft, body: e.target.value })}
                />
              </label>
              <div className={`flex items-center justify-between font-citation-code text-[11px] ${t.dim}`}>
                <span>{draft.body.length} characters · {draft.body.trim().split(/\s+/).filter(Boolean).length} words</span>
                <button type="button" disabled={loading} onClick={() => { setTone('simple'); generate('simple'); }} className={`underline-offset-2 hover:underline disabled:opacity-50 ${t.focus} rounded`}>
                  Regenerate in simpler language
                </button>
              </div>

              <label className={`flex items-start gap-2 pt-1 cursor-pointer ${t.text}`}>
                <input id="g-reviewed" type="checkbox" className="mt-1 w-4 h-4 accent-[#FF7043]" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />
                <span className="font-body-sm text-body-sm">I have read this complaint and it is accurate. I understand I am the one filing it.</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  id="copy-complaint"
                  type="button"
                  disabled={!canSend}
                  onClick={copyAll}
                  className={`min-h-[48px] rounded-lg font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${t.accentBg} ${t.focus}`}
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">content_copy</span>
                  Copy complaint
                </button>
                <a
                  id="open-portal"
                  href={canSend ? NCH_URL : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!canSend}
                  onClick={(e) => {
                    if (!canSend) e.preventDefault();
                  }}
                  className={`min-h-[48px] rounded-lg border font-label-md text-label-md font-semibold flex items-center justify-center gap-2 ${t.secondaryBtn} ${!canSend ? 'opacity-40 cursor-not-allowed' : ''} ${t.focus}`}
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">open_in_new</span>
                  Open consumerhelpline.gov.in
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="tel:1915" className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border font-label-md text-label-md ${t.secondaryBtn} ${t.focus}`}>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">call</span>
                  Call 1915 (toll-free)
                </a>
                <button type="button" onClick={onOpenHelpline} className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border font-label-md text-label-md ${t.secondaryBtn} ${t.focus}`}>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">support_agent</span>
                  Other ways to file
                </button>
              </div>
            </>
          ) : (
            <p className={`font-body-sm text-body-sm ${t.muted}`}>Press “Draft complaint” to write it from your findings.</p>
          )}
        </div>
      </div>

      {toast && (
        <div role="status" className={`fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-xl border font-label-md text-label-md ${t.isDark ? 'bg-[#23232B] border-[#33333C] text-[#F1EFE9]' : 'bg-white border-[#d9d6ce] text-[#1b1b20]'}`}>
          {toast}
        </div>
      )}
    </div>
  );
};
