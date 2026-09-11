/**
 * On-device cache of REAL analysis results (never seeded with fake data).
 * Lets a previously analysed screenshot reopen instantly and survives a slow network during a demo.
 */
import type { AuditResult } from '../types';

const RECENT_KEY = 'snitch:recent:v2';
const MAX_RECENT = 6;
const MAX_BYTES = 4 * 1024 * 1024; // stay under typical 5MB localStorage quotas

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function loadRecent(): AuditResult[] {
  const raw = safeGet(RECENT_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as AuditResult[]) : [];
  } catch {
    return [];
  }
}

export function findCached(id: string): AuditResult | undefined {
  return loadRecent().find((r) => r.id === id);
}

export function saveRecent(result: AuditResult): void {
  const list = loadRecent().filter((r) => r.id !== result.id);
  list.unshift({ ...result, cached: undefined });
  let trimmed = list.slice(0, MAX_RECENT);
  // Drop oldest entries until it fits.
  while (trimmed.length && JSON.stringify(trimmed).length > MAX_BYTES) trimmed = trimmed.slice(0, -1);
  safeSet(RECENT_KEY, JSON.stringify(trimmed));
}

export function removeRecent(id: string): void {
  safeSet(RECENT_KEY, JSON.stringify(loadRecent().filter((r) => r.id !== id)));
}

export function clearRecent(): void {
  safeSet(RECENT_KEY, '[]');
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
}
