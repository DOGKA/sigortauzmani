/**
 * Anında satın alınabilir şirketler.
 *
 * Sitede açık her şirket (`sirketler.ts` aktif listesi) IO ile çalışan
 * branşlarda doğrudan satın alınabilir: partner CRM bu şirketlerde 3D Secure
 * ödemenin açık olduğunu teyit etti. Buton "Satın al"dır ve akış ödeme
 * adımına gider. IO ile çalışmayan branşlarda buton "Teklif iste"dir ve
 * admin talebine düşer.
 *
 * Kısa süreli trafik ayrı bir branş değil, aynı branşta `KisaSureli: true`
 * ile çalışıyor; şirket listesi aynı olduğu için ayrıca ele alınmıyor.
 */

import { normalizeSirketKodu, sirketGizli } from "./sirketler";

/** Trafik, Kasko, DASK, Seyahat Sağlık, İMM. */
const SATIN_ALMA_BRANSLARI = new Set([0, 1, 2, 6, 22]);

export function satinAlinabilirSirket(
  bransNo: number,
  sirketKodu: string | number | null | undefined,
  _kisaVadeli = false,
): boolean {
  const kod = normalizeSirketKodu(sirketKodu);
  if (!kod) return false;
  return SATIN_ALMA_BRANSLARI.has(bransNo) && !sirketGizli(kod);
}
