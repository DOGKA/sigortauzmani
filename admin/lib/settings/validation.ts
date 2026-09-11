import {
  ALL_PRODUCT_SLUGS,
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "../../../shared/site-settings";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GA4 = /^G-[A-Z0-9]{6,20}$/i;
const GTM = /^GTM-[A-Z0-9]{4,12}$/i;

function text(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function validateSettings(input: unknown): SiteSettings {
  if (!input || typeof input !== "object") throw new Error("Geçersiz ayarlar.");
  const raw = input as Record<string, unknown>;
  const company = (raw.company ?? {}) as Record<string, unknown>;
  const analytics = (raw.analytics ?? {}) as Record<string, unknown>;
  const products = (raw.products ?? {}) as Record<string, unknown>;
  const maintenance = (raw.maintenance ?? {}) as Record<string, unknown>;
  const notifications = (raw.notifications ?? {}) as Record<string, unknown>;

  const provider =
    analytics.provider === "ga4" || analytics.provider === "gtm"
      ? analytics.provider
      : "none";
  const ga4MeasurementId = text(analytics.ga4MeasurementId, 32).toUpperCase();
  const gtmContainerId = text(analytics.gtmContainerId, 32).toUpperCase();
  if (provider === "ga4" && !GA4.test(ga4MeasurementId))
    throw new Error("Geçerli bir GA4 ölçüm kimliği girin (G-...).");
  if (provider === "gtm" && !GTM.test(gtmContainerId))
    throw new Error("Geçerli bir GTM kapsayıcı kimliği girin (GTM-...).");
  if (ga4MeasurementId && gtmContainerId)
    throw new Error("GA4 ve GTM aynı anda etkinleştirilemez.");

  const recipients = Array.isArray(notifications.recipients)
    ? [...new Set(notifications.recipients.map((item) => text(item, 160).toLowerCase()))]
    : [];
  if (!recipients.length || recipients.some((item) => !EMAIL.test(item)))
    throw new Error("En az bir geçerli bildirim alıcısı girin.");

  const enabledSlugs = Array.isArray(products.enabledSlugs)
    ? products.enabledSlugs.filter(
        (slug): slug is string =>
          typeof slug === "string" &&
          (ALL_PRODUCT_SLUGS as readonly string[]).includes(slug),
      )
    : [...ALL_PRODUCT_SLUGS];

  return {
    company: {
      legalName: text(company.legalName, 180) || DEFAULT_SITE_SETTINGS.company.legalName,
      brandName: text(company.brandName, 100) || DEFAULT_SITE_SETTINGS.company.brandName,
      email: text(company.email, 160).toLowerCase(),
      phone: text(company.phone, 32),
      phoneDisplay: text(company.phoneDisplay, 32),
      address: text(company.address, 500),
      taxOffice: text(company.taxOffice, 100),
      taxNumber: text(company.taxNumber, 32),
      mersisNumber: text(company.mersisNumber, 32),
      kep: text(company.kep, 160).toLowerCase(),
    },
    analytics: {
      provider,
      ga4MeasurementId: provider === "ga4" ? ga4MeasurementId : "",
      gtmContainerId: provider === "gtm" ? gtmContainerId : "",
    },
    products: { enabledSlugs: [...new Set(enabledSlugs)] },
    maintenance: {
      enabled: maintenance.enabled === true,
      title: text(maintenance.title, 120) || DEFAULT_SITE_SETTINGS.maintenance.title,
      message: text(maintenance.message, 1000) || DEFAULT_SITE_SETTINGS.maintenance.message,
    },
    notifications: {
      enabled: notifications.enabled !== false,
      recipients,
      talepEnabled: notifications.talepEnabled !== false,
      iptalEnabled: notifications.iptalEnabled !== false,
      iletisimEnabled: notifications.iletisimEnabled !== false,
    },
  };
}
