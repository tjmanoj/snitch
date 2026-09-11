export type ScreenTab = 'scan' | 'analysis' | 'grievance' | '13-patterns' | 'share-dossier';

export type ThemeMode = 'dark' | 'light';

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

export interface AuditPin {
  id: number;
  title: string;
  shortLabel: string;
  patternName: string;
  clause: string;
  description: string;
  quote: string;
  confidence: 'High Confidence' | 'Medium Confidence';
  topPct: string;
  leftPct: string;
}

export interface AuditDocket {
  id: string;
  name: string;
  subtitle: string;
  domain: string;
  score: string;
  infractionCount: number;
  badgeText: string;
  icon: string;
  pins: AuditPin[];
}
