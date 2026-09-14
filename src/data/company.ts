/**
 * Resmî şirket bilgileri — KVKK, iletişim ve schema için tek kaynak.
 *
 * Açık posta adresi bilinçli olarak yayınlanmıyor; başvuru ve tebligat KEP ile
 * şirket sisteminde kayıtlı e-posta üzerinden yürütülüyor.
 * Yönetim panelindeki kurumsal ayarlar bu kaydın çalışma zamanı karşılığıdır.
 */

import {
  DEFAULT_SITE_SETTINGS,
  type CompanySettings,
} from "../../shared/site-settings";

export interface CompanyIdentity {
  unvan: string;
  /** Marka / kısa ad (metin içi kullanım) */
  shortName: string;
  kep: string;
  eposta: string;
  telefon: string;
  telefonE164: string;
  tobb: string;
  mersis: string;
  ticaretSicil: string;
  vergiKimlikNo: string;
  vergiDairesi: string;
}

function filled(value: string, fallback: string) {
  return value.trim() || fallback;
}

export function companyFromSettings(settings: CompanySettings): CompanyIdentity {
  const fallback = DEFAULT_SITE_SETTINGS.company;
  return {
    unvan: filled(settings.legalName, fallback.legalName),
    shortName: filled(settings.brandName, fallback.brandName),
    kep: filled(settings.kep, fallback.kep),
    eposta: filled(settings.email, fallback.email),
    telefon: filled(settings.phoneDisplay, fallback.phoneDisplay),
    telefonE164: filled(settings.phone, fallback.phone),
    tobb: filled(settings.tobbNumber, fallback.tobbNumber),
    mersis: filled(settings.mersisNumber, fallback.mersisNumber),
    ticaretSicil: filled(settings.tradeRegistryNumber, fallback.tradeRegistryNumber),
    vergiKimlikNo: filled(settings.taxNumber, fallback.taxNumber),
    vergiDairesi: filled(settings.taxOffice, fallback.taxOffice),
  };
}

export const COMPANY: CompanyIdentity = companyFromSettings(
  DEFAULT_SITE_SETTINGS.company,
);

/** KVKK ve yasal metinlerde kullanılan veri sorumlusu bilgileri. */
export const KVKK_SORUMLU = COMPANY;

/** KVKK aydınlatma metni §1 — veri sorumlusu satırları. */
export function kvkkVeriSorumlusuLines(
  sorumlu: CompanyIdentity = COMPANY,
): string[] {
  return [
    `KEP: ${sorumlu.kep}`,
    `KVKK e-posta adresi: ${sorumlu.eposta}`,
    `Telefon: ${sorumlu.telefon}`,
    `TOBB Sigorta Acenteleri Levha No: ${sorumlu.tobb}`,
    `MERSİS No: ${sorumlu.mersis}`,
    `Ticaret Sicil / Dosya No: ${sorumlu.ticaretSicil}`,
    `Vergi Kimlik No: ${sorumlu.vergiKimlikNo}`,
    `Vergi Dairesi: ${sorumlu.vergiDairesi}`,
  ];
}
