import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";

const QuotePage = lazy(() => import("./pages/QuotePage"));

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
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
