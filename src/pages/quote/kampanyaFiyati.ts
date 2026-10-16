/**
 * Zam yansıtılmayan kampanya gösterimi.
 *
 * IO primi müşterinin gerçekten ödeyeceği tutardır. Bu tutara, bulunduğu
 * dilimdeki zam oranı eklenerek karşılaştırma için zamlı fiyat hesaplanır.
 * Satın alma ve teklif sıralaması her zaman IO primini kullanmaya devam eder.
 */

const ZAM_DILIMLERI = [
  { ustSinir: 5_000, oran: 0.15 },
  { ustSinir: 10_000, oran: 0.18 },
  { ustSinir: 25_000, oran: 0.2 },
  { ustSinir: 50_000, oran: 0.22 },
  { ustSinir: 100_000, oran: 0.25 },
  { ustSinir: 250_000, oran: 0.28 },
  { ustSinir: Number.POSITIVE_INFINITY, oran: 0.3 },
] as const;

export interface KampanyaFiyati {
  zamliFiyat: number;
  avantaj: number;
}

function kurusaYuvarla(tutar: number): number {
  return Math.round((tutar + Number.EPSILON) * 100) / 100;
}

export function kampanyaFiyati(prim: number): KampanyaFiyati | null {
  if (!Number.isFinite(prim) || prim <= 0) return null;
  const dilim = ZAM_DILIMLERI.find(({ ustSinir }) => prim <= ustSinir);
  if (!dilim) return null;

  const zamliFiyat = kurusaYuvarla(prim * (1 + dilim.oran));
  return {
    zamliFiyat,
    avantaj: kurusaYuvarla(zamliFiyat - prim),
  };
}
