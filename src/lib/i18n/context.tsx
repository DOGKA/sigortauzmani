import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useParams } from "react-router-dom";
import { LOCALE_META, type Locale } from "./locales";
import { MESSAGES, type UiMessages } from "./messages";
import {
  localizedPath,
  parsePath,
  resolveProductSlug,
  type PageKey,
} from "./paths";

const STORAGE_KEY = "su-locale";

interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  messages: UiMessages;
  href: (page: PageKey, params?: { slug?: string }) => string;
  quoteHref: (internalSlug: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const meta = LOCALE_META[locale];
  const messages = MESSAGES[locale];

  useEffect(() => {
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;
    document.documentElement.dataset.locale = locale;
  }, [locale, meta.dir, meta.htmlLang]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: meta.dir,
      messages,
      href: (page, params) => localizedPath(locale, page, params),
      quoteHref: (internalSlug) =>
        localizedPath(locale, "quote", { slug: internalSlug }),
    }),
    [locale, messages, meta.dir],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error("useLocale LocaleProvider dışında kullanıldı.");
  }
  return value;
}

export function useT(): UiMessages {
  return useLocale().messages;
}

export function useInternalProductSlug(): string | undefined {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useLocale();
  return resolveProductSlug(locale, slug);
}

export function rememberLocale(locale: Locale, allowed: boolean): void {
  if (!allowed) return;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readRememberedLocale(): Locale | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "tr" || value === "en" || value === "ar" || value === "fa") {
      return value;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function currentParsedPath(pathname: string) {
  return parsePath(pathname);
}
