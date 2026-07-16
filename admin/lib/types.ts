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
