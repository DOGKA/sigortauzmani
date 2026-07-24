import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { products } from "../data/products";
import "./MobileMenu.css";

const PHONE_HREF = "tel:+908503020032";
const WHATSAPP_HREF = "https://wa.me/908503020032";

const exploreLinks: {
  to: string;
  label: string;
  desc: string;
  icon: ReactNode;
}[] = [
  {
    to: "/hakkimizda",
    label: "Hakkımızda",
    desc: "Ekibimiz ve çalışma modelimiz",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    to: "/karsilastirma",
    label: "Karşılaştırma Merkezi",
    desc: "Teminatları yan yana görün",
    icon: (
      <>
        <path d="M6 20V10" />
        <path d="M12 20V4" />
        <path d="M18 20v-6" />
      </>
    ),
  },
  {
    to: "/risk-haritasi",
    label: "Risk Haritası",
    desc: "Bulunduğunuz bölgenin riski",
    icon: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    to: "/sigorta-sozlugu",
    label: "Sigorta Sözlüğü",
    desc: "Poliçe terimleri sade dille",
    icon: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
  },
  {
    to: "/iletisim",
    label: "İletişim",
    desc: "Bize ulaşın, dönüş yapalım",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  },
];

interface MobileMenuProps {
  id: string;
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ id, open, onClose }: MobileMenuProps) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    // Sadece gerçek bir kaydırma çubuğu payını telafi et; cihaz emülasyonu gibi
    // durumlarda bu fark saçma büyüklükte çıkabiliyor.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbar > 0 && scrollbar <= 32) {
      body.style.paddingRight = `${scrollbar}px`;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    closeRef.current?.focus();

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  // Header'ın backdrop-filter'ı fixed konumlu alt öğeler için containing block
  // oluşturduğundan drawer doğrudan body'ye taşınır.
  return createPortal(
    <div
      id={id}
      className={`mobile-menu ${open ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Site menüsü"
      inert={!open}
    >
      <button
        type="button"
        className="mobile-menu__scrim"
        aria-label="Menüyü kapat"
        tabIndex={-1}
        onClick={onClose}
      />

      <div className="mobile-menu__panel">
        <span className="mobile-menu__orb" aria-hidden="true" />

        <div className="mobile-menu__head">
          <Link to="/" className="mobile-menu__brand" onClick={onClose}>
            <img src="/sigortauzmani-logo.svg" alt="" />
            <span>
              sigorta<strong>uzmanı</strong>
            </span>
          </Link>
          <button
            ref={closeRef}
            type="button"
            className="mobile-menu__close"
            onClick={onClose}
            aria-label="Menüyü kapat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="mobile-menu__body">
          <div className="mobile-menu__row" style={{ "--i": 0 } as React.CSSProperties}>
            <button
              type="button"
              className={`mobile-menu__cta mobile-menu__cta--primary ${quoteOpen ? "is-open" : ""}`}
              aria-expanded={quoteOpen}
              onClick={() => setQuoteOpen((v) => !v)}
            >
              <strong>Teklif Al</strong>
            </button>
            <Link
              to="/police-iptal"
              className="mobile-menu__cta"
              onClick={onClose}
            >
              <strong>Poliçe İptal</strong>
            </Link>
          </div>

          <div
            className={`mobile-menu__quote ${quoteOpen ? "is-open" : ""}`}
            style={{ "--i": 1 } as React.CSSProperties}
          >
            <div className="mobile-menu__quote-inner">
              <ul className="mobile-menu__quote-list">
                {products.map((product) => (
                  <li key={product.slug}>
                    <Link to={`/teklif/${product.slug}`} onClick={onClose}>
                      {product.title}
                      {product.slug === "tamamlayici-saglik" && <em>Popüler</em>}
                      {product.badge && <em>{product.badge}</em>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mobile-menu__label" style={{ "--i": 2 } as React.CSSProperties}>
            Keşfet
          </p>

          <ul className="mobile-menu__links">
            {exploreLinks.map((link, index) => (
              <li
                key={link.to}
                style={{ "--i": index + 3 } as React.CSSProperties}
              >
                <Link to={link.to} onClick={onClose}>
                  <span className="mobile-menu__link-icon" aria-hidden="true">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {link.icon}
                    </svg>
                  </span>
                  <span className="mobile-menu__link-text">
                    {link.label}
                    <small>{link.desc}</small>
                  </span>
                  <svg
                    width="7"
                    height="12"
                    viewBox="0 0 7 12"
                    fill="none"
                    className="mobile-menu__chevron"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 1l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mobile-menu__foot">
          <a href={PHONE_HREF} className="mobile-menu__call">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                fill="currentColor"
              />
            </svg>
            0850 302 00 32
          </a>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-menu__whatsapp"
            aria-label="WhatsApp üzerinden yazın"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.05-.2-.31a8.16 8.16 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24Zm-2.7 4.2c-.14 0-.37.05-.56.26-.19.21-.73.72-.73 1.75s.75 2.03.85 2.17c.11.14 1.46 2.23 3.55 3.13.5.21.88.34 1.18.44.5.16.95.14 1.31.08.4-.06 1.23-.5 1.4-.99.18-.49.18-.9.13-.99-.05-.09-.19-.14-.4-.25-.21-.1-1.23-.61-1.42-.68-.19-.07-.33-.1-.47.1-.14.21-.54.68-.66.82-.12.14-.24.16-.45.05-.21-.1-.88-.32-1.68-1.03-.62-.55-1.04-1.23-1.16-1.44-.12-.21-.01-.32.09-.43.09-.09.21-.24.31-.36.1-.12.14-.21.21-.35.07-.14.03-.26-.02-.36-.05-.1-.46-1.13-.64-1.55-.17-.4-.34-.35-.47-.35h-.4Z" />
            </svg>
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
