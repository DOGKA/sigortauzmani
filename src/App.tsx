import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";

const QuotePage = lazy(() => import("./pages/QuotePage"));
const RiskMapPage = lazy(() => import("./pages/RiskMapPage"));
const GlossaryPage = lazy(() => import("./pages/GlossaryPage"));
const ComparisonHubPage = lazy(() => import("./pages/ComparisonHubPage"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"));
const PolicyCancelPage = lazy(() => import("./pages/PolicyCancelPage"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/teklif/:slug"
          element={
            <Suspense fallback={null}>
              <QuotePage />
            </Suspense>
          }
        />
        <Route
          path="/risk-haritasi"
          element={
            <Suspense fallback={null}>
              <RiskMapPage />
            </Suspense>
          }
        />
        <Route
          path="/sigorta-sozlugu"
          element={
            <Suspense fallback={null}>
              <GlossaryPage />
            </Suspense>
          }
        />
        <Route
          path="/karsilastirma"
          element={
            <Suspense fallback={null}>
              <ComparisonHubPage />
            </Suspense>
          }
        />
        <Route
          path="/karsilastirma/:slug"
          element={
            <Suspense fallback={null}>
              <ComparisonPage />
            </Suspense>
          }
        />
        <Route
          path="/police-iptal"
          element={
            <Suspense fallback={null}>
              <PolicyCancelPage />
            </Suspense>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
