/**
 * IO API sigorta şirketi kodları.
 *
 * Hem arayüzde fiyat kartlarında hem sunucu tarafında (teklif fiyatlarını
 * kaydederken) gerekiyor, bu yüzden seçenek tablolarından ayrı tutuldu:
 * `api/io/primler.ts` bunu import ediyor ve edge bundle'ının gereksiz
 * büyümemesi gerekiyor.
 *
 * Kaynak: IO API Dokümantasyonu, "Sigorta Şirketi Kodları".
 */

export const SIRKET_ADLARI: Record<string, string> = {
  "000": "Tramer",
  "002": "Eureko Sigorta",
  "004": "Aksigorta",
  "005": "GIG Sigorta",
  "007": "Anadolu Sigorta",
  "009": "Ankara Sigorta",
  "011": "Groupama Sigorta",
  "015": "Halk Sigorta",
  "017": "Unico Sigorta",
  "018": "Zurich Sigorta",
  "019": "Corpus Sigorta",
  "025": "Referans Sigorta",
  "036": "Magdeburger Sigorta",
  "040": "AXA Sigorta",
  "041": "AXA Hayat Emeklilik",
  "042": "Ray Sigorta",
  "045": "Allianz Sigorta",
  "049": "SBN Sigorta",
  "050": "Mapfre Sigorta",
  "051": "Türk Nippon Sigorta",
  "054": "HDI Sigorta",
  "057": "Bereket Sigorta",
  "061": "Sompo Japan Sigorta",
  "063": "Dubai Group Sigorta",
  "072": "Demir Hayat",
  "084": "Acıbadem Sigorta",
  "093": "Neova Sigorta",
  "095": "NN Hayat Sigorta",
  "096": "Koru Sigorta",
  "100": "HDI Fiba Emeklilik",
  "104": "Doğa Sigorta",
  "105": "Katılım Emeklilik",
  "106": "Orient Sigorta",
  "108": "Atlas Sigorta",
  "109": "Ethica Sigorta",
  "110": "Quick Sigorta",
  "112": "Melce Sigorta",
  "115": "Ana Sigorta",
  "116": "Türkiye Sigorta",
  "117": "Türkiye Hayat Emeklilik",
  "118": "Gri Sigorta",
  "119": "Prive Sigorta",
  "120": "Arex Sigorta",
  "121": "Türkiye Katılım Sigorta",
  "123": "HDI Katılım Sigorta",
  "124": "Aveon Sigorta",
  "126": "Hepiyi Sigorta",
  "127": "Emaa Sigorta",
  "128": "Acntürk Sigorta",
  "130": "Fiba Sigorta",
  "134": "Quick Hayat Sigorta",
  "985": "BNP Paribas Cardif",
  "986": "Kaptan Assist",
  "987": "Alfa Asistans",
  "988": "Anadolu Hayat Emeklilik",
  "989": "Maximum Asistans",
  "990": "VR One",
  "992": "Rota Assist",
  "993": "GNC Assist",
  "994": "Anadolu Assist",
  "996": "Tez Assistance",
  "997": "Asistans 360",
  "998": "Merkez Asistans",
  "999": "E-Asistans",
  "1000": "Viennalife Emeklilik ve Hayat",
  BIC: "Bicare Insurance",
  GUV: "Güven Sigorta",
  PHK: "Pusulam Hukuk",
};

/**
 * Şirket kodunu normalize eder. IO bazı yanıtlarda sayısal kodu dolgusuz
 * ("4") döndürebiliyor, katalog ise üç haneli ("004"). Harf içeren kodlar
 * (GUV, BIC, PHK) olduğu gibi bırakılır.
 */
export function normalizeSirketKodu(kod: string | number | null | undefined): string {
  if (kod === null || kod === undefined) return "";
  const raw = String(kod).trim();
  if (!raw) return "";
  if (!/^\d+$/.test(raw)) return raw.toUpperCase();
  return raw.length >= 3 ? raw : raw.padStart(3, "0");
}

export function sirketAdi(kod: string | number | null | undefined): string {
  const normalized = normalizeSirketKodu(kod);
  return SIRKET_ADLARI[normalized] ?? (normalized || "Bilinmeyen şirket");
}
