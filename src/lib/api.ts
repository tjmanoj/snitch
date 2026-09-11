/** Client for the Snitch API. All results come live from the server; nothing is hardcoded here. */
import type { AnalyzeResponse, AuditResult, Finding, GrievanceRequest, GrievanceResponse } from '../types';
import { hashBase64, prepareImage } from './image';
import { findCached, saveRecent } from './storage';

export class ApiError extends Error {
  status: number;
  detail?: string;
  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function postJson<T>(url: string, body: unknown, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text.slice(0, 200) };
    }
    if (!res.ok) {
      throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.detail);
    }
    return data as T;
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new ApiError('The request took too long. Check your connection and try again.', 504);
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || 'Network error. Are you online?', 0);
  } finally {
    clearTimeout(timer);
  }
}

export function citationFor(item: number): string {
  return `Guideline 4 read with Annexure 1, Item ${item}`;
}

/** Convert Gemini's [ymin, xmin, ymax, xmax] on 0–1000 into fractional {x,y,w,h}. */
function boxFrom2d(b: [number, number, number, number]) {
  const [ymin, xmin, ymax, xmax] = b.map((n) => Math.min(1000, Math.max(0, Number(n) || 0)));
  const x = Math.min(xmin, xmax) / 1000;
  const y = Math.min(ymin, ymax) / 1000;
  const w = Math.max(0.01, Math.abs(xmax - xmin) / 1000);
  const h = Math.max(0.01, Math.abs(ymax - ymin) / 1000);
  return { x, y, w, h };
}

const CONF_ORDER = { high: 0, medium: 1, low: 2 } as const;

export interface AnalyzeOptions {
  /** Called with a progress label while preparing/uploading. */
  onStatus?: (label: string) => void;
  /** Skip the on-device cache and force a fresh call. */
  force?: boolean;
}

/** Analyse a screenshot (File or data URL). Returns a fully-formed AuditResult. */
export async function analyzeImage(src: File | string, opts: AnalyzeOptions = {}): Promise<AuditResult> {
  opts.onStatus?.('Preparing screenshot…');
  const prepared = await prepareImage(src);
  const id = await hashBase64(prepared.base64);

  if (!opts.force) {
    const cached = findCached(id);
    if (cached) {
      return { ...cached, cached: true };
    }
  }

  opts.onStatus?.('Reading the screen… matching against 13 patterns');
  const data = await postJson<AnalyzeResponse>('/api/analyze', { imageBase64: prepared.base64, mimeType: prepared.mimeType }, 60_000);

  const findings: Finding[] = (data.findings || [])
    .map((f, i) => ({
      id: i + 1,
      pattern: f.pattern,
      annexItem: f.annex_item,
      clause: citationFor(f.annex_item),
      evidence: f.evidence,
      explanation: f.explanation,
      confidence: f.confidence,
      box: boxFrom2d(f.box_2d),
    }))
    .sort((a, b) => CONF_ORDER[a.confidence] - CONF_ORDER[b.confidence] || a.box.y - b.box.y)
    .map((f, i) => ({ ...f, id: i + 1 }));

  const result: AuditResult = {
    id,
    imageDataUrl: prepared.dataUrl,
    imageWidth: prepared.width,
    imageHeight: prepared.height,
    platformGuess: data.platform_guess || 'Unknown platform',
    screenType: data.screen_type || 'Screen',
    summary: data.summary || '',
    findings,
    analyzedAt: new Date().toISOString(),
    model: data.model,
  };
  saveRecent(result);
  return result;
}

export async function draftGrievance(payload: GrievanceRequest): Promise<GrievanceResponse> {
  return postJson<GrievanceResponse>('/api/grievance', payload, 50_000);
}

export interface HealthResponse {
  ok: boolean;
  configured: boolean;
  model: string;
  time: string;
}

export async function checkHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}

/** Offline fallback used only if the drafting API fails: a template filled from the REAL findings of this scan. */
export function templateGrievance(payload: GrievanceRequest): GrievanceResponse {
  const c = payload.complainant || {};
  const date = new Date(payload.observedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const lines = payload.findings.map(
    (f, i) => `${i + 1}. ${f.pattern} — ${citationFor(f.annexItem)}. On-screen evidence: "${f.evidence}". ${f.explanation}`,
  );
  const amount = c.amount ? ` of ₹${c.amount}` : '';
  const body = [
    `To the National Consumer Helpline,`,
    ``,
    `I wish to report the use of dark patterns on ${payload.platform} (${payload.screenType}) observed on ${date}.${c.orderId ? ` Order/booking reference: ${c.orderId}.` : ''}`,
    ``,
    `The following prohibited practices were visible on the screen:`,
    ...lines,
    ``,
    `These practices are prohibited under the Guidelines for Prevention and Regulation of Dark Patterns, 2023, issued by the Central Consumer Protection Authority under the Consumer Protection Act, 2019.`,
    ``,
    `I request: (a) reversal of any hidden or unconsented charge${amount}; (b) that the platform be directed to remove these patterns from its interface; and (c) appropriate action by the CCPA.`,
    ``,
    `A screenshot of the screen is attached as evidence.`,
    ``,
    `Name: ${c.name || '[Your name]'}`,
    `Mobile: ${c.phone || '[Your mobile number]'}`,
    `Email: ${c.email || '[Your email, optional]'}`,
  ].join('\n');
  return { subject: `Dark patterns observed on ${payload.platform} — ${payload.findings.length} violation(s) of the 2023 Guidelines`, body, model: 'template' };
}
