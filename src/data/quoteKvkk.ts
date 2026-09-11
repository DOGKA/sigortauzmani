/**
 * Teklif formlarında ilk kişisel veri adımında gösterilen KVKK aydınlatma
 * metni. Onay kutusu kullanılmaz; metin bilgilendirme amaçlıdır.
 */

import { isSaglikUrunu, SAGLIK_AYDINLATMA_GOVDE } from "./saglikRiza";

const QUOTE_SLUGS = new Set([
  "trafik-sigortasi",
  "kisa-sureli-trafik",
  "kasko",
  "imm",
  "yesil-kart",
  "dask",
  "konut",
  "tamamlayici-saglik",
  "ozel-saglik",
  "seyahat-saglik",
]);

/**
 * Gösterilen aydınlatma metninin sürümü. Talep kaydına yazılıyor ki hangi
 * kullanıcıya hangi metnin gösterildiği sonradan kanıtlanabilsin; metnin
 * gövdesi her değiştiğinde bu değer de güncellenmeli.
 */
export const QUOTE_KVKK_SURUM = "2026-09-11";

/** Metnin gövdesi; kapanış cümlesi bileşende bağlantıyla birleştirilir. */
export const QUOTE_KVKK_GOVDE =
  "Paylaştığınız kişisel veriler, talep ettiğiniz sigorta teklifinin oluşturulması ve ilgili sigorta şirketlerinden fiyat alınması amacıyla işlenir.";

export function getQuoteKvkkGovde(slug: string): string | undefined {
  if (!QUOTE_SLUGS.has(slug)) return undefined;
  if (isSaglikUrunu(slug)) return SAGLIK_AYDINLATMA_GOVDE;
  return QUOTE_KVKK_GOVDE;
}
