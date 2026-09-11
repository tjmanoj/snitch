import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { AuditResult, ThemeMode } from '../types';
import { tokens } from '../lib/theme';

interface ShareCardScreenProps {
  theme: ThemeMode;
  result: AuditResult | null;
  onBackToAnalysis: () => void;
  onGoToGrievance: () => void;
  onGoToScan: () => void;
}

const W = 1080;
const H = 1350;
const ACCENT = '#FF7043';
const TEAL = '#4FC3B1';
const AMBER = '#F0B35A';
const GREY = '#6E6E78';

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('image failed'));
    i.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws the share card onto the canvas from the REAL result. */
async function drawCard(canvas: HTMLCanvasElement, result: AuditResult, privacy: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = W;
  canvas.height = H;
  try {
    await (document as any).fonts?.ready;
  } catch {
    /* ignore */
  }
  const display = '"Bricolage Grotesque", "Inter", Arial, sans-serif';
  const mono = '"JetBrains Mono", "Courier New", monospace';
  const body = '"Inter", Arial, sans-serif';

  // ground
  ctx.fillStyle = '#15151A';
  ctx.fillRect(0, 0, W, H);

  // header
  ctx.fillStyle = ACCENT;
  roundRect(ctx, 60, 60, 46, 46, 10);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 22px ${mono}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('!', 78, 84);
  ctx.fillStyle = '#F1EFE9';
  ctx.font = `800 36px ${display}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('SNITCHED', 122, 96);
  ctx.fillStyle = '#A9A8B0';
  ctx.font = `500 20px ${mono}`;
  const date = new Date(result.analyzedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const right = `${date}`;
  ctx.textAlign = 'right';
  ctx.fillText(right, W - 60, 92);
  ctx.textAlign = 'left';

  // image area
  const img = await loadImg(result.imageDataUrl);
  const areaX = 60, areaY = 140, areaW = W - 120, areaH = 860;
  const scale = Math.min(areaW / img.naturalWidth, areaH / img.naturalHeight);
  const dw = Math.round(img.naturalWidth * scale);
  const dh = Math.round(img.naturalHeight * scale);
  const dx = Math.round(areaX + (areaW - dw) / 2);
  const dy = Math.round(areaY + (areaH - dh) / 2);

  ctx.save();
  roundRect(ctx, dx, dy, dw, dh, 24);
  ctx.clip();
  if (privacy) {
    ctx.filter = 'blur(16px)';
    ctx.drawImage(img, dx - 20, dy - 20, dw + 40, dh + 40);
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(21,21,26,0.25)';
    ctx.fillRect(dx, dy, dw, dh);
    // sharp evidence windows
    for (const f of result.findings) {
      const sx = f.box.x * img.naturalWidth, sy = f.box.y * img.naturalHeight, sw = f.box.w * img.naturalWidth, sh = f.box.h * img.naturalHeight;
      const tx = dx + f.box.x * dw, ty = dy + f.box.y * dh, tw = f.box.w * dw, th = f.box.h * dh;
      ctx.drawImage(img, sx, sy, sw, sh, tx, ty, tw, th);
    }
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  ctx.restore();

  // frame
  ctx.strokeStyle = '#33333C';
  ctx.lineWidth = 2;
  roundRect(ctx, dx, dy, dw, dh, 24);
  ctx.stroke();

  // evidence boxes + pins
  for (const f of result.findings) {
    const bx = dx + f.box.x * dw, by = dy + f.box.y * dh, bw = f.box.w * dw, bh = f.box.h * dh;
    const col = f.confidence === 'high' ? ACCENT : f.confidence === 'medium' ? AMBER : GREY;
    ctx.strokeStyle = col;
    ctx.lineWidth = 4;
    roundRect(ctx, bx, by, Math.max(bw, 8), Math.max(bh, 8), 8);
    ctx.stroke();
    const cx = bx + bw / 2, cy = by + bh / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.stroke();
    ctx.fillStyle = f.confidence === 'medium' ? '#1a1a1f' : '#FFFFFF';
    ctx.font = `700 24px ${mono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(f.id), cx, cy + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // footer block
  const fy = 1030;
  ctx.fillStyle = '#1B1B21';
  roundRect(ctx, 60, fy, W - 120, 260, 24);
  ctx.fill();
  ctx.strokeStyle = '#33333C';
  ctx.lineWidth = 2;
  ctx.stroke();

  const n = result.findings.length;
  ctx.fillStyle = n ? ACCENT : TEAL;
  ctx.font = `800 64px ${display}`;
  ctx.fillText(String(n), 96, fy + 84);
  ctx.fillStyle = '#F1EFE9';
  ctx.font = `700 30px ${display}`;
  ctx.fillText(n === 1 ? 'dark pattern found' : n === 0 ? 'dark patterns found — clean screen' : 'dark patterns found', 96 + (n >= 10 ? 90 : 56), fy + 84);
  ctx.fillStyle = '#A9A8B0';
  ctx.font = `500 22px ${body}`;
  const platformLine = `${result.platformGuess} · ${result.screenType}`;
  ctx.fillText(platformLine.length > 60 ? platformLine.slice(0, 57) + '…' : platformLine, 96, fy + 126);

  // pattern chips
  let cxp = 96;
  let cyp = fy + 160;
  ctx.font = `600 18px ${mono}`;
  const seen = new Set<string>();
  for (const f of result.findings) {
    const label = `${f.id} · ${f.pattern.toUpperCase()}`;
    if (seen.has(label)) continue;
    seen.add(label);
    const tw = ctx.measureText(label).width + 28;
    if (cxp + tw > W - 96) {
      cxp = 96;
      cyp += 44;
      if (cyp > fy + 210) break;
    }
    ctx.fillStyle = 'rgba(255,112,67,0.15)';
    roundRect(ctx, cxp, cyp - 26, tw, 36, 8);
    ctx.fill();
    ctx.fillStyle = ACCENT;
    ctx.fillText(label, cxp + 14, cyp);
    cxp += tw + 10;
  }

  // bottom strip
  ctx.fillStyle = '#6E6E78';
  ctx.font = `500 18px ${mono}`;
  ctx.fillText('INDIA · CCPA GUIDELINES ON DARK PATTERNS, 2023 · ANNEXURE 1', 96, fy + 246);
  ctx.textAlign = 'right';
  ctx.fillText(window.location.host || 'snitch', W - 96, fy + 246);
  ctx.textAlign = 'left';
}

export const ShareDossierScreen: React.FC<ShareCardScreenProps> = ({ theme, result, onBackToAnalysis, onGoToGrievance, onGoToScan }) => {
  const t = tokens(theme);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [privacy, setPrivacy] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [drawError, setDrawError] = useState<string | null>(null);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const redraw = useCallback(async () => {
    if (!canvasRef.current || !result) return;
    setBusy(true);
    setDrawError(null);
    try {
      await drawCard(canvasRef.current, result, privacy);
    } catch (e: any) {
      setDrawError(e?.message || 'Could not draw the card.');
    } finally {
      setBusy(false);
    }
  }, [result, privacy]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const toBlob = () =>
    new Promise<Blob | null>((res) => {
      canvasRef.current?.toBlob((b) => res(b), 'image/png');
    });

  const fileName = () => `snitch_${(result?.platformGuess || 'screen').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}_${Date.now()}.png`;

  const download = async () => {
    const blob = await toBlob();
    if (!blob) return showToast('Could not export the image.');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast('Card downloaded.');
  };

  const share = async () => {
    const blob = await toBlob();
    if (!blob) return showToast('Could not export the image.');
    const file = new File([blob], fileName(), { type: 'image/png' });
    const nav = navigator as any;
    const text = result
      ? `${result.findings.length} dark pattern(s) on ${result.platformGuess} — named and cited under India's 2023 Guidelines. #Snitched`
      : 'Snitched';
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: 'Snitched', text });
        showToast('Shared.');
        return;
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
      }
    }
    await download();
  };

  if (!result) {
    return (
      <div className="flex flex-col w-full pb-6 gap-4 max-w-xl">
        <span className={`font-citation-badge text-citation-badge tracking-wider uppercase font-semibold ${t.dim}`}>Share card</span>
        <h2 className={`font-display-lg-mobile text-display-lg-mobile tracking-tight ${t.text}`}>Analyse a screenshot first.</h2>
        <p className={`font-body-md text-body-md leading-relaxed ${t.muted}`}>The card is drawn from your real findings, so there is nothing to share yet.</p>
        <button type="button" onClick={onGoToScan} className={`self-start min-h-[44px] px-4 rounded-lg font-label-md text-label-md font-semibold ${t.accentBg} ${t.focus}`}>Go to Scan</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-6 gap-4">
      <div className="flex flex-col gap-1">
        <button type="button" onClick={onBackToAnalysis} className={`self-start inline-flex items-center gap-1 font-label-md text-label-md ${t.muted} ${t.focus} rounded`}>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
          Back to findings
        </button>
        <h2 className={`font-headline-lg text-headline-lg md:font-display-lg-mobile tracking-tight ${t.text}`}>Share card</h2>
        <p className={`font-body-md text-body-md leading-relaxed max-w-prose ${t.muted}`}>
          A 4:5 image for X, WhatsApp or Instagram, drawn from this scan. What you see below is exactly what gets exported.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-8 lg:items-start">
        <div className={`rounded-xl border shadow-md overflow-hidden ${t.card} flex justify-center p-3`}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block w-full max-w-[520px] h-auto rounded-lg"
            aria-label="Preview of the share card"
            role="img"
          />
        </div>

        <div className="flex flex-col gap-3 lg:sticky lg:top-6">
          <label className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm cursor-pointer ${t.card}`}>
            <input id="privacy-toggle" type="checkbox" className="mt-1 w-4 h-4 accent-[#FF7043]" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
            <span className="flex flex-col gap-0.5">
              <span className={`font-label-md text-label-md font-bold ${t.text}`}>Privacy mode: blur everything except the evidence</span>
              <span className={`font-body-sm text-body-sm leading-snug ${t.muted}`}>Hides names, addresses and order numbers on the screenshot while keeping each flagged element sharp.</span>
            </span>
          </label>

          {drawError && (
            <div role="alert" className={`px-3 py-2 rounded-lg border font-body-sm text-body-sm ${t.amberSoft}`}>{drawError}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button id="download-card" type="button" disabled={busy} onClick={download} className={`min-h-[48px] rounded-lg font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 ${t.accentBg} ${t.focus}`}>
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">download</span>
              Download image
            </button>
            <button id="share-native" type="button" disabled={busy} onClick={share} className={`min-h-[48px] rounded-lg border font-label-md text-label-md font-semibold flex items-center justify-center gap-2 disabled:opacity-50 ${t.secondaryBtn} ${t.focus}`}>
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">ios_share</span>
              Share
            </button>
          </div>

          {result.findings.length > 0 && (
            <button type="button" onClick={onGoToGrievance} className={`min-h-[44px] rounded-lg border font-label-md text-label-md font-semibold flex items-center justify-center gap-2 ${t.secondaryBtn} ${t.focus}`}>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">gavel</span>
              Also draft the complaint
            </button>
          )}

          <p className={`font-citation-code text-[11px] leading-snug ${t.dim}`}>
            Sharing is public pressure, not a filing. To make it count with the regulator, also send the grievance to the National Consumer Helpline.
          </p>
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
