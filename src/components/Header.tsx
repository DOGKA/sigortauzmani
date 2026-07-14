import { Link } from "react-router-dom";
import "./Header.css";

const menuItems = [
  { label: "Lorem Ipsum", hasCaret: true },
  { label: "Dolor Sit", hasCaret: false },
  { label: "Amet Consectetur", hasCaret: false },
  { label: "Adipiscing Elit", hasCaret: true },
];

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__brand">
          <img src="/sigortauzmani-logo.svg" alt="Sigorta Uzmanı" className="header__logo" />
          <span className="header__brand-name">
            sigorta<strong>uzmanı</strong>
          </span>
        </Link>

        <nav className="header__nav">
          {menuItems.map((item) => (
            <button key={item.label} className="header__nav-item">
              {item.label}
              {item.hasCaret && (
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </nav>

        <div className="header__right">
          <div className="header__phone">
            <span className="header__phone-label">Yardıma mı ihtiyacınız var?</span>
            <a href="tel:4440000" className="header__phone-number">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                  fill="currentColor"
                />
              </svg>
              444 00 00
            </a>
          </div>
          <button className="header__cta">Giriş Yap / Üye Ol</button>
        </div>
      </div>
    </header>
  );
}
