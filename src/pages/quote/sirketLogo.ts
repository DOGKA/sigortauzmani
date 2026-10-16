import { normalizeSirketKodu } from "../../lib/io/sirketler";

const LOGO_DOSYALARI: Record<string, string> = {
  "004": "aksigorta.webp",
  "005": "gig-sigorta.webp",
  "007": "anadolu.webp",
  "009": "ankara.webp",
  "017": "unico-sigorta.webp",
  "018": "zurich-sigorta.webp",
  "019": "corpus-sigorta.webp",
  "025": "referans-sigorta.webp",
  "036": "magdeburger-sigorta.webp",
  "040": "axa.webp",
  "042": "ray-sigorta.webp",
  "045": "allianz.webp",
  "050": "mapfre.webp",
  "051": "turk-nippon-sigorta.webp",
  "054": "hdi.webp",
  "057": "bereket-sigorta.webp",
  "061": "sompo.webp",
  "093": "neova-sigorta.webp",
  "104": "doga-sigorta.webp",
  "106": "orient-sigorta.webp",
  "110": "quick-sigorta.webp",
  "116": "turkiye.webp",
  "126": "hepsi-iyi-sigorta.webp",
  "127": "emaa-sigorta.webp",
};

/** Şirketin logo yolu; logosu olmayan şirket için `null` (baş harfler gösterilir). */
export function sirketLogosu(kod: string | number | null | undefined): string | null {
  const dosya = LOGO_DOSYALARI[normalizeSirketKodu(kod)];
  return dosya ? `/assets/img/partners/${dosya}` : null;
}
