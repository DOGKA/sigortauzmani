import type { CookieConsentRecord } from "./types";

/**
 * Zorunlu olmayan üçüncü taraf araçları yalnızca kayıtlı onay sonrası yüklenir.
 * Yeni entegrasyon eklerken bu fonksiyona bağlayın; index.html'e doğrudan script
 * eklemeyin.
 */
export function applyOptionalConsents(consent: CookieConsentRecord | null): void {
  if (!consent) return;

  if (consent.analytics) {
    // Örn. Google Analytics — env tanımlıysa burada yüklenir.
  }

  if (consent.preferences) {
    // Örn. tercih çerezleri / A/B test araçları.
  }

  if (consent.marketing) {
    // Örn. Meta Pixel, yeniden hedefleme pikselleri.
  }
}
