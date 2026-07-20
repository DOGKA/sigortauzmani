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
