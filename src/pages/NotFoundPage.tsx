import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ROBOTS_NOINDEX } from "../lib/seo/config";
import { ROUTES } from "../lib/seo/routes";
import { useSeo } from "../lib/seo/useSeo";
import "./NotFoundPage.css";

const SUGGESTIONS = [
  { label: "Teklif al", to: "/#urunler" },
  { label: "Sigorta karşılaştırma", to: ROUTES.comparisonHub },
  { label: "Sigorta sözlüğü", to: ROUTES.glossary },
  { label: "Blog", to: ROUTES.blog },
  { label: "Poliçe iptal", to: ROUTES.policyCancel },
  { label: "İletişim", to: ROUTES.contact },
];

/**
 * Eşleşmeyen adresler için. Vercel SPA rewrite'ı her yola 200 döndürdüğü
 * için bu sayfa `noindex` işaretler ve arama motorlarının boş adresleri
 * dizine almasını engeller.
 */
export default function NotFoundPage() {
  const { pathname } = useLocation();

  useSeo({
    title: "Sayfa bulunamadı",
    description: "Aradığınız sayfa taşınmış veya kaldırılmış olabilir.",
    path: pathname,
    robots: ROBOTS_NOINDEX,
  });

  return (
    <main className="notfound">
      <div className="notfound__inner">
        <p className="notfound__code">404</p>
        <h1 className="notfound__title">Bu sayfayı bulamadık</h1>
        <p className="notfound__text">
          Aradığınız adres taşınmış, adı değişmiş veya hiç var olmamış olabilir.
          Aşağıdaki bölümlerden devam edebilirsiniz.
        </p>

        <nav className="notfound__links" aria-label="Öne çıkan bölümler">
          {SUGGESTIONS.map((item) => (
            <Link key={item.to} to={item.to} className="notfound__link">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to={ROUTES.home} className="notfound__home">
          Ana sayfaya dön
        </Link>
      </div>
    </main>
  );
}
