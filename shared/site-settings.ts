export const SETTING_KEYS = [
  "company",
  "analytics",
  "products",
  "maintenance",
  "notifications",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];
export type LegalLocale = "tr" | "en" | "ar" | "fa";
export type LegalStatus = "draft" | "published" | "unpublished";

export interface CompanySettings {
  legalName: string;
  brandName: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  address: string;
  taxOffice: string;
  taxNumber: string;
  mersisNumber: string;
  kep: string;
  tobbNumber: string;
  tradeRegistryNumber: string;
}

export interface AnalyticsSettings {
  provider: "none" | "ga4" | "gtm";
  ga4MeasurementId: string;
  gtmContainerId: string;
}

export interface ProductSettings {
  enabledSlugs: string[];
}

export interface MaintenanceSettings {
  enabled: boolean;
  title: string;
  message: string;
}

export interface NotificationSettings {
  enabled: boolean;
  recipients: string[];
  talepEnabled: boolean;
  iptalEnabled: boolean;
  iletisimEnabled: boolean;
}

export interface SiteSettings {
  company: CompanySettings;
  analytics: AnalyticsSettings;
  products: ProductSettings;
  maintenance: MaintenanceSettings;
  notifications: NotificationSettings;
}

export type PublicSiteSettings = Omit<SiteSettings, "notifications">;

export const ALL_PRODUCT_SLUGS = [
  "trafik-sigortasi",
  "kasko",
  "kisa-sureli-trafik",
  "tamamlayici-saglik",
  "seyahat-saglik",
  "imm",
  "ozel-saglik",
  "dask",
  "yesil-kart",
  "konut",
] as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  company: {
    legalName: "GROSS SİGORTA ARACILIK HİZMETLERİ LİMİTED ŞİRKETİ",
    brandName: "Sigorta Uzmanı",
    email: "sigorta@sigortauzmani.net",
    phone: "+908503020032",
    phoneDisplay: "0850 302 00 32",
    address: "",
    taxOffice: "Kartal",
    taxNumber: "4110856889",
    mersisNumber: "0411085688900001",
    kep: "grosssigorta@hs03.kep.tr",
    tobbNumber: "G08612-15EG",
    tradeRegistryNumber: "6422-5",
  },
  analytics: {
    provider: "none",
    ga4MeasurementId: "",
    gtmContainerId: "",
  },
  products: { enabledSlugs: [...ALL_PRODUCT_SLUGS] },
  maintenance: {
    enabled: false,
    title: "Kısa bir bakımdayız",
    message:
      "Hizmetimizi iyileştiriyoruz. Lütfen kısa bir süre sonra yeniden deneyin.",
  },
  notifications: {
    enabled: true,
    recipients: ["sigorta@sigortauzmani.net"],
    talepEnabled: true,
    iptalEnabled: true,
    iletisimEnabled: true,
  },
};

export function mergePublicSettings(value: unknown): PublicSiteSettings {
  const input =
    value && typeof value === "object"
      ? (value as Partial<PublicSiteSettings>)
      : {};
  return {
    company: { ...DEFAULT_SITE_SETTINGS.company, ...input.company },
    analytics: { ...DEFAULT_SITE_SETTINGS.analytics, ...input.analytics },
    products: { ...DEFAULT_SITE_SETTINGS.products, ...input.products },
    maintenance: {
      ...DEFAULT_SITE_SETTINGS.maintenance,
      ...input.maintenance,
    },
  };
}
