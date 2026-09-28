import { normalizeSirketKodu } from "./sirketler";

/** AXA başarılı kaydı `Hata` alanına yazar. Anında satın alma yalnız bu notta açılır. */
const AXA = "040";

/**
 * Başarı notu, metnin kendisinden okunur.
 * "Kayıt işlemi tamamlandı" geçer. Aynı metinde otorizasyon, ret veya
 * "tamamlanamadı" varsa geçmez.
 */
export function hataBasariNotu(hata: string | null | undefined): boolean {
  if (typeof hata !== "string") return false;
  const metin = hata.trim();
  if (!metin) return false;
  if (/otoriz|hata|redd|uygun de[ğg]il|yetki/i.test(metin)) return false;
  if (/tamamlanamad[ıi]/i.test(metin)) return false;
  return /kay[ıi]t i[sş]lemi tamamland[ıi]/i.test(metin);
}

export function axaAnindaSatinAl(girdi: {
  sirketKodu: string | number | null | undefined;
  satinAl: boolean | null | undefined;
  prim: number | null;
  teklifNo: string | null | undefined;
  hata: string | null | undefined;
}): boolean {
  if (normalizeSirketKodu(girdi.sirketKodu) !== AXA) return false;
  if (girdi.satinAl !== true) return false;
  if (girdi.prim === null || girdi.prim <= 0) return false;
  if (typeof girdi.teklifNo !== "string" || !girdi.teklifNo.trim()) return false;
  return hataBasariNotu(girdi.hata);
}
