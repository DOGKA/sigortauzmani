export const LOCALES = ["tr", "en", "ar", "fa"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";

export interface LocaleMeta {
  code: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
  htmlLang: string;
  ogLocale: string;
  bcp47: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  tr: {
    code: "TR",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    dir: "ltr",
    htmlLang: "tr",
    ogLocale: "tr_TR",
    bcp47: "tr-TR",
  },
  en: {
    code: "EN",
    nativeName: "English",
    flag: "🇬🇧",
    dir: "ltr",
    htmlLang: "en",
    ogLocale: "en_GB",
    bcp47: "en-GB",
  },
  ar: {
    code: "AR",
    nativeName: "العربية",
    flag: "🇸🇦",
    dir: "rtl",
    htmlLang: "ar",
    ogLocale: "ar_SA",
    bcp47: "ar-SA-u-nu-latn-ca-gregory",
  },
  fa: {
    code: "FA",
    nativeName: "فارسی",
    flag: "🇮🇷",
    dir: "rtl",
    htmlLang: "fa",
    ogLocale: "fa_IR",
    bcp47: "fa-IR-u-nu-latn-ca-gregory",
  },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function isRtl(locale: Locale): boolean {
  return LOCALE_META[locale].dir === "rtl";
}
