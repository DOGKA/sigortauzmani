import { LOCALE_META, type Locale } from "./locales";

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_ARABIC = "۰۱۲۳۴۵۶۷۸۹";

/** Arap ve Fars rakamlarını Latin (ASCII) rakamlara çevirir. */
export function normalizeDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (ch) => {
    const western = ARABIC_INDIC.indexOf(ch);
    if (western >= 0) return String(western);
    const eastern = EASTERN_ARABIC.indexOf(ch);
    return eastern >= 0 ? String(eastern) : ch;
  });
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key]),
  );
}

/** API'den gelen "Peşin" / "3 Taksit" etiketlerini dile çevirir. */
export function localizeInstallment(
  value: string,
  labels: { cash: string; installments: string },
): string {
  return value
    .replace(/pe[sş]in/gi, labels.cash)
    .replace(/(\d+)\s*taksit/gi, (_, n: string) =>
      interpolate(labels.installments, { n }),
    );
}

export function localeTag(locale: Locale): string {
  return LOCALE_META[locale].bcp47;
}

export function formatDateTime(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDisplayDate(isoDate: string, locale: Locale): string {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatMoney(
  amount: number,
  currency: "TRY" | "EUR",
  locale: Locale,
): string {
  return new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
