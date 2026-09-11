/** Poliçe iptal branş ve durum birimleri. Ortam API'si içermez; Edge derlemesi de buradan okur. */

export type IptalBrans =
  | "kasko"
  | "trafik"
  | "imm"
  | "kisa_sureli_trafik";

export type IptalStatus = "islemde" | "belge_eksik" | "tamamlandi";
