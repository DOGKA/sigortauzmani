export interface CookiePreferences {
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}

export interface CookieConsentRecord extends CookiePreferences {
  /** Banner / tercih metni sürümü; değişince yeniden onay istenir. */
  version: string;
  /** ISO 8601 */
  decidedAt: string;
}

export type CookieConsentChoice = "reject" | "accept" | "custom";
