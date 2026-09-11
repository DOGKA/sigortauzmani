import type { SirketTeklifi } from "../../lib/io/types";

const ODEME_URL_ANAHTARLARI = [
  "OdemeUrl",
  "OdemeLink",
  "PaymentUrl",
  "SanalPosUrl",
  "ThreeDSUrl",
  "RedirectUrl",
] as const;

/** IO teklif yanıtında sigorta şirketi ödeme bağlantısı varsa okur. */
export function odemeUrlOku(teklif: SirketTeklifi): string | null {
  for (const anahtar of ODEME_URL_ANAHTARLARI) {
    const deger = teklif[anahtar];
    if (typeof deger === "string" && /^https?:\/\//i.test(deger.trim())) {
      return deger.trim();
    }
  }
  return null;
}

/** Bağlantı hedefini kullanıcıya göstermek için alan adını döndürür. */
export function odemeUrlEtiketi(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
