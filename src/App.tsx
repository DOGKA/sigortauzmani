import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";

const loadQuotePage = () => import("./pages/QuotePage");
const QuotePage = lazy(loadQuotePage);
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
    // Lazy sayfalardan gelindiğinde hedef henüz DOM'da olmayabilir
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

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Sayfa yükleniyor">
      <span className="page-loader__spinner" />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Prefetch the most-clicked lazy page so navigation feels instant
    // requestIdleCallback yoksa (eski Safari) kısa bir gecikmeyle yükle
    const idle =
      window.requestIdleCallback?.bind(window) ??
      ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(() => loadQuotePage());
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/teklif/:slug"
          element={
            <Suspense fallback={<PageLoader />}>
              <QuotePage />
            </Suspense>
          }
        />
        <Route
          path="/risk-haritasi"
          element={
            <Suspense fallback={<PageLoader />}>
              <RiskMapPage />
            </Suspense>
          }
        />
        <Route
          path="/sigorta-sozlugu"
          element={
            <Suspense fallback={<PageLoader />}>
              <GlossaryPage />
            </Suspense>
          }
        />
        <Route
          path="/karsilastirma"
          element={
            <Suspense fallback={<PageLoader />}>
              <ComparisonHubPage />
            </Suspense>
          }
        />
        <Route
          path="/karsilastirma/:slug"
          element={
            <Suspense fallback={<PageLoader />}>
              <ComparisonPage />
            </Suspense>
          }
        />
        <Route
          path="/police-iptal"
          element={
            <Suspense fallback={<PageLoader />}>
              <PolicyCancelPage />
            </Suspense>
          }
        />
        <Route
          path="/hakkimizda"
          element={
            <Suspense fallback={<PageLoader />}>
              <AboutPage />
            </Suspense>
          }
        />
        <Route
          path="/iletisim"
          element={
            <Suspense fallback={<PageLoader />}>
              <ContactPage />
            </Suspense>
          }
        />
        <Route
          path="/blog"
          element={
            <Suspense fallback={<PageLoader />}>
              <BlogPage />
            </Suspense>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <Suspense fallback={<PageLoader />}>
              <BlogPostPage />
            </Suspense>
          }
        />
        <Route
          path="/kvkk"
          element={
            <Suspense fallback={<PageLoader />}>
              <LegalPage />
            </Suspense>
          }
        />
        <Route
          path="/gizlilik-politikasi"
          element={
            <Suspense fallback={<PageLoader />}>
              <LegalPage />
            </Suspense>
          }
        />
        <Route
          path="/cerez-politikasi"
          element={
            <Suspense fallback={<PageLoader />}>
              <LegalPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<PageLoader />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
