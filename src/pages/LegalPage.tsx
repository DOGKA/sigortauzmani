import { Link, Navigate, useLocation } from "react-router-dom";
import { getLegalDocument, legalDocuments } from "../data/legal";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
} from "../lib/seo/config";
import { ROUTES } from "../lib/seo/routes";
import { useStaticPageSeo } from "../lib/seo/useStaticPageSeo";
import "./LegalPage.css";

export default function LegalPage() {
  const { pathname } = useLocation();
  const doc = getLegalDocument(pathname);

  useStaticPageSeo(pathname);

  if (!doc) {
    return <Navigate to={ROUTES.home} replace />;
  }

  const others = legalDocuments.filter((item) => item.path !== doc.path);

  return (
    <main className="legal">
      <section className="legal__hero">
        <div className="legal__glow" aria-hidden="true" />
        <div className="legal__container">
          <nav className="legal__breadcrumb" aria-label="Sayfa konumu">
            <Link to={ROUTES.home}>Ana Sayfa</Link>
            <span aria-hidden="true">/</span>
            <span>{doc.h1}</span>
          </nav>
          <span className="legal__eyebrow">{doc.eyebrow}</span>
          <h1>{doc.h1}</h1>
          <p className="legal__updated">Son güncelleme: {doc.updatedAt}</p>
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
              </section>
            ))}
          </article>

          <aside className="legal__aside">
            <div className="legal__card">
              <h2>İletişim</h2>
              <p>
                Başvuru ve sorularınız için bizimle iletişime geçebilirsiniz.
              </p>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              <a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE_DISPLAY}</a>
              <Link to={ROUTES.contact} className="legal__aside-cta">
                İletişim formu
              </Link>
            </div>

            <div className="legal__card">
              <h2>Diğer yasal metinler</h2>
              <ul className="legal__links">
                {others.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path}>{item.h1}</Link>
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
