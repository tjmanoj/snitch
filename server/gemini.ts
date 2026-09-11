/**
 * Shared server-side Gemini logic.
 * Lives outside /api so Vercel never treats it as a route. Imported by api/*.ts and the Vite dev middleware.
 * The API key never leaves the server.
 */
import { GoogleGenAI, Type } from '@google/genai';

export const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

/** The 13 dark patterns named in Annexure 1 of the CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023. */
export const PATTERNS_13: Array<{ item: number; name: string; definition: string }> = [
  { item: 1, name: 'False urgency', definition: 'Falsely stating or implying urgency or scarcity to push an immediate purchase (fake countdowns, "only 2 left" without basis).' },
  { item: 2, name: 'Basket sneaking', definition: 'Adding items, services, donations, memberships or charges to the cart without the user\'s explicit consent (pre-ticked add-ons).' },
  { item: 3, name: 'Confirm shaming', definition: 'Using guilt, fear, shame or ridicule in wording to steer the user\'s choice ("No, I don\'t want to protect my family").' },
  { item: 4, name: 'Forced action', definition: 'Forcing the user to buy extra goods, subscribe, share data or take an unrelated action to complete what they came for.' },
  { item: 5, name: 'Subscription trap', definition: 'Making cancellation impossible, hidden, complex or lengthy, or hiding cancellation instructions.' },
  { item: 6, name: 'Interface interference', definition: 'Designing the interface to highlight one option and obscure another (bright accept vs faint decline, misleading toggles).' },
  { item: 7, name: 'Bait and switch', definition: 'Advertising one outcome and delivering another (free delivery that becomes paid, product swapped for a pricier one).' },
  { item: 8, name: 'Drip pricing', definition: 'Revealing parts of the price only at later steps or after purchase (platform, convenience, handling fees added at payment).' },
  { item: 9, name: 'Disguised advertisement', definition: 'Ads posing as content, reviews or ordinary results without a clear label.' },
  { item: 10, name: 'Nagging', definition: 'Repeated, disruptive prompts or requests unrelated to the user\'s goal (repeated notification/permission prompts, reappearing upsells).' },
  { item: 11, name: 'Trick question', definition: 'Confusing or double-negative wording that leads to an unintended answer.' },
  { item: 12, name: 'SaaS billing', definition: 'Silent recurring charges, especially after a trial, using stored payment details without clear notice.' },
  { item: 13, name: 'Rogue malwares', definition: 'Fake warnings or scareware ads that push a download or a payment.' },
];

export const PATTERN_NAMES = PATTERNS_13.map((p) => p.name);

export function citationFor(item: number): string {
  return `Guideline 4 read with Annexure 1, Item ${item}`;
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw fault('The analysis service is not configured.', 500, 'NO_API_KEY');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Every error we hand back to the browser carries a stable `code`. The client maps
 * that code to the wording the user sees, so provider names, model names and raw
 * upstream text never reach the page.
 */
export type FaultCode =
  | 'NO_API_KEY'
  | 'BAD_REQUEST'
  | 'IMAGE_TOO_LARGE'
  | 'UNREADABLE_RESPONSE'
  | 'RATE_LIMITED'
  | 'UPSTREAM_BUSY'
  | 'UPSTREAM_ERROR'
  | 'TIMEOUT';

export function fault(message: string, status: number, code: FaultCode) {
  return Object.assign(new Error(message), { status, code });
}

/**
 * The SDK reports provider failures as an Error whose message is the raw upstream
 * JSON. Parse what we can, log the real thing for whoever runs the server, and
 * return a fault carrying only a code.
 */
function normaliseUpstream(err: any, label: string) {
  if (err?.code && err?.status) return err; // already one of ours

  let upstreamStatus = Number(err?.status) || 0;
  let upstreamText = String(err?.message || '');
  try {
    const parsed = JSON.parse(upstreamText);
    const inner = parsed?.error ?? parsed;
    if (inner?.code) upstreamStatus = Number(inner.code) || upstreamStatus;
    if (inner?.message) upstreamText = String(inner.message);
  } catch {
    /* message was not JSON; keep it as-is for the log */
  }

  console.error(`[snitch] ${label} failed (upstream status ${upstreamStatus || 'unknown'}): ${upstreamText}`);

  if (upstreamStatus === 429) return fault('The service is busy.', 429, 'RATE_LIMITED');
  if (upstreamStatus === 503) return fault('The service is briefly unavailable.', 503, 'UPSTREAM_BUSY');
  return fault('The service could not complete this request.', 502, 'UPSTREAM_ERROR');
}

/** Run one provider call, turning any failure into a coded fault. */
async function callModel<T>(run: () => Promise<T>, label: string): Promise<T> {
  try {
    return await run();
  } catch (err) {
    throw normaliseUpstream(err, label);
  }
}

const ANALYZE_SYSTEM = `You are a consumer-protection auditor applying India's "Guidelines for Prevention and Regulation of Dark Patterns, 2023", issued by the Central Consumer Protection Authority (CCPA) under the Consumer Protection Act, 2019.

You will be shown ONE screenshot of an app or website (checkout, payment, booking, subscription, cancellation, sign-up, or similar).

Your job:
1. Identify every dark pattern that is VISIBLE in the screenshot. Only flag what you can actually see; never assume what other screens contain.
2. Name each one using exactly one of the 13 pattern names below and give its Annexure 1 item number.
3. Quote the exact on-screen text or describe the exact element that is the evidence.
4. Explain in ONE plain-language sentence, for a non-lawyer, why it is a problem.
5. Give a confidence level: "high" only when the evidence is unambiguous; "medium" when it is likely but a legitimate reading exists; "low" when it is a weak signal.
6. Give a bounding box for the evidence as box_2d = [ymin, xmin, ymax, xmax] on a 0–1000 scale of the image.

Rules:
- Prefer fewer, confident findings over many speculative ones. Do not invent findings. If nothing qualifies, return an empty findings list.
- A genuine, disclosed limit (e.g. "3 seats left" on a real inventory) is NOT false urgency unless the screen shows it is fabricated or undisclosed. When unsure, use "low" confidence.
- Do not flag the same element twice under two names; pick the best-fitting pattern.
- Never include personal data (names, phone numbers, addresses) in evidence text; describe the element instead.
- platform_guess: the app/brand if visible on screen, otherwise "Unknown platform".
- screen_type: e.g. "Payment page", "Cart", "Cancellation flow", "Sign-up".
- summary: one sentence a consumer could read aloud.

The 13 patterns (Annexure 1):
${PATTERNS_13.map((p) => `${p.item}. ${p.name} — ${p.definition}`).join('\n')}`;

const analyzeSchema = {
  type: Type.OBJECT,
  properties: {
    platform_guess: { type: Type.STRING },
    screen_type: { type: Type.STRING },
    summary: { type: Type.STRING },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          pattern: { type: Type.STRING, enum: PATTERN_NAMES },
          annex_item: { type: Type.INTEGER },
          evidence: { type: Type.STRING },
          explanation: { type: Type.STRING },
          confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          box_2d: { type: Type.ARRAY, items: { type: Type.INTEGER }, description: 'Exactly four integers: [ymin, xmin, ymax, xmax] on a 0-1000 scale.' },
        },
        required: ['pattern', 'annex_item', 'evidence', 'explanation', 'confidence', 'box_2d'],
      },
    },
  },
  required: ['platform_guess', 'screen_type', 'summary', 'findings'],
};

export interface AnalyzeInput {
  imageBase64: string;
  mimeType: string;
}

export async function analyzeScreenshot(input: AnalyzeInput) {
  if (!input?.imageBase64 || !input?.mimeType) {
    throw fault('imageBase64 and mimeType are required.', 400, 'BAD_REQUEST');
  }
  if (!/^image\/(png|jpeg|jpg|webp)$/i.test(input.mimeType)) {
    throw fault('Only PNG, JPEG and WebP screenshots are supported.', 400, 'BAD_REQUEST');
  }
  // ~4MB of base64 ≈ 3MB binary. The client downsizes before upload, so this is a safety net.
  if (input.imageBase64.length > 4_500_000) {
    throw fault('Screenshot is too large. Please upload an image under 3MB.', 413, 'IMAGE_TOO_LARGE');
  }

  const ai = getClient();
  const model = DEFAULT_MODEL;

  const response = await callModel(() => ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: input.mimeType, data: input.imageBase64 } },
          { text: 'Audit this screenshot against the 13 dark patterns. Return JSON only.' },
        ],
      },
    ],
    config: {
      systemInstruction: ANALYZE_SYSTEM,
      responseMimeType: 'application/json',
      responseSchema: analyzeSchema,
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  }), 'Analysis');

  const text = response.text ?? '';
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('[snitch] response was not valid JSON:', text.slice(0, 300));
    throw fault('The response could not be read.', 502, 'UNREADABLE_RESPONSE');
  }

  // Normalise: make sure annex_item matches the pattern name, clamp boxes.
  const findings = Array.isArray(parsed.findings) ? parsed.findings : [];
  const normalised = findings
    .filter((f: any) => f && typeof f.pattern === 'string')
    .map((f: any) => {
      const byName = PATTERNS_13.find((p) => p.name.toLowerCase() === String(f.pattern).toLowerCase());
      const item = byName ? byName.item : Math.min(13, Math.max(1, Number(f.annex_item) || 1));
      const raw = Array.isArray(f.box_2d) && f.box_2d.length === 4 ? f.box_2d.map((n: any) => Number(n) || 0) : [0, 0, 1000, 1000];
      const clamp = (n: number) => Math.min(1000, Math.max(0, n));
      const box_2d: [number, number, number, number] = [clamp(raw[0]), clamp(raw[1]), clamp(raw[2]), clamp(raw[3])];
      const confidence = ['high', 'medium', 'low'].includes(f.confidence) ? f.confidence : 'medium';
      return {
        pattern: byName ? byName.name : String(f.pattern),
        annex_item: item,
        evidence: String(f.evidence || '').slice(0, 300),
        explanation: String(f.explanation || '').slice(0, 400),
        confidence,
        box_2d,
      };
    });

  return {
    platform_guess: String(parsed.platform_guess || 'Unknown platform'),
    screen_type: String(parsed.screen_type || 'Screen'),
    summary: String(parsed.summary || (normalised.length ? `${normalised.length} dark pattern(s) found.` : 'No dark patterns detected on this screen.')),
    findings: normalised,
  };
}

// ---------------------------------------------------------------------------
// Grievance drafting
// ---------------------------------------------------------------------------

export interface GrievanceInput {
  platform: string;
  screenType: string;
  observedAt: string;
  findings: Array<{ pattern: string; annexItem: number; evidence: string; explanation: string; confidence: string }>;
  complainant: { name?: string; phone?: string; email?: string; orderId?: string; amount?: string };
  tone?: 'formal' | 'simple';
}

const GRIEVANCE_SYSTEM = `You draft consumer grievances for the National Consumer Helpline (NCH, 1915) and the INGRAM portal (consumerhelpline.gov.in) in India.

Write a grievance a case officer can act on. Requirements:
- 150–260 words in the body. Plain, respectful, factual. No threats, no exaggeration, no legal citations beyond the ones provided.
- Structure the body as: (1) what the consumer was doing and on which platform/screen, (2) a numbered list of each dark pattern observed with the on-screen evidence quoted and the citation "Guideline 4 read with Annexure 1, Item N" of the Guidelines for Prevention and Regulation of Dark Patterns, 2023, (3) the remedy requested, (4) a line stating that a screenshot is attached as evidence.
- Remedy: refund/reversal of any hidden or unconsented charge (use the amount if provided), removal of the pattern, and appropriate action by the CCPA under the Consumer Protection Act, 2019.
- If complainant details are missing, leave clearly marked placeholders in square brackets like [Your name]. Never invent names, order IDs, amounts or contact details.
- tone "simple" = shorter sentences and everyday words; "formal" = standard grievance register.
- Also produce a subject line under 90 characters.
Return JSON with keys "subject" and "body" only.`;

const grievanceSchema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    body: { type: Type.STRING },
  },
  required: ['subject', 'body'],
};

export async function draftGrievance(input: GrievanceInput) {
  if (!input || !Array.isArray(input.findings) || input.findings.length === 0) {
    throw fault('At least one finding is required to draft a grievance.', 400, 'BAD_REQUEST');
  }
  const ai = getClient();
  const model = DEFAULT_MODEL;

  const facts = {
    platform: input.platform || 'Unknown platform',
    screenType: input.screenType || 'Screen',
    observedAt: input.observedAt,
    findings: input.findings.map((f) => ({
      pattern: f.pattern,
      citation: citationFor(f.annexItem),
      evidence: f.evidence,
      explanation: f.explanation,
      confidence: f.confidence,
    })),
    complainant: input.complainant || {},
    tone: input.tone || 'formal',
  };

  const response = await callModel(() => ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: `Draft the grievance from these facts:\n${JSON.stringify(facts, null, 2)}` }] }],
    config: {
      systemInstruction: GRIEVANCE_SYSTEM,
      responseMimeType: 'application/json',
      responseSchema: grievanceSchema,
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  }), 'Drafting');

  const text = response.text ?? '';
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('[snitch] response was not valid JSON:', text.slice(0, 300));
    throw fault('The response could not be read.', 502, 'UNREADABLE_RESPONSE');
  }
  return {
    subject: String(parsed.subject || 'Complaint: dark patterns observed on ' + facts.platform).slice(0, 140),
    body: String(parsed.body || ''),
  };
}

// ---------------------------------------------------------------------------
// Minimal request/response helpers shared by Vercel and the Vite dev server
// ---------------------------------------------------------------------------

export interface MinimalRes {
  status: (code: number) => MinimalRes;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  end: (body?: string) => void;
}

/**
 * The only place an error becomes an HTTP response. Anything without one of our own
 * codes is treated as unexpected: it is logged in full and reported generically, so
 * stack traces, provider names and model names never reach the browser. The client
 * turns `code` into the sentence the user reads.
 */
export function sendError(res: MinimalRes, err: any) {
  const code = err?.code as FaultCode | undefined;
  if (!code) {
    console.error('[snitch] unhandled error:', err?.stack || err?.message || err);
    res.status(500).json({ error: 'Something went wrong on our side.', code: 'UPSTREAM_ERROR' });
    return;
  }
  res.status(Number(err?.status) || 500).json({ error: String(err?.message || 'Request failed.'), code });
}

export async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let t: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    t = setTimeout(() => reject(fault(`${label} timed out after ${Math.round(ms / 1000)}s.`, 504, 'TIMEOUT')), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(t!);
  }
}
