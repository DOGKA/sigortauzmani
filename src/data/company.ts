/**
 * Resmî şirket bilgileri — KVKK, iletişim ve schema için tek kaynak.
 *
 * Açık posta adresi bilinçli olarak yayınlanmıyor; başvuru ve tebligat KEP ile
 * şirket sisteminde kayıtlı e-posta üzerinden yürütülüyor.
 */

import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
} from "../lib/seo/config";

export const COMPANY = {
  unvan: "GROSS SİGORTA ARACILIK HİZMETLERİ LİMİTED ŞİRKETİ",
  /** Marka / kısa ad (metin içi kullanım) */
  shortName: "Gross Sigorta",
  kep: "grosssigorta@hs03.kep.tr",
  eposta: CONTACT_EMAIL,
  telefon: CONTACT_PHONE_DISPLAY,
  telefonE164: CONTACT_PHONE,
  tobb: "G08612-15EG",
  mersis: "0411085688900001",
  ticaretSicil: "6422-5",
  vergiKimlikNo: "4110856889",
  vergiDairesi: "Kartal",
} as const;

/** KVKK ve yasal metinlerde kullanılan veri sorumlusu bilgileri. */
export const KVKK_SORUMLU = COMPANY;

/** KVKK aydınlatma metni §1 — veri sorumlusu satırları. */
export function kvkkVeriSorumlusuLines(): string[] {
  return [
    `KEP: ${COMPANY.kep}`,
    `KVKK e-posta adresi: ${COMPANY.eposta}`,
    `Telefon: ${COMPANY.telefon}`,
    `TOBB Sigorta Acenteleri Levha No: ${COMPANY.tobb}`,
    `MERSİS No: ${COMPANY.mersis}`,
    `Ticaret Sicil / Dosya No: ${COMPANY.ticaretSicil}`,
    `Vergi Kimlik No: ${COMPANY.vergiKimlikNo}`,
    `Vergi Dairesi: ${COMPANY.vergiDairesi}`,
  ];
}
