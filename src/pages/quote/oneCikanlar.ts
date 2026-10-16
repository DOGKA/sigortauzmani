import type { SirketTeklifi } from "../../lib/io/types";

export type Etiket = "best" | "recommended" | "popular";

export interface OneCikan {
  teklif: SirketTeklifi;
  etiketler: Etiket[];
}

export function teklifAnahtari(bransNo: number, sirket: SirketTeklifi): string {
  return `${bransNo}-${sirket.Id}-${sirket.TeklifNo}`;
}

/**
 * Branşın öne çıkan teklifleri: en uygun, önerilen (panelden seçilen
 * şirketlerin en ucuzu) ve en popüler (son 90 günde en çok satılan şirketin
 * en ucuzu). Panelde seçim yoksa veya seçilen şirket fiyat vermediyse
 * önerilen, en uygundan sonraki en ucuz tekliftir. Aynı teklif birden çok
 * ölçüte uyarsa tek kartta etiketleri birleşir; bu yüzden 1 ile 3 arası
 * kart döner.
 */
export function oneCikanlar(
  bransNo: number,
  sirketler: SirketTeklifi[],
  onerilenKodlar: ReadonlySet<string>,
  populerKod: string | undefined,
): OneCikan[] {
  const sirali = [...sirketler].sort((a, b) => a.Prim - b.Prim);
  const enUygun = sirali[0];
  const onerilen =
    sirali.find((s) => onerilenKodlar.has(s.SirketKodu)) ??
    sirali.find((s) => s !== enUygun);
  const populer = populerKod
    ? sirali.find((s) => s.SirketKodu === populerKod)
    : undefined;
  const adaylar: [Etiket, SirketTeklifi | undefined][] = [
    ["best", enUygun],
    ["recommended", onerilen],
    ["popular", populer],
  ];

  const sonuc: OneCikan[] = [];
  const anahtarlar = new Map<string, OneCikan>();
  for (const [etiket, teklif] of adaylar) {
    if (!teklif) continue;
    const anahtar = teklifAnahtari(bransNo, teklif);
    const mevcut = anahtarlar.get(anahtar);
    if (mevcut) {
      mevcut.etiketler.push(etiket);
      continue;
    }
    const yeni = { teklif, etiketler: [etiket] };
    anahtarlar.set(anahtar, yeni);
    sonuc.push(yeni);
  }
  return sonuc;
}
