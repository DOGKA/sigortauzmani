/**
 * Sitede açık sigorta şirketleri. Site (`src/lib/io/sirketler.ts`) liste
 * dışı şirketleri gizlemek, yönetim paneli "önerilen şirket" seçeneklerini
 * göstermek için okur.
 */
export const AKTIF_SIRKETLER = [
  { kod: "004", ad: "Aksigorta" },
  { kod: "005", ad: "Gulf Sigorta" },
  { kod: "007", ad: "Anadolu Sigorta" },
  { kod: "009", ad: "Ankara Sigorta" },
  { kod: "017", ad: "Unico Sigorta" },
  { kod: "018", ad: "Zurich Sigorta" },
  { kod: "025", ad: "Referans Sigorta" },
  { kod: "045", ad: "Allianz Sigorta" },
  { kod: "050", ad: "Mapfre Sigorta" },
  { kod: "051", ad: "Türk Nippon Sigorta" },
  { kod: "057", ad: "Bereket Sigorta" },
  { kod: "061", ad: "Sompo Sigorta" },
  { kod: "093", ad: "Neova Sigorta" },
  { kod: "106", ad: "Orient Sigorta" },
  { kod: "110", ad: "Quick Sigorta" },
  { kod: "116", ad: "Türkiye Sigorta" },
  { kod: "126", ad: "Hepiyi Sigorta" },
] as const;

export const AKTIF_SIRKET_KODLARI: readonly string[] = AKTIF_SIRKETLER.map((s) => s.kod);
