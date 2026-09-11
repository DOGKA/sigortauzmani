import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applyOptionalConsents } from "./apply";
import { readConsent, writeConsent } from "./storage";
import type { CookieConsentRecord, CookiePreferences } from "./types";
import { useSiteSettings } from "../settings/context";

const EMPTY_PREFERENCES: CookiePreferences = {
  analytics: false,
  preferences: false,
  marketing: false,
};

interface CookieConsentContextValue {
  consent: CookieConsentRecord | null;
  bannerOpen: boolean;
  panelOpen: boolean;
  draft: CookiePreferences;
  setDraft: (next: CookiePreferences) => void;
  rejectOptional: () => void;
  acceptAll: () => void;
  openPanel: () => void;
  closePanel: () => void;
  saveDraft: () => void;
  openPreferences: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

function draftFromConsent(consent: CookieConsentRecord | null): CookiePreferences {
  if (!consent) return { ...EMPTY_PREFERENCES };
  return {
    analytics: consent.analytics,
    preferences: consent.preferences,
    marketing: consent.marketing,
  };
}

function persist(preferences: CookiePreferences): CookieConsentRecord {
  return writeConsent(preferences);
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const { settings } = useSiteSettings();
  const [consent, setConsent] = useState<CookieConsentRecord | null>(() =>
    readConsent(),
  );
  const [bannerOpen, setBannerOpen] = useState(() => readConsent() === null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState<CookiePreferences>(() =>
    draftFromConsent(readConsent()),
  );

  useEffect(() => {
    applyOptionalConsents(consent, settings.analytics);
  }, [consent, settings.analytics]);

  const rejectOptional = useCallback(() => {
    const record = persist(EMPTY_PREFERENCES);
    setConsent(record);
    setBannerOpen(false);
    setPanelOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    const record = persist({
      analytics: true,
      preferences: true,
      marketing: true,
    });
    setConsent(record);
    setBannerOpen(false);
    setPanelOpen(false);
  }, []);

  const openPanel = useCallback(() => {
    setDraft(draftFromConsent(readConsent()));
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const saveDraft = useCallback(() => {
    const record = persist(draft);
    setConsent(record);
    setBannerOpen(false);
    setPanelOpen(false);
  }, [draft]);

  const openPreferences = useCallback(() => {
    setDraft(draftFromConsent(readConsent()));
    setPanelOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      consent,
      bannerOpen,
      panelOpen,
      draft,
      setDraft,
      rejectOptional,
      acceptAll,
      openPanel,
      closePanel,
      saveDraft,
      openPreferences,
    }),
    [
      acceptAll,
      bannerOpen,
      closePanel,
      consent,
      draft,
      openPanel,
      openPreferences,
      rejectOptional,
      panelOpen,
      saveDraft,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent yalnızca CookieConsentProvider içinde kullanılabilir.");
  }
  return ctx;
}
