export type TalepStatus =
  | "yeni"
  | "arandi"
  | "teklif_verildi"
  | "tamamlandi"
  | "iptal";

export interface Talep {
  id: string;
  talep_no: string;
  product_slug: string;
  product_title: string;
  insured_for: string | null;
  entity_type: "sahis" | "sirket" | null;
  tckn: string | null;
  vergi_no: string | null;
  phone: string | null;
  birth_date: string | null;
  plate: string | null;
  document_serial: string | null;
  motor_no: string | null;
  sasi_no: string | null;
  contact_pref: "hemen" | "tarihli";
  contact_date: string | null;
  contact_time: string | null;
  status: TalepStatus;
  created_at: string;
}

export const STATUS_LABELS: Record<TalepStatus, string> = {
  yeni: "Yeni",
  arandi: "Arandı",
  teklif_verildi: "Teklif Verildi",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
};

export const STATUS_ORDER: TalepStatus[] = [
  "yeni",
  "arandi",
  "teklif_verildi",
  "tamamlandi",
  "iptal",
];

export type IptalBrans =
  | "kasko"
  | "trafik"
  | "imm"
  | "kisa_sureli_trafik";

export type IptalStatus = "islemde" | "belge_eksik" | "tamamlandi";

export interface IptalTalep {
  id: string;
  iptal_no: string;
  brans: IptalBrans;
  ad_soyad: string;
  phone: string;
  tckn: string | null;
  vergi_no: string | null;
  plate: string;
  belge_path: string;
  status: IptalStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export const IPTAL_BRANS_LABELS: Record<IptalBrans, string> = {
  kasko: "Kasko Poliçesi",
  trafik: "Trafik Poliçesi",
  imm: "IMM Poliçesi",
  kisa_sureli_trafik: "Kısa Süreli Trafik Poliçesi",
};

export const IPTAL_STATUS_LABELS: Record<IptalStatus, string> = {
  islemde: "İşlemde",
  belge_eksik: "Belge Eksik",
  tamamlandi: "Tamamlandı",
};

export const IPTAL_STATUS_ORDER: IptalStatus[] = [
  "islemde",
  "belge_eksik",
  "tamamlandi",
];

// ============================================================
// Self servis teklif akışı (IO API)
// ============================================================

export type OturumStatus =
  | "baslatildi"
  | "sorgu_tamam"
  | "teklif_calisti"
  | "secildi"
  | "satin_alindi"
  | "hata";

export interface TeklifOturumu {
  id: string;
  oturum_no: string;
  session_id: string;
  ip_hash: string | null;
  product_slug: string;
  brans_no: number;
  entity_type: "sahis" | "yabanci" | "sirket";
  tckn: string | null;
  vergi_no: string | null;
  ad_soyad: string | null;
  phone: string | null;
  birth_date: string | null;
  plate: string | null;
  adres_kodu: string | null;
  form_data: Record<string, unknown>;
  io_teklif_id: number | null;
  status: OturumStatus;
  hata_mesaji: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeklifFiyati {
  id: string;
  oturum_id: string;
  brans_no: number;
  sirket_kodu: string;
  sirket_adi: string | null;
  io_teklif_satir_id: number | null;
  teklif_no: string | null;
  prim: number | null;
  taksit: string | null;
  taksit_kodu: string | null;
  created_at: string;
}

export interface SatinAlma {
  id: string;
  oturum_id: string;
  brans_no: number;
  sirket_kodu: string;
  sirket_adi: string | null;
  teklif_no: string | null;
  police_no: string | null;
  prim: number | null;
  taksit: string | null;
  taksit_kodu: string | null;
  kart_sahibi: string | null;
  kart_son4: string | null;
  uc_d_secure: boolean;
  police_pdf_url: string | null;
  makbuz_pdf_url: string | null;
  status: "basarili" | "basarisiz";
  hata_mesaji: string | null;
  created_at: string;
}

/** Satın alma listesinde sigortalı bilgisi oturumdan geliyor. */
export interface SatinAlmaKaydi extends SatinAlma {
  teklif_oturumlari: Pick<
    TeklifOturumu,
    | "oturum_no"
    | "product_slug"
    | "entity_type"
    | "tckn"
    | "vergi_no"
    | "ad_soyad"
    | "phone"
    | "plate"
  > | null;
}

export const OTURUM_STATUS_LABELS: Record<OturumStatus, string> = {
  baslatildi: "Başlatıldı",
  sorgu_tamam: "Sorgu Tamam",
  teklif_calisti: "Teklif Çalıştı",
  secildi: "Teklif Seçildi",
  satin_alindi: "Satın Alındı",
  hata: "Hata",
};

export const OTURUM_STATUS_ORDER: OturumStatus[] = [
  "baslatildi",
  "sorgu_tamam",
  "teklif_calisti",
  "secildi",
  "satin_alindi",
  "hata",
];

/** IO branş kodları. */
export const BRANS_LABELS: Record<number, string> = {
  0: "Trafik",
  1: "Kasko",
  2: "DASK",
  6: "Seyahat Sağlık",
  22: "İMM",
};

export type IletisimOncelik = "normal" | "oncelikli" | "acil";
export type IletisimStatus =
  | "yeni"
  | "inceleniyor"
  | "yanitlandi"
  | "kapatildi";

export interface IletisimTalep {
  id: string;
  iletisim_no: string;
  ad_soyad: string;
  email: string;
  konu: string;
  oncelik: IletisimOncelik;
  mesaj: string;
  belge_path: string | null;
  status: IletisimStatus;
  created_at: string;
  updated_at: string;
}

export const ILETISIM_ONCELIK_LABELS: Record<IletisimOncelik, string> = {
  normal: "Normal",
  oncelikli: "Öncelikli",
  acil: "Acil",
};

export const ILETISIM_STATUS_LABELS: Record<IletisimStatus, string> = {
  yeni: "Yeni",
  inceleniyor: "İnceleniyor",
  yanitlandi: "Yanıtlandı",
  kapatildi: "Kapatıldı",
};

export const ILETISIM_STATUS_ORDER: IletisimStatus[] = [
  "yeni",
  "inceleniyor",
  "yanitlandi",
  "kapatildi",
];
