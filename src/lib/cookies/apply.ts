import type { CookieConsentRecord } from "./types";
import type { AnalyticsSettings } from "../../../shared/site-settings";

type GoogleCommand = unknown[];
type DataLayerEntry = GoogleCommand | Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
  }
}

const SCRIPT_ID = "su-google-analytics";
const GA4_ID_PATTERN = /^G-[A-Z0-9]{6,20}$/i;
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,12}$/i;

let consentDefaultsApplied = false;
let analyticsGranted = false;
let activeProviderKey = "";
let pendingPagePath: string | null = null;
let lastPagePath: string | null = null;

function dataLayer(): DataLayerEntry[] {
  return (window.dataLayer ??= []);
}

function gtag(...command: GoogleCommand): void {
  dataLayer().push(command);
}

function applyConsentModeDefaults(): void {
  if (consentDefaultsApplied) return;
  consentDefaultsApplied = true;
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
}

function updateConsentMode(granted: boolean): void {
  gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function configuredProvider(settings: AnalyticsSettings): {
  provider: "ga4" | "gtm";
  id: string;
} | null {
  const ga4Id = settings.ga4MeasurementId.trim();
  const gtmId = settings.gtmContainerId.trim();
  if (settings.provider === "ga4" && GA4_ID_PATTERN.test(ga4Id)) {
    return { provider: "ga4", id: ga4Id };
  }
  if (settings.provider === "gtm" && GTM_ID_PATTERN.test(gtmId)) {
    return { provider: "gtm", id: gtmId };
  }
  return null;
}

function injectGoogleScript(provider: "ga4" | "gtm", id: string): void {
  const key = `${provider}:${id}`;
  if (activeProviderKey === key && document.getElementById(SCRIPT_ID)) return;

  document.getElementById(SCRIPT_ID)?.remove();
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.dataset.provider = provider;
  script.dataset.analyticsId = id;

  if (provider === "ga4") {
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    gtag("js", new Date());
    gtag("config", id, { send_page_view: false });
  } else {
    dataLayer().push({ "gtm.start": Date.now(), event: "gtm.js" });
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  }

  document.head.appendChild(script);
  activeProviderKey = key;
  lastPagePath = null;
}

function dispatchPendingPageView(): void {
  if (!analyticsGranted || !activeProviderKey || !pendingPagePath) return;
  if (pendingPagePath === lastPagePath) return;

  const [provider, id] = activeProviderKey.split(":", 2);
  if (provider === "ga4") {
    gtag("event", "page_view", {
      page_path: pendingPagePath,
      page_location: `${window.location.origin}${pendingPagePath}`,
      page_title: document.title,
      send_to: id,
    });
  } else if (provider === "gtm") {
    dataLayer().push({
      event: "virtual_page_view",
      page_path: pendingPagePath,
      page_location: `${window.location.origin}${pendingPagePath}`,
      page_title: document.title,
    });
  }
  lastPagePath = pendingPagePath;
}

/**
 * Route ölçümünün tek canonical kaynağı. İleride locale prefix'leri eklendiğinde
 * uyumluluk dönüşümü burada merkezi olarak yapılabilir.
 */
export function canonicalPagePath(pathname: string): string {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, "/");
  return collapsed.length > 1 ? collapsed.replace(/\/+$/, "") : "/";
}

/** React Router değişikliklerini aktif sağlayıcıya tek bir SPA olayı olarak iletir. */
export function trackAnalyticsPageView(pathname: string): void {
  pendingPagePath = canonicalPagePath(pathname);
  dispatchPendingPageView();
}

/**
 * Zorunlu olmayan üçüncü taraf araçları yalnızca kayıtlı onay sonrası yüklenir.
 * Yeni entegrasyon eklerken bu fonksiyona bağlayın; index.html'e doğrudan script
 * eklemeyin.
 */
export function applyOptionalConsents(
  consent: CookieConsentRecord | null,
  analytics: AnalyticsSettings,
): void {
  applyConsentModeDefaults();

  const consentGranted = consent?.analytics === true;
  updateConsentMode(consentGranted);
  if (!consentGranted) {
    analyticsGranted = false;
    lastPagePath = null;
    return;
  }

  const provider = configuredProvider(analytics);
  if (!provider) {
    analyticsGranted = false;
    activeProviderKey = "";
    lastPagePath = null;
    document.getElementById(SCRIPT_ID)?.remove();
    return;
  }
  analyticsGranted = true;
  injectGoogleScript(provider.provider, provider.id);
  dispatchPendingPageView();

  if (consent?.preferences) {
    // Örn. tercih çerezleri / A/B test araçları.
  }

  if (consent?.marketing) {
    // Örn. Meta Pixel, yeniden hedefleme pikselleri.
  }
}
