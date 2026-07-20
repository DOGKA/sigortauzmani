import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { products } from "../data/products";
import vehicleGroupIcon from "../assets/menu/menu-arac-3d.png";
import healthGroupIcon from "../assets/menu/menu-saglik-konut-3d.png";
import "./Header.css";

const VEHICLE_SLUGS = ["trafik-sigortasi", "kasko", "imm", "yesil-kart"];
const HEALTH_HOME_SLUGS = [
  "tamamlayici-saglik",
  "ozel-saglik",
  "seyahat-saglik",
  "dask",
];

const productGroups = [
  {
    title: "Araç Sigortaları",
    icon: vehicleGroupIcon,
    items: VEHICLE_SLUGS.map(
      (slug) => products.find((p) => p.slug === slug)!,
    ),
  },
  {
    title: "Sağlık ve Konut Sigortaları",
    icon: healthGroupIcon,
    items: HEALTH_HOME_SLUGS.map(
      (slug) => products.find((p) => p.slug === slug)!,
    ),
  },
];

export default function Header() {
  const [productsOpen, setProductsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const comparisonActive = pathname.startsWith("/karsilastirma");
  const cancelActive = pathname.startsWith("/police-iptal");

  useEffect(() => {
    if (!productsOpen) return;
    const onOutsideClick = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setProductsOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProductsOpen(false);
    };
    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [productsOpen]);

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__brand">
          <img src="/sigortauzmani-logo.svg" alt="Sigorta Uzmanı" className="header__logo" />
          <span className="header__brand-name">
            sigorta<strong>uzmanı</strong>
          </span>
        </Link>

        <nav className="header__nav" ref={navRef}>
          <button type="button" className="header__nav-item">
            Hakkımızda
          </button>

          <div
            className="header__nav-dropdown-wrap"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              type="button"
              className={`header__nav-item ${productsOpen ? "header__nav-item--open" : ""}`}
              aria-expanded={productsOpen}
              aria-haspopup="true"
              onClick={() => setProductsOpen(true)}
            >
              Ürünlerimiz
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                className={`header__caret ${productsOpen ? "header__caret--open" : ""}`}
                aria-hidden="true"
              >
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {productsOpen && (
              <div className="header__mega" role="menu">
                {productGroups.map((group) => (
                  <div key={group.title} className="header__mega-group">
                    <div className="header__mega-head">
                      <span className="header__mega-icon">
                        <img src={group.icon} alt="" />
                      </span>
                      <span className="header__mega-title">{group.title}</span>
                    </div>
                    <ul className="header__mega-list">
                      {group.items.map((product) => (
                        <li key={product.slug}>
                          <Link
                            to={`/teklif/${product.slug}`}
                            className="header__mega-link"
                            role="menuitem"
                            onClick={() => setProductsOpen(false)}
                          >
                            {product.title}
                            {product.badge && (
                              <span className="header__mega-badge">
                                {product.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/police-iptal"
            className={`header__nav-item ${cancelActive ? "header__nav-item--open" : ""}`}
            aria-current={cancelActive ? "page" : undefined}
          >
            Poliçe İptal İşlemleri
          </Link>
          <Link
            to="/karsilastirma"
            className={`header__nav-item ${comparisonActive ? "header__nav-item--open" : ""}`}
            aria-current={comparisonActive ? "page" : undefined}
          >
            Karşılaştırma
          </Link>
          <button type="button" className="header__nav-item">
            İletişim
          </button>
        </nav>

        <div className="header__right">
          <div className="header__phone">
            <span className="header__phone-label">Yardıma mı ihtiyacınız var?</span>
            <a href="tel:+908503020032" className="header__phone-number">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                  fill="currentColor"
                />
              </svg>
              +90 850 302 00 32
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
