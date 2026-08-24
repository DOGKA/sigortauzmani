/**
 * Anında satın alınabilir şirketler — ürün bazlı izin listesi.
 *
 * Listede olan şirketlerde mevcut kurgu durur: prim şişirilir, indirim
 * (üstü çizili liste + kazanç) gösterilir, buton "Satın al"dır.
 *
 * Listede olmayanlarda prim yine şişirilir ama indirim uygulanmaz; müşteri
 * yalnızca şişirilmiş tutarı görür ve "Teklif iste" ile admin talebine düşer.
 *
 * Kısa süreli trafik ayrı bir branş değil, aynı branşta `KisaSureli: true`
 * ile çalışıyor; şirket listesi farklı olduğu için bayrakla ayrılıyor.
 */

import { normalizeSirketKodu } from "./sirketler";

/** IO `SirketKodu` — üç haneli. */
const SEYAHAT = ["126", "061"] as const; // Hepiyi, Sompo
const IMM = ["061", "042", "093"] as const; // Sompo, Ray, Neova
const TRAFIK = ["061", "042", "126", "110", "019", "018", "127"] as const; // Sompo, Ray, Hepiyi, Quick, Corpus, Zurich, Emaa
const KASKO = TRAFIK;
const DASK = ["061", "042", "126", "051"] as const; // Sompo, Ray, Hepiyi, Türk Nippon
const KISA_VADELI_TRAFIK = ["051", "061", "042", "093", "019"] as const; // Türk Nippon, Sompo, Ray, Neova, Corpus

const BRANS_IZIN: Record<number, readonly string[]> = {
  0: TRAFIK,
  1: KASKO,
  2: DASK,
  6: SEYAHAT,
  22: IMM,
};

export function satinAlinabilirSirket(
  bransNo: number,
  sirketKodu: string | number | null | undefined,
  kisaVadeli = false,
): boolean {
  const kod = normalizeSirketKodu(sirketKodu);
  if (!kod) return false;
  const liste =
    kisaVadeli && bransNo === 0 ? KISA_VADELI_TRAFIK : BRANS_IZIN[bransNo];
  return liste ? liste.includes(kod) : false;
}
