/**
 * Shared server-side Gemini logic.
 * Lives outside /api so Vercel never treats it as a route. Imported by api/*.ts and the Vite dev middleware.
 * The API key never leaves the server.
 */
import { GoogleGenAI, Type } from '@google/genai';

export const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

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
    throw Object.assign(new Error('GEMINI_API_KEY is not set on the server.'), { status: 500, code: 'NO_API_KEY' });
  }
  return new GoogleGenAI({ apiKey });
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
    throw Object.assign(new Error('imageBase64 and mimeType are required.'), { status: 400 });
  }
  if (!/^image\/(png|jpeg|jpg|webp)$/i.test(input.mimeType)) {
    throw Object.assign(new Error('Only PNG, JPEG and WebP screenshots are supported.'), { status: 400 });
  }
  // ~4MB of base64 ≈ 3MB binary. The client downsizes before upload, so this is a safety net.
  if (input.imageBase64.length > 4_500_000) {
    throw Object.assign(new Error('Screenshot is too large. Please upload an image under 3MB.'), { status: 413 });
  }

  const ai = getClient();
  const model = DEFAULT_MODEL;

  const response = await ai.models.generateContent({
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
  });

  const text = response.text ?? '';
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw Object.assign(new Error('The model returned a response that was not valid JSON. Please try again.'), { status: 502 });
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
    model,
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
    throw Object.assign(new Error('At least one finding is required to draft a grievance.'), { status: 400 });
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

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: `Draft the grievance from these facts:\n${JSON.stringify(facts, null, 2)}` }] }],
    config: {
      systemInstruction: GRIEVANCE_SYSTEM,
      responseMimeType: 'application/json',
      responseSchema: grievanceSchema,
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  });

  const text = response.text ?? '';
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw Object.assign(new Error('The model returned a response that was not valid JSON. Please try again.'), { status: 502 });
  }
  return {
    subject: String(parsed.subject || 'Complaint: dark patterns observed on ' + facts.platform).slice(0, 140),
    body: String(parsed.body || ''),
    model,
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

export function sendError(res: MinimalRes, err: any) {
  const status = Number(err?.status) || 500;
  const message =
    status === 500 && !err?.code
      ? 'Analysis failed on the server. Check the GEMINI_API_KEY and try again.'
      : String(err?.message || 'Unknown error');
  // Surface upstream Gemini errors in a readable way.
  const detail = err?.error?.message || err?.cause?.message || undefined;
  res.status(status).json({ error: message, detail, code: err?.code });
}

export async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let t: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    t = setTimeout(() => reject(Object.assign(new Error(`${label} timed out after ${Math.round(ms / 1000)}s. Please try again.`), { status: 504 })), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(t!);
  }
}
