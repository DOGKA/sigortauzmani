import { Link, useLocation } from "react-router-dom";
import { ROBOTS_NOINDEX } from "../lib/seo/config";
import { useLocale, useT } from "../lib/i18n/context";
import { useSeo } from "../lib/seo/useSeo";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const { href, locale } = useLocale();
  const t = useT();

  useSeo({
    title: t.notfound.title,
    description: t.notfound.text,
    path: pathname,
    robots: ROBOTS_NOINDEX,
  });

  const suggestions = [
    { label: t.nav.quote, to: `${href("home")}#urunler` },
    { label: t.nav.compare, to: href("comparisonHub") },
    { label: t.footer.glossary, to: href("glossary") },
    ...(locale === "tr" ? [{ label: t.nav.blog, to: href("blog") }] : []),
    { label: t.nav.cancel, to: href("policyCancel") },
    { label: t.contact.reachUs, to: href("contact") },
  ];

  return (
    <main className="notfound">
      <div className="notfound__inner">
        <p className="notfound__code">404</p>
        <h1 className="notfound__title">{t.notfound.title}</h1>
        <p className="notfound__text">{t.notfound.text}</p>

        <nav className="notfound__links" aria-label={t.nav.explore}>
          {suggestions.map((item) => (
            <Link key={item.to} to={item.to} className="notfound__link">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to={href("home")} className="notfound__home">
          {t.notfound.home}
        </Link>
      </div>
    </main>
  );
}
