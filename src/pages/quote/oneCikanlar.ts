import { normalizeSirketKodu } from "../../lib/io/sirketler";
import type { SirketTeklifi } from "../../lib/io/types";

export type Etiket = "best" | "recommended" | "popular";

export interface OneCikan {
  teklif: SirketTeklifi;
  etiketler: Etiket[];
}

export function teklifAnahtari(bransNo: number, sirket: SirketTeklifi): string {
  return `${bransNo}-${sirket.Id}-${sirket.TeklifNo}`;
}

function kodKumesi(kodlar: ReadonlySet<string>): Set<string> {
  return new Set(
    [...kodlar].map((kod) => normalizeSirketKodu(kod)).filter(Boolean),
  );
}

/** Panelde işaretlenen şirket kodu mu? IO bazen dolgusuz ("4") döner. */
export function onerilenSirket(
  sirketKodu: string,
  onerilenKodlar: ReadonlySet<string>,
): boolean {
  const kume = kodKumesi(onerilenKodlar);
  return kume.size > 0 && kume.has(normalizeSirketKodu(sirketKodu));
}

/**
 * Branşın öne çıkan teklifleri: en ucuz, önerilen ve en popüler (son 90
 * günde en çok satılan şirketin en ucuzu). En ucuz her zaman en düşük
 * fiyattır. Önerilen, panelde işaretlenen şirketlerden en ucuz olmayanların
 * en düşük fiyatıdır; ikisi aynı şirkete düşmez. İşaret yoksa veya işaretli
 * şirketlerden ayrı fiyat gelmezse önerilen kart çıkmaz.
 */
export function oneCikanlar(
  bransNo: number,
  sirketler: SirketTeklifi[],
  onerilenKodlar: ReadonlySet<string>,
  populerKod: string | undefined,
): OneCikan[] {
  const sirali = [...sirketler].sort((a, b) => a.Prim - b.Prim);
  const enUygun = sirali[0];
  const enUygunKod = enUygun ? normalizeSirketKodu(enUygun.SirketKodu) : "";
  const onerilen = sirali.find(
    (s) =>
      normalizeSirketKodu(s.SirketKodu) !== enUygunKod &&
      onerilenSirket(s.SirketKodu, onerilenKodlar),
  );
  const populerNormal = populerKod ? normalizeSirketKodu(populerKod) : "";
  const populer = populerNormal
    ? sirali.find((s) => normalizeSirketKodu(s.SirketKodu) === populerNormal)
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
