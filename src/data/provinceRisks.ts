export type RiskLevel = 1 | 2 | 3 | 4 | 5;

export interface ProvinceRisk {
  name: string;
  risk: {
    earthquake: RiskLevel;
    flood: RiskLevel;
    hail: RiskLevel;
    theft: RiskLevel;
  };
}

export type RiskKey = keyof ProvinceRisk["risk"];

export const RISK_LABELS: Record<RiskKey, string> = {
  earthquake: "Deprem",
  flood: "Sel",
  hail: "Dolu",
  theft: "Araç Hırsızlığı",
};

/** 1 yeşil → 5 kırmızı */
export const RISK_COLORS: Record<RiskLevel, string> = {
  1: "#22c55e",
  2: "#86efac",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
};

export function stars(level: RiskLevel): string {
  return "★".repeat(level) + "☆".repeat(5 - level);
}

/**
 * İl bazlı risk skorları (1–5).
 *
 * Kaynaklar / yöntem:
 * - Deprem: AFAD Türkiye Deprem Tehlike Haritası (DD-2 / il merkezi) —
 *   Düşük=2, Orta=3, Yüksek=4, Çok Yüksek=5
 *   (özet: yapidan.com/deprem-haritasi · resmi: tdth.afad.gov.tr)
 * - Sel: Karadeniz / Marmara / Ege / Akdeniz taşkın maruziyeti çalışmaları
 *   (AFAD–DSİ / iklim risk tezleri; Giresun–Trabzon–Rize en yüksek)
 * - Dolu: Meteoroloji / tarımsal dolu hasarı yoğunluğu —
 *   İç Anadolu ve Trakya ovaları yüksek, Doğu Karadeniz / yüksek yaylalar düşük
 * - Araç hırsızlığı: Emniyet Genel Müdürlüğü hırsızlık yoğunluğu sıralaması
 *   + büyükşehir araç parkı / nüfus etkisi (İstanbul en yüksek)
 *
 * Not: İl geneli özet skordur; mahalle / koordinat bazlı AFAD–DSİ değerlerinden
 * farklılaşabilir. Sigorta primi için resmi tarife esas alınmalıdır.
 */
export const provinceRisks: ProvinceRisk[] = [
  { name: "Adana", risk: { earthquake: 4, flood: 4, hail: 3, theft: 4 } },
  { name: "Adıyaman", risk: { earthquake: 5, flood: 2, hail: 2, theft: 1 } },
  { name: "Afyon", risk: { earthquake: 3, flood: 2, hail: 3, theft: 2 } },
  { name: "Ağrı", risk: { earthquake: 4, flood: 2, hail: 2, theft: 1 } },
  { name: "Aksaray", risk: { earthquake: 2, flood: 2, hail: 4, theft: 2 } },
  { name: "Amasya", risk: { earthquake: 4, flood: 3, hail: 3, theft: 2 } },
  { name: "Ankara", risk: { earthquake: 3, flood: 2, hail: 4, theft: 5 } },
  { name: "Antalya", risk: { earthquake: 3, flood: 3, hail: 2, theft: 4 } },
  { name: "Ardahan", risk: { earthquake: 3, flood: 2, hail: 2, theft: 1 } },
  { name: "Artvin", risk: { earthquake: 2, flood: 4, hail: 2, theft: 1 } },
  { name: "Aydın", risk: { earthquake: 5, flood: 3, hail: 2, theft: 3 } },
  { name: "Balıkesir", risk: { earthquake: 4, flood: 3, hail: 3, theft: 3 } },
  { name: "Bartın", risk: { earthquake: 2, flood: 4, hail: 2, theft: 2 } },
  { name: "Batman", risk: { earthquake: 3, flood: 2, hail: 2, theft: 2 } },
  { name: "Bayburt", risk: { earthquake: 3, flood: 2, hail: 2, theft: 1 } },
  { name: "Bilecik", risk: { earthquake: 4, flood: 2, hail: 3, theft: 2 } },
  { name: "Bingöl", risk: { earthquake: 5, flood: 2, hail: 2, theft: 1 } },
  { name: "Bitlis", risk: { earthquake: 4, flood: 2, hail: 2, theft: 1 } },
  { name: "Bolu", risk: { earthquake: 5, flood: 2, hail: 3, theft: 2 } },
  { name: "Burdur", risk: { earthquake: 4, flood: 2, hail: 2, theft: 2 } },
  { name: "Bursa", risk: { earthquake: 5, flood: 3, hail: 3, theft: 4 } },
  { name: "Çanakkale", risk: { earthquake: 4, flood: 2, hail: 2, theft: 2 } },
  { name: "Çankırı", risk: { earthquake: 3, flood: 2, hail: 3, theft: 2 } },
  { name: "Çorum", risk: { earthquake: 4, flood: 2, hail: 3, theft: 2 } },
  { name: "Denizli", risk: { earthquake: 5, flood: 2, hail: 2, theft: 3 } },
  { name: "Diyarbakır", risk: { earthquake: 4, flood: 2, hail: 2, theft: 3 } },
  { name: "Düzce", risk: { earthquake: 5, flood: 3, hail: 3, theft: 2 } },
  { name: "Edirne", risk: { earthquake: 3, flood: 4, hail: 4, theft: 2 } },
  { name: "Elazığ", risk: { earthquake: 5, flood: 2, hail: 2, theft: 2 } },
  { name: "Erzincan", risk: { earthquake: 5, flood: 2, hail: 2, theft: 1 } },
  { name: "Erzurum", risk: { earthquake: 4, flood: 2, hail: 2, theft: 1 } },
  { name: "Eskişehir", risk: { earthquake: 3, flood: 2, hail: 4, theft: 3 } },
  { name: "Gaziantep", risk: { earthquake: 4, flood: 2, hail: 3, theft: 4 } },
  { name: "Giresun", risk: { earthquake: 2, flood: 5, hail: 2, theft: 2 } },
  { name: "Gümüşhane", risk: { earthquake: 2, flood: 3, hail: 2, theft: 1 } },
  { name: "Hakkari", risk: { earthquake: 4, flood: 2, hail: 1, theft: 1 } },
  { name: "Hatay", risk: { earthquake: 5, flood: 3, hail: 2, theft: 3 } },
  { name: "Iğdır", risk: { earthquake: 4, flood: 2, hail: 2, theft: 1 } },
  { name: "Isparta", risk: { earthquake: 4, flood: 2, hail: 2, theft: 2 } },
  { name: "İstanbul", risk: { earthquake: 5, flood: 3, hail: 3, theft: 5 } },
  { name: "İzmir", risk: { earthquake: 5, flood: 3, hail: 2, theft: 4 } },
  { name: "Kahramanmaraş", risk: { earthquake: 5, flood: 3, hail: 2, theft: 3 } },
  { name: "Karabük", risk: { earthquake: 3, flood: 3, hail: 2, theft: 2 } },
  { name: "Karaman", risk: { earthquake: 2, flood: 2, hail: 4, theft: 2 } },
  { name: "Kars", risk: { earthquake: 3, flood: 2, hail: 2, theft: 1 } },
  { name: "Kastamonu", risk: { earthquake: 3, flood: 3, hail: 2, theft: 2 } },
  { name: "Kayseri", risk: { earthquake: 3, flood: 2, hail: 4, theft: 3 } },
  { name: "Kilis", risk: { earthquake: 3, flood: 2, hail: 2, theft: 2 } },
  { name: "Kırıkkale", risk: { earthquake: 3, flood: 2, hail: 4, theft: 2 } },
  { name: "Kırklareli", risk: { earthquake: 3, flood: 3, hail: 4, theft: 2 } },
  { name: "Kırşehir", risk: { earthquake: 3, flood: 2, hail: 4, theft: 2 } },
  { name: "Kocaeli", risk: { earthquake: 5, flood: 3, hail: 3, theft: 4 } },
  { name: "Konya", risk: { earthquake: 2, flood: 2, hail: 5, theft: 3 } },
  { name: "Kütahya", risk: { earthquake: 4, flood: 2, hail: 3, theft: 2 } },
  { name: "Malatya", risk: { earthquake: 5, flood: 2, hail: 2, theft: 2 } },
  { name: "Manisa", risk: { earthquake: 5, flood: 3, hail: 2, theft: 3 } },
  { name: "Mardin", risk: { earthquake: 2, flood: 2, hail: 2, theft: 2 } },
  { name: "Mersin", risk: { earthquake: 3, flood: 3, hail: 2, theft: 3 } },
  { name: "Muğla", risk: { earthquake: 4, flood: 3, hail: 2, theft: 3 } },
  { name: "Muş", risk: { earthquake: 4, flood: 2, hail: 2, theft: 1 } },
  { name: "Nevşehir", risk: { earthquake: 2, flood: 2, hail: 4, theft: 2 } },
  { name: "Niğde", risk: { earthquake: 3, flood: 2, hail: 4, theft: 2 } },
  { name: "Ordu", risk: { earthquake: 2, flood: 5, hail: 2, theft: 2 } },
  { name: "Osmaniye", risk: { earthquake: 5, flood: 3, hail: 2, theft: 2 } },
  { name: "Rize", risk: { earthquake: 2, flood: 5, hail: 1, theft: 2 } },
  { name: "Sakarya", risk: { earthquake: 5, flood: 4, hail: 3, theft: 3 } },
  { name: "Samsun", risk: { earthquake: 2, flood: 4, hail: 3, theft: 3 } },
  { name: "Siirt", risk: { earthquake: 3, flood: 2, hail: 2, theft: 1 } },
  { name: "Sinop", risk: { earthquake: 2, flood: 4, hail: 2, theft: 2 } },
  { name: "Sivas", risk: { earthquake: 3, flood: 2, hail: 3, theft: 2 } },
  { name: "Şanlıurfa", risk: { earthquake: 3, flood: 2, hail: 3, theft: 3 } },
  { name: "Şırnak", risk: { earthquake: 3, flood: 2, hail: 2, theft: 1 } },
  { name: "Tekirdağ", risk: { earthquake: 5, flood: 3, hail: 4, theft: 3 } },
  { name: "Tokat", risk: { earthquake: 4, flood: 3, hail: 3, theft: 2 } },
  { name: "Trabzon", risk: { earthquake: 2, flood: 5, hail: 2, theft: 3 } },
  { name: "Tunceli", risk: { earthquake: 4, flood: 2, hail: 2, theft: 1 } },
  { name: "Uşak", risk: { earthquake: 4, flood: 2, hail: 2, theft: 2 } },
  { name: "Van", risk: { earthquake: 5, flood: 2, hail: 2, theft: 2 } },
  { name: "Yalova", risk: { earthquake: 5, flood: 3, hail: 3, theft: 3 } },
  { name: "Yozgat", risk: { earthquake: 3, flood: 2, hail: 4, theft: 2 } },
  { name: "Zonguldak", risk: { earthquake: 3, flood: 3, hail: 2, theft: 2 } },
];

export const provinceRiskByName = Object.fromEntries(
  provinceRisks.map((p) => [p.name, p]),
) as Record<string, ProvinceRisk>;
