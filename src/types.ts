export type ScreenTab = 'scan' | 'analysis' | 'grievance' | '13-patterns' | 'share-dossier';

export type ThemeMode = 'dark' | 'light';

export type Confidence = 'high' | 'medium' | 'low';

/** Reference data for one of the 13 patterns named in Annexure 1 of the 2023 Guidelines. */
export interface DarkPattern {
  id: string;
  number: string;
  category: 'checkout' | 'subscription' | 'psychological';
  name: string;
  title: string;
  clause: string;
  description: string;
  realExample: string;
  tag: string;
  tagType: 'danger' | 'warning' | 'info';
  keywords: string[];
}

/** Normalised bounding box, fractions of image width/height (0–1). */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One dark pattern the model found on the screenshot. Produced live by the API, never hardcoded. */
export interface Finding {
  id: number;
  /** Canonical pattern name, e.g. "False urgency". */
  pattern: string;
  /** 1–13, the item in Annexure 1 of the Guidelines. */
  annexItem: number;
  /** Citation string, e.g. "Guideline 4 read with Annexure 1, Item 8". */
  clause: string;
  /** The exact on-screen text or element the model used as evidence. */
  evidence: string;
  /** One plain-language sentence for a non-lawyer. */
  explanation: string;
  confidence: Confidence;
  box: Box;
}

/** The result of analysing one screenshot. */
export interface AuditResult {
  id: string;
  imageDataUrl: string;
  imageWidth: number;
  imageHeight: number;
  platformGuess: string;
  screenType: string;
  summary: string;
  findings: Finding[];
  analyzedAt: string;
  /** True when this result was restored from the on-device cache of a previous real analysis. */
  cached?: boolean;
}

export type AnalysisStatus = 'idle' | 'analyzing' | 'done' | 'error';

/** Shape returned by POST /api/analyze */
export interface AnalyzeResponse {
  platform_guess: string;
  screen_type: string;
  summary: string;
  findings: Array<{
    pattern: string;
    annex_item: number;
    evidence: string;
    explanation: string;
    confidence: Confidence;
    /** [ymin, xmin, ymax, xmax] on a 0–1000 scale (Gemini's native box format). */
    box_2d: [number, number, number, number];
  }>;
}

/** Shape sent to POST /api/grievance */
export interface GrievanceRequest {
  platform: string;
  screenType: string;
  observedAt: string;
  findings: Array<Pick<Finding, 'pattern' | 'annexItem' | 'evidence' | 'explanation' | 'confidence'>>;
  complainant: {
    name?: string;
    phone?: string;
    email?: string;
    orderId?: string;
    amount?: string;
  };
  tone?: 'formal' | 'simple';
}

export interface GrievanceResponse {
  subject: string;
  body: string;
}
