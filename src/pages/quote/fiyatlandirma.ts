/**
 * Teklif kartlarındaki indirim gösterimi.
 *
 * IO'dan gelen prim müşterinin ödeyeceği gerçek tutar. Kartta bunun yanında
 * bir de üstü çizili referans fiyat gösteriliyor: prim, ait olduğu dilimin
 * oranıyla şişirilip liste fiyatı olarak yazılıyor, aradaki fark da kazanç
 * olarak veriliyor.
 *
 * Dilim sınırları üst uca dahil: 10.000 TL prim "5.000–10.000" diliminde
 * sayılır ve %18 uygulanır.
 */

interface Dilim {
  /** Bu tutara kadar (dahil) geçerli. */
  ustSinir: number;
  oran: number;
}

const DILIMLER: Dilim[] = [
  { ustSinir: 5_000, oran: 0.15 },
  { ustSinir: 10_000, oran: 0.18 },
  { ustSinir: 25_000, oran: 0.2 },
  { ustSinir: 50_000, oran: 0.22 },
  { ustSinir: 100_000, oran: 0.25 },
  { ustSinir: 250_000, oran: 0.28 },
  { ustSinir: 500_000, oran: 0.3 },
];

/** Tablodaki son dilimin üstünde kalan primler için oran. */
const UST_ORAN = 0.3;

export interface FiyatGosterimi {
  /** Müşterinin ödeyeceği tutar (IO'dan gelen prim). */
  prim: number;
  /** Üstü çizili gösterilen referans fiyat. */
  listeFiyati: number;
  kazanc: number;
  /** Kartta "%18" olarak yazılan tam sayı oran. */
  yuzde: number;
}

function oranBul(prim: number): number {
  for (const dilim of DILIMLER) {
    if (prim <= dilim.ustSinir) return dilim.oran;
  }
  return UST_ORAN;
}

function kurusaYuvarla(tutar: number): number {
  return Math.round(tutar * 100) / 100;
}

/**
 * Geçersiz veya sıfır primlerde null döner; çağıran taraf o durumda yalnızca
 * primi gösterir.
 */
export function fiyatGosterimi(prim: unknown): FiyatGosterimi | null {
  if (typeof prim !== "number" || !Number.isFinite(prim) || prim <= 0) {
    return null;
  }

  const oran = oranBul(prim);
  const listeFiyati = kurusaYuvarla(prim * (1 + oran));

  return {
    prim,
    listeFiyati,
    kazanc: kurusaYuvarla(listeFiyati - prim),
    yuzde: Math.round(oran * 100),
  };
}
