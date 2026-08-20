/**
 * IO API seçenek tabloları.
 *
 * Bunlar API'nin beklediği `Value` değerleri; dokümantasyondaki statik
 * listelerden alındı. Marka/model ve meslek listeleri statik değil, onlar
 * `/api/io/bb` ve `/api/io/meslek` üzerinden geliyor.
 *
 * Kaynak: IO API Dokümantasyonu, "Seçenek Değerleri".
 */

export interface Secenek {
  value: string;
  label: string;
}

/** Faz 1'de self servise açılan ürünler ve IO branş kodları. */
export const OTOMATIK_URUNLER: Record<string, number> = {
  "trafik-sigortasi": 0,
  kasko: 1,
  imm: 22,
  "seyahat-saglik": 6,
  dask: 2,
};

export function isOtomatikUrun(slug: string): boolean {
  return slug in OTOMATIK_URUNLER;
}

// ============================================================
// Araç
// ============================================================

/** `Arac.KullanimTarzi` — Tramer kullanım tarzı kodu. */
export const KULLANIM_TARZLARI: Secenek[] = [
  { value: "01", label: "Otomobil" },
  { value: "02", label: "Taksi" },
  { value: "03", label: "Minibüs" },
  { value: "04", label: "Otobüs (sürücü dahil 18-30 koltuk)" },
  { value: "05", label: "Otobüs (sürücü dahil 31 ve üstü koltuk)" },
  { value: "06", label: "Kamyonet" },
  { value: "07", label: "Kamyon" },
  { value: "08", label: "İş makinası" },
  { value: "09", label: "Traktör" },
  { value: "10", label: "Römork" },
  { value: "11", label: "Motosiklet ve yük motosikleti" },
  { value: "12", label: "Tanker" },
  { value: "13", label: "Çekici" },
  { value: "14", label: "Özel amaçlı taşıt" },
  { value: "15", label: "Tarım makinası" },
  { value: "16", label: "Dolmuş" },
  { value: "17", label: "Minibüs-dolmuş/hatlı (9-15 yolcu)" },
  { value: "18", label: "Otobüs-dolmuş/hatlı (16-30)" },
  { value: "19", label: "Otobüs-dolmuş/hatlı (31+)" },
  { value: "20", label: "Diğer araçlar" },
];

export interface KullanimSekli extends Secenek {
  /** Koltuk sayısı önerisi; kullanıcı değiştirebilir. */
  kisiSayisi: number;
}

/**
 * `Arac.KullanimSekli` — kullanım tarzına bağlı şekil kodu (DogaKSekli).
 * Dokümantasyon trafikte bazı istemcilerin KT kodunu tekrar gönderdiğini
 * söylüyor ama entegrasyon için DogaKSekli öneriliyor; biz onu kullanıyoruz.
 */
export const KULLANIM_SEKILLERI: Record<string, KullanimSekli[]> = {
  "01": [
    { value: "1", label: "Hususi oto", kisiSayisi: 5 },
    { value: "2", label: "Rent a car", kisiSayisi: 5 },
    { value: "6", label: "Jip", kisiSayisi: 5 },
  ],
  "02": [{ value: "3", label: "Taksi", kisiSayisi: 5 }],
  "03": [
    { value: "13", label: "Minibüs (servis)", kisiSayisi: 9 },
    { value: "12", label: "Minibüs (sürücü dahil 10-17 koltuk)", kisiSayisi: 18 },
  ],
  "04": [
    { value: "17", label: "K. otobüs", kisiSayisi: 18 },
    { value: "18", label: "K. otobüs (servis)", kisiSayisi: 18 },
    { value: "19", label: "K. otobüs (şehir içi)", kisiSayisi: 18 },
    { value: "21", label: "K. otobüs (turizm)", kisiSayisi: 18 },
  ],
  "05": [
    { value: "22", label: "B. otobüs", kisiSayisi: 31 },
    { value: "23", label: "B. otobüs (servis)", kisiSayisi: 31 },
    { value: "24", label: "B. otobüs (şehir içi)", kisiSayisi: 31 },
    { value: "25", label: "B. otobüs (turizm)", kisiSayisi: 31 },
  ],
  "06": [
    { value: "26", label: "Kamyonet (açık kasa)", kisiSayisi: 2 },
    { value: "27", label: "Kamyonet (kapalı kasa)", kisiSayisi: 2 },
    { value: "28", label: "Kamyonet (panel/glass van)", kisiSayisi: 5 },
    { value: "29", label: "Kamyonet (tüpgaz taşıyıcı)", kisiSayisi: 2 },
    { value: "30", label: "Kamyonet (ambulans)", kisiSayisi: 2 },
  ],
  "07": [
    { value: "33", label: "Kamyon (açık kasa)", kisiSayisi: 2 },
    { value: "34", label: "Kamyon (kapalı kasa)", kisiSayisi: 2 },
    { value: "35", label: "Kamyon (tüp taşıyıcı)", kisiSayisi: 2 },
    { value: "36", label: "Kamyon (çöp)", kisiSayisi: 2 },
    { value: "37", label: "Kamyon (itfaiye)", kisiSayisi: 5 },
    { value: "38", label: "Kamyon (damperli)", kisiSayisi: 2 },
    { value: "39", label: "Kamyon (frigofirik)", kisiSayisi: 2 },
    { value: "40", label: "Kamyon (transmikserli)", kisiSayisi: 2 },
    { value: "41", label: "Kamyon (silolu)", kisiSayisi: 2 },
    { value: "42", label: "Kamyon (beton pompalı)", kisiSayisi: 2 },
    { value: "43", label: "Kamyon (kaya)", kisiSayisi: 2 },
    { value: "44", label: "Kamyon (vinçli)", kisiSayisi: 2 },
    { value: "45", label: "Kamyon (kurtarıcı)", kisiSayisi: 2 },
  ],
  "08": [
    { value: "57", label: "İş makinası", kisiSayisi: 1 },
    { value: "58", label: "Ekskavatör", kisiSayisi: 1 },
    { value: "59", label: "Loader", kisiSayisi: 1 },
    { value: "60", label: "Dozer", kisiSayisi: 1 },
    { value: "61", label: "Skreyper", kisiSayisi: 1 },
    { value: "62", label: "Greyder", kisiSayisi: 1 },
    { value: "63", label: "Yol silindiri", kisiSayisi: 1 },
    { value: "64", label: "Hareketli vinç", kisiSayisi: 1 },
    { value: "65", label: "Kapalı yer forklifti", kisiSayisi: 1 },
    { value: "66", label: "Açık yer forklifti", kisiSayisi: 1 },
    { value: "67", label: "Hareketli kompresör", kisiSayisi: 1 },
    { value: "68", label: "Hareketli tulumba", kisiSayisi: 0 },
    { value: "69", label: "Hareketli kaynak makinesi", kisiSayisi: 0 },
    { value: "70", label: "Mobil vinç", kisiSayisi: 1 },
  ],
  "09": [
    { value: "54", label: "Traktör", kisiSayisi: 1 },
    { value: "55", label: "Biçerdöver", kisiSayisi: 1 },
  ],
  "10": [
    { value: "52", label: "Römork", kisiSayisi: 0 },
    { value: "53", label: "Damperli römork", kisiSayisi: 0 },
  ],
  "11": [{ value: "56", label: "Motosiklet", kisiSayisi: 1 }],
  "12": [
    { value: "46", label: "Tanker", kisiSayisi: 2 },
    { value: "47", label: "Tanker (asit taşıyıcı)", kisiSayisi: 2 },
    { value: "48", label: "Tanker (su ve benzeri madde taşıyıcı)", kisiSayisi: 2 },
    { value: "49", label: "Tanker (patlayıcı/parlayıcı)", kisiSayisi: 2 },
  ],
  "13": [
    { value: "50", label: "Çekici", kisiSayisi: 2 },
    { value: "51", label: "Çekici (tanker)", kisiSayisi: 2 },
  ],
  "14": [{ value: "71", label: "Özel amaçlı taşıt", kisiSayisi: 0 }],
  "17": [{ value: "11", label: "Minibüs (hatlı)", kisiSayisi: 9 }],
  "18": [{ value: "20", label: "K. otobüs (hatlı)", kisiSayisi: 18 }],
  "19": [{ value: "72", label: "B. otobüs (hatlı)", kisiSayisi: 31 }],
};

/** `Arac.YakitTipi` — kaskoda zorunlu. */
export const YAKIT_TIPLERI: Secenek[] = [
  { value: "1", label: "Benzinli" },
  { value: "2", label: "Benzinli-LPG" },
  { value: "6", label: "Benzinli-Hybrid" },
  { value: "3", label: "Dizel" },
  { value: "4", label: "Elektrik" },
  { value: "5", label: "Diğer" },
];

// ============================================================
// İMM
// ============================================================

/** `Imm.ImmBedel` */
export const IMM_BEDELLERI: Secenek[] = [
  { value: "1", label: "250.000 TL" },
  { value: "2", label: "500.000 TL" },
  { value: "3", label: "1.000.000 TL" },
  { value: "4", label: "2.000.000 TL" },
  { value: "5", label: "3.000.000 TL" },
  { value: "6", label: "5.000.000 TL" },
  { value: "7", label: "10.000.000 TL" },
  { value: "8", label: "15.000.000 TL" },
  { value: "9", label: "20.000.000 TL" },
  { value: "10", label: "25.000.000 TL" },
];

/** `Imm.ManeviTazminat` */
export const MANEVI_TAZMINATLAR: Secenek[] = [
  { value: "0", label: "Yok" },
  { value: "1", label: "250.000 TL" },
  { value: "2", label: "500.000 TL" },
  { value: "3", label: "1.000.000 TL" },
];

// ============================================================
// Seyahat Sağlık
// ============================================================

/** `Seyahat.PlanSecimi` */
export const SEYAHAT_PLANLARI: Secenek[] = [
  { value: "1", label: "Dar paket" },
  { value: "2", label: "Geniş paket" },
];

/**
 * `Seyahat.Kapsam`. Dokümantasyon `I` (Tüm Türkiye / Incoming) için
 * "seyahat akışında genelde kapalıdır" diyor, CRM dökümanı ise seçenek
 * olarak sayıyor. Şimdilik listede yok; gerekirse eklenecek.
 */
export const SEYAHAT_KAPSAMLARI: Secenek[] = [
  { value: "A", label: "Avrupa / Schengen" },
  { value: "T", label: "Tüm dünya" },
  { value: "Y", label: "Yurt içi" },
];

/**
 * `Seyahat.SeyahatSebebi`. API'de sabit liste dokümante edilmemiş; CRM
 * dökümanındaki üç seçenek kullanılıyor.
 */
export const SEYAHAT_SEBEPLERI: Secenek[] = [
  { value: "1", label: "Turistik gezi" },
  { value: "2", label: "Eğitim" },
  { value: "3", label: "İş seyahati" },
];

// ============================================================
// DASK / Konut
// ============================================================

/** `Dask.SigortaEttirenSifati` */
export const SIGORTA_ETTIREN_SIFATLARI: Secenek[] = [
  { value: "1", label: "Mal sahibi" },
  { value: "2", label: "Kiracı" },
  { value: "3", label: "İntifa hakkı sahibi" },
  { value: "4", label: "Yönetici" },
  { value: "5", label: "Akraba" },
  { value: "6", label: "Daini mürtehin" },
  { value: "7", label: "Diğer" },
];

/** `Dask.YapiTarzi` */
export const YAPI_TARZLARI: Secenek[] = [
  { value: "1", label: "Çelik, betonarme karkas" },
  { value: "2", label: "Yığma kagir yapılar" },
  { value: "3", label: "Diğer yapılar" },
];

/** `Dask.ToplamKatSayisi` */
export const TOPLAM_KAT_SAYILARI: Secenek[] = [
  { value: "1", label: "01-03 arası" },
  { value: "2", label: "04-07 arası" },
  { value: "3", label: "08-18 arası" },
  { value: "4", label: "19 ve üzeri" },
];

/** `Dask.KullanimSekli` — konuttaki listeden farklı. */
export const DASK_KULLANIM_SEKILLERI: Secenek[] = [
  { value: "1", label: "Mesken" },
  { value: "2", label: "Ticarethane" },
  { value: "3", label: "Diğer" },
];

/** `Dask.BinaHasarDurumu` */
export const BINA_HASAR_DURUMLARI: Secenek[] = [
  { value: "1", label: "Hasarsız" },
  { value: "2", label: "Az hasarlı" },
  { value: "3", label: "Orta hasarlı" },
  { value: "4", label: "Pert / total" },
];

/** `Dask.BinadakiKonumu` — bulunduğu kat. */
export const DASK_BINADAKI_KONUMLAR: Secenek[] = [
  { value: "-4", label: "-4. kat ve altı katlar" },
  { value: "-3", label: "-3. kat" },
  { value: "-2", label: "-2. kat" },
  { value: "-1", label: "-1. kat" },
  { value: "1", label: "1. kat" },
  { value: "2", label: "2. kat" },
  { value: "3", label: "3. kat" },
  { value: "4", label: "4. kat" },
  { value: "5", label: "5. kat" },
  { value: "6", label: "6. kat" },
  { value: "7", label: "7. kat" },
  { value: "8", label: "8. kat" },
  { value: "9", label: "9. kat" },
  { value: "10", label: "10. kat" },
  { value: "11", label: "11 ve üzeri katlar" },
];

// ============================================================
// Yardımcılar
// ============================================================

/** İnşa yılı: dokümantasyona göre son 51 yıl. */
export function insaaYillari(): string[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 51 }, (_, index) => String(current - index));
}

/**
 * Model yılı. YK (plakası çıkmamış) akışında yalnızca son iki yıl
 * seçilebilir; plakalı akışta geriye doğru geniş liste.
 */
export function modelYillari(yeniKayit = false): string[] {
  const current = new Date().getFullYear();
  const count = yeniKayit ? 2 : 40;
  return Array.from({ length: count }, (_, index) => String(current - index));
}

export function kullanimSekilleri(kullanimTarzi: string): KullanimSekli[] {
  return KULLANIM_SEKILLERI[kullanimTarzi] ?? [];
}

/**
 * Plaka il kodu iki haneli olmalı ("01"), ama `/api/iller` dolgusuz
 * ("1") döndürüyor. YK plakası bu değerden üretildiği için normalize
 * edilmesi gerekiyor.
 */
export function normalizeIlKodu(kod: string | number): string {
  const raw = String(kod).replace(/\D/g, "");
  if (!raw) return "";
  // Kıbrıs kodları (501-503) üç hanelidir, dolgulanmaz.
  return raw.length >= 3 ? raw : raw.padStart(2, "0");
}

export function ykPlaka(ilKodu: string | number): string {
  return `${normalizeIlKodu(ilKodu)}YK`;
}
