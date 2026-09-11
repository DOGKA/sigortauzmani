import { Link, Navigate, useLocation } from "react-router-dom";
import { getLegalDocument } from "../data/legal";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
} from "../lib/seo/config";
import { useStaticPageSeo } from "../lib/seo/useStaticPageSeo";
import { useLocale, useT } from "../lib/i18n/context";
import {
  LEGAL_PAGE_KEYS,
  PAGE_TEMPLATES,
  isLegalPage,
  localizedPath,
  parsePath,
} from "../lib/i18n/paths";
import "./LegalPage.css";

export default function LegalPage() {
  const { pathname } = useLocation();
  const { locale, href } = useLocale();
  const t = useT();
  const parsed = parsePath(pathname);
  const trPath =
    isLegalPage(parsed.page) ? PAGE_TEMPLATES.tr[parsed.page] : pathname;
  const doc = getLegalDocument(trPath);

  useStaticPageSeo(pathname);

  if (!doc) {
    return <Navigate to={href("home")} replace />;
  }

  const others = LEGAL_PAGE_KEYS.filter((key) => key !== parsed.page).map(
    (key) => {
      const other = getLegalDocument(PAGE_TEMPLATES.tr[key]);
      return {
        path: localizedPath(locale, key),
        title: other?.title ?? key,
      };
    },
  );

  return (
    <main className="legal">
      <section className="legal__hero">
        <div className="legal__glow" aria-hidden="true" />
        <div className="legal__container">
          <nav className="legal__breadcrumb" aria-label="breadcrumb">
            <Link to={href("home")}>{t.legal.home}</Link>
            <span aria-hidden="true">/</span>
            <span>{doc.h1}</span>
          </nav>
          <span className="legal__eyebrow">{doc.eyebrow}</span>
          <h1>{doc.h1}</h1>
          <p className="legal__updated">
            {t.legal.updated}: {doc.updatedAt}
          </p>
          {locale !== "tr" ? (
            <p className="legal__lead">{t.legal.disclaimer}</p>
          ) : null}
          {doc.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="legal__lead">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="legal__body">
        <div className="legal__container legal__layout">
          <article className="legal__article">
            {doc.sections.map((section) => (
              <section key={section.heading} className="legal__section">
                <h2>{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph.slice(0, 64)}>{paragraph}</p>
                ))}
                {section.items && section.items.length > 0 && (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.closing?.map((paragraph) => (
                  <p key={`c-${paragraph.slice(0, 64)}`}>{paragraph}</p>
                ))}
              </section>
            ))}
          </article>

          <aside className="legal__aside">
            <div className="legal__card">
              <h2>{t.legal.contactTitle}</h2>
              <p>{t.legal.contactLead}</p>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              <a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE_DISPLAY}</a>
              <Link to={href("contact")} className="legal__aside-cta">
                {t.legal.contactForm}
              </Link>
            </div>

            <div className="legal__card">
              <h2>{t.legal.other}</h2>
              <ul className="legal__links">
                {others.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path}>{item.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
