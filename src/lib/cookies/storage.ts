import { CONSENT_STORAGE_KEY, CONSENT_TEXT_VERSION } from "./config";
import type { CookieConsentRecord, CookiePreferences } from "./types";

function isRecord(value: unknown): value is CookieConsentRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as CookieConsentRecord;
  return (
    r.version === CONSENT_TEXT_VERSION &&
    typeof r.decidedAt === "string" &&
    typeof r.analytics === "boolean" &&
    typeof r.preferences === "boolean" &&
    typeof r.marketing === "boolean"
  );
}

export function readConsent(): CookieConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeConsent(preferences: CookiePreferences): CookieConsentRecord {
  const record: CookieConsentRecord = {
    ...preferences,
    version: CONSENT_TEXT_VERSION,
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  return record;
}

export function clearConsent(): void {
  localStorage.removeItem(CONSENT_STORAGE_KEY);
}
