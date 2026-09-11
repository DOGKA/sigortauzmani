import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SITE_SETTINGS,
  mergePublicSettings,
  type PublicSiteSettings,
} from "../../../shared/site-settings";

interface SettingsContextValue {
  settings: PublicSiteSettings;
  isProductEnabled: (slug: string) => boolean;
}

const DEFAULT_PUBLIC = mergePublicSettings(DEFAULT_SITE_SETTINGS);
const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_PUBLIC,
  isProductEnabled: () => true,
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_PUBLIC);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/ayarlar", { signal: controller.signal })
      .then(async (response) => {
        if (response.ok) setSettings(mergePublicSettings(await response.json()));
      })
      .catch(() => {
        // Ağ veya şema hatasında site bundled varsayılanlarla fail-open çalışır.
      });
    return () => controller.abort();
  }, []);

  const value = useMemo<SettingsContextValue>(() => {
    const enabled = new Set(settings.products.enabledSlugs);
    return { settings, isProductEnabled: (slug) => enabled.has(slug) };
  }, [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SettingsContext);
}
