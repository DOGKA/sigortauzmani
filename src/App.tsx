import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Suspense, lazy, useEffect, type ReactNode } from "react";
import CookieConsent from "./components/cookies/CookieConsent";
import Header from "./components/Header";
import Footer from "./components/Footer";
import UnavailablePage from "./components/UnavailablePage";
import { CookieConsentProvider } from "./lib/cookies/context";
import {
  SiteSettingsProvider,
  useSiteSettings,
} from "./lib/settings/context";
import { trackAnalyticsPageView } from "./lib/cookies/apply";
import {
  LocaleProvider,
  useInternalProductSlug,
  useLocale,
  useT,
} from "./lib/i18n/context";
import { LOCALES, type Locale } from "./lib/i18n/locales";
import {
  LEGAL_PAGE_KEYS,
  MAINTENANCE_ALLOWED_PAGES,
  localizedPath,
  parsePath,
  type PageKey,
} from "./lib/i18n/paths";
import HomePage from "./pages/HomePage";
import { isOtomatikUrun } from "./lib/io/constants";

const loadQuotePage = () => import("./pages/QuotePage");
const QuotePage = lazy(loadQuotePage);
const QuoteFlowPage = lazy(() => import("./pages/QuoteFlowPage"));
const RiskMapPage = lazy(() => import("./pages/RiskMapPage"));
const GlossaryPage = lazy(() => import("./pages/GlossaryPage"));
const ComparisonHubPage = lazy(() => import("./pages/ComparisonHubPage"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"));
const PolicyCancelPage = lazy(() => import("./pages/PolicyCancelPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = hash.slice(1);
    let tries = 0;
    let frame = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (tries++ < 30) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}

function AnalyticsRouteTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    trackAnalyticsPageView(pathname);
  }, [pathname]);
  return null;
}

function PageLoader() {
  const t = useT();
  return (
    <div className="page-loader" role="status" aria-label={t.nav.loading}>
      <span className="page-loader__spinner" />
    </div>
  );
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function QuoteRoute() {
  const slug = useInternalProductSlug();
  const [searchParams] = useSearchParams();
  const { isProductEnabled } = useSiteSettings();
  const t = useT();
  const manuel = searchParams.get("form") === "manuel";
  if (slug && !isProductEnabled(slug)) {
    return (
      <UnavailablePage
        title={t.quote.unavailableTitle}
        message={t.quote.unavailableMessage}
      />
    );
  }
  return slug && isOtomatikUrun(slug) && !manuel ? (
    <QuoteFlowPage />
  ) : (
    <QuotePage />
  );
}

function MaintenanceGate() {
  const { pathname } = useLocation();
  const { settings } = useSiteSettings();
  const { href } = useLocale();
  const t = useT();
  const page = parsePath(pathname).page;
  if (
    settings.maintenance.enabled &&
    !MAINTENANCE_ALLOWED_PAGES.has(page)
  ) {
    return (
      <UnavailablePage
        title={settings.maintenance.title}
        message={settings.maintenance.message}
        contactTo={href("contact")}
        contactLabel={t.unavailable.contact}
      />
    );
  }
  return <Outlet />;
}

function Shell({ locale }: { locale: Locale }) {
  return (
    <LocaleProvider locale={locale}>
      <CookieConsentProvider>
        <AnalyticsRouteTracker />
        <ScrollToTop />
        <Header />
        <MaintenanceGate />
        <Footer />
        <CookieConsent />
      </CookieConsentProvider>
    </LocaleProvider>
  );
}

function pagePath(locale: Locale, page: PageKey, slug?: string) {
  return localizedPath(locale, page, slug ? { slug } : undefined);
}

function localeRoutes(locale: Locale) {
  return (
    <Route key={locale} element={<Shell locale={locale} />}>
      <Route path={pagePath(locale, "home")} element={<HomePage />} />
      <Route
        path={pagePath(locale, "quote", ":slug")}
        element={
          <Lazy>
            <QuoteRoute />
          </Lazy>
        }
      />
      <Route
        path={pagePath(locale, "riskMap")}
        element={
          <Lazy>
            <RiskMapPage />
          </Lazy>
        }
      />
      <Route
        path={pagePath(locale, "glossary")}
        element={
          <Lazy>
            <GlossaryPage />
          </Lazy>
        }
      />
      <Route
        path={pagePath(locale, "comparisonHub")}
        element={
          <Lazy>
            <ComparisonHubPage />
          </Lazy>
        }
      />
      <Route
        path={pagePath(locale, "comparison", ":slug")}
        element={
          <Lazy>
            <ComparisonPage />
          </Lazy>
        }
      />
      <Route
        path={pagePath(locale, "policyCancel")}
        element={
          <Lazy>
            <PolicyCancelPage />
          </Lazy>
        }
      />
      <Route
        path={pagePath(locale, "about")}
        element={
          <Lazy>
            <AboutPage />
          </Lazy>
        }
      />
      <Route
        path={pagePath(locale, "contact")}
        element={
          <Lazy>
            <ContactPage />
          </Lazy>
        }
      />
      {locale === "tr" ? (
        <>
          <Route
            path={pagePath(locale, "blog")}
            element={
              <Lazy>
                <BlogPage />
              </Lazy>
            }
          />
          <Route
            path="/blog/trafik-sigortasi-yenilemesi-gecikirse-ne-olur"
            element={
              <Navigate
                to="/blog/trafik-sigortasi-gecikirse-ne-olur-cezasi-ve-riskleri-2026"
                replace
              />
            }
          />
          <Route
            path={pagePath(locale, "blogPost", ":slug")}
            element={
              <Lazy>
                <BlogPostPage />
              </Lazy>
            }
          />
        </>
      ) : null}
      {LEGAL_PAGE_KEYS.map((page) => (
        <Route
          key={page}
          path={pagePath(locale, page)}
          element={
            <Lazy>
              <LegalPage />
            </Lazy>
          }
        />
      ))}
      <Route
        path={locale === "tr" ? "*" : `${pagePath(locale, "home")}/*`}
        element={
          <Lazy>
            <NotFoundPage />
          </Lazy>
        }
      />
    </Route>
  );
}

export default function App() {
  useEffect(() => {
    const idle =
      window.requestIdleCallback?.bind(window) ??
      ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(() => loadQuotePage());
  }, []);

  return (
    <BrowserRouter>
      <SiteSettingsProvider>
        <Routes>
          {LOCALES.filter((locale) => locale !== "tr").map(localeRoutes)}
          {localeRoutes("tr")}
        </Routes>
      </SiteSettingsProvider>
    </BrowserRouter>
  );
}
