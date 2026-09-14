import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useStaticPageSeo } from "../lib/seo/useStaticPageSeo";
import { useLocale, useT } from "../lib/i18n/context";
import { useSiteSettings } from "../lib/settings/context";
import kolayKarsilastirmaIcon from "../assets/icons/kolay-karsilastirma.svg";
import uzmanDestekIcon from "../assets/icons/uzman-destek.svg";
import hizliSurecIcon from "../assets/icons/hizli-surec.svg";
import policeSonrasiIcon from "../assets/icons/police-sonrasi.svg";
import "./AboutPage.css";

const REASONS = [
  {
    num: "01",
    title: "Kolay karşılaştırma",
    text: "Farklı şirketlerin seçeneklerini tek noktada değerlendirin.",
    icon: kolayKarsilastirmaIcon,
  },
  {
    num: "02",
    title: "Uzman destek",
    text: "İhtiyacınıza uygun sigortayı danışman desteğiyle seçin.",
    icon: uzmanDestekIcon,
  },
  {
    num: "03",
    title: "Hızlı süreç",
    text: "Bilgilerinizi girin, entegre şirketlerden gelen anlık teklifleri karşılaştırın.",
    icon: hizliSurecIcon,
  },
  {
    num: "04",
    title: "Poliçe sonrası",
    text: "Yenileme ve hasar süreçlerinde destek almaya devam edin.",
    icon: policeSonrasiIcon,
  },
];

export default function AboutPage() {
  const rootRef = useRef<HTMLElement>(null);
  const { href } = useLocale();
  const t = useT();
  const { settings } = useSiteSettings();

  useStaticPageSeo(href("about"));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="about" ref={rootRef}>
      <div className="about__bg" aria-hidden="true">
        <div className="about__blob about__blob--1" />
        <div className="about__blob about__blob--2" />
        <div className="about__blob about__blob--3" />
      </div>

      <div className="about__inner">
        <nav className="about__breadcrumb" aria-label="Sayfa konumu">
          <Link to={href("home")}>{t.about.home}</Link>
          <span aria-hidden="true">/</span>
          <span className="about__breadcrumb-current">{t.about.crumb}</span>
        </nav>

        {/* ── Hero ─────────────────────────────────── */}
        <section className="about__hero">
          <h1>
            {t.about.h1Before}
            <span className="about__hero-highlight">{t.about.h1Words[0]}</span>,{" "}
            <span className="about__hero-highlight">{t.about.h1Words[1]}</span>,{" "}
            <span className="about__hero-highlight">{t.about.h1Words[2]}</span>
            {t.about.h1After}
          </h1>
          <p className="about__lead">
            <strong>sigortauzmani.net</strong> — {t.about.lead} {settings.company.legalName}.
          </p>

          <ul className="about__branches" aria-label={t.about.crumb}>
            {t.about.branches.map((branch, i) => (
              <li
                key={branch}
                className="about__branch"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="about__branch-label">{branch}</span>
              </li>
            ))}
          </ul>

          <p className="about__lead about__lead--secondary">{t.about.lead2}</p>
        </section>

        {/* ── Slogan bandı ─────────────────────────── */}
        <section className="about__motto" data-reveal aria-label="Sloganımız">
          <div className="about__motto-item">{t.about.motto[0]}</div>
          <span className="about__motto-divider" aria-hidden="true" />
          <div className="about__motto-item">{t.about.motto[1]}</div>
          <span className="about__motto-divider" aria-hidden="true" />
          <div className="about__motto-item">{t.about.motto[2]}</div>
        </section>

        {/* ── Neden biz ────────────────────────────── */}
        <section className="about__why" aria-labelledby="why-title">
          <div className="about__why-head" data-reveal>
            <h2 id="why-title">{t.about.whyTitle}</h2>
          </div>

          <ul className="about__why-grid">
            {REASONS.map((reason, i) => (
              <li
                key={reason.num}
                className="about__why-card"
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="about__why-num" aria-hidden="true">
                  {reason.num}
                </span>
                <div className="about__why-card-head">
                  <span className="about__why-icon" aria-hidden="true">
                    <img src={reason.icon} alt="" />
                  </span>
                  <h3>{t.about.reasons[i]?.title ?? reason.title}</h3>
                </div>
                <p>{t.about.reasons[i]?.text ?? reason.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── CTA ──────────────────────────────────── */}
        <section className="about__cta" data-reveal aria-label="Teklif alın">
          <div className="about__cta-glow" aria-hidden="true" />
          <h2>{t.about.ctaTitle}</h2>
          <p>{t.about.ctaLead}</p>
          <div className="about__cta-actions">
            <Link to={`${href("home")}#urunler`} className="about__cta-btn">
              {t.about.cta}
            </Link>
            <a href={`tel:${settings.company.phone}`} className="about__cta-btn about__cta-btn--ghost">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                  fill="currentColor"
                />
              </svg>
              0850 302 00 32
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
