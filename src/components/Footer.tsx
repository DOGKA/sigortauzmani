import { Link } from "react-router-dom";
import "./Footer.css";

const columns: {
  title: string;
  links: { label: string; to?: string }[];
}[] = [
  {
    title: "Ürünler",
    links: [
      { label: "Trafik Sigortası", to: "/teklif/trafik-sigortasi" },
      { label: "Kasko", to: "/teklif/kasko" },
      { label: "Tamamlayıcı Sağlık", to: "/teklif/tamamlayici-saglik" },
      { label: "DASK", to: "/teklif/dask" },
    ],
  },
  {
    title: "Bilgi Merkezi",
    links: [
      { label: "Sıkça Sorulanlar", to: "/#sss" },
      { label: "Sigorta Sözlüğü", to: "/sigorta-sozlugu" },
      { label: "Karşılaştırma Merkezi", to: "/karsilastirma" },
      { label: "Risk Haritası", to: "/risk-haritasi" },
    ],
  },
  {
    title: "Destek",
    links: [
      { label: "Teklif Al", to: "/teklif/kasko" },
      { label: "Poliçe İptal", to: "/police-iptal" },
      { label: "0850 302 00 32" },
      { label: "İletişim" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__bg" aria-hidden="true">
        <div className="footer__blob footer__blob--1" />
        <div className="footer__blob footer__blob--2" />
        <div className="footer__floor" />
        <div className="footer__beam" />
        <div className="footer__vignette" />
      </div>

      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__brand-link">
              <img src="/sigortauzmani-logo.svg" alt="Sigorta Uzmanı" />
              <span>
                sigorta<strong>uzmanı</strong>
              </span>
            </Link>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <a href="tel:+908503020032" className="footer__phone">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                  fill="currentColor"
                />
              </svg>
              +90 850 302 00 32
            </a>
          </div>

          <div className="footer__columns">
            {columns.map((column) => (
              <div className="footer__column" key={column.title}>
                <h3>{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link to={link.to}>{link.label}</Link>
                      ) : link.label.includes("0850") ? (
                        <a href="tel:+908503020032">{link.label}</a>
                      ) : (
                        <button type="button">{link.label}</button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 Sigorta Uzmanı. Powered by Juststack Software and Tech.</span>
          <div className="footer__legal">
            <button type="button">KVKK Aydınlatma Metni</button>
            <button type="button">Gizlilik Politikası</button>
            <button type="button">Çerez Politikası</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
