import { Link } from "react-router-dom";
import AmbientBackdrop from "./AmbientBackdrop";
import { useCookieConsent } from "../lib/cookies/context";
import { COMPANY } from "../data/company";
import { useLocale, useT } from "../lib/i18n/context";
import { localizedProducts } from "../lib/i18n/products";
import { useSiteSettings } from "../lib/settings/context";
import "./Footer.css";

export default function Footer() {
  const { openPreferences } = useCookieConsent();
  const { locale, href, quoteHref } = useLocale();
  const t = useT();
  const { isProductEnabled } = useSiteSettings();
  const productLinks = localizedProducts(locale)
    .filter((product) => isProductEnabled(product.slug))
    .map((product) => ({
      label: product.title,
      to: quoteHref(product.slug),
    }));

  const columns: {
    title: string;
    links: { label: string; to?: string; action?: "cookies" }[];
  }[] = [
    { title: t.footer.products, links: productLinks },
    {
      title: t.footer.knowledge,
      links: [
        ...(locale === "tr" ? [{ label: t.nav.blog, to: href("blog") }] : []),
        { label: t.footer.faq, to: `${href("home")}#sss` },
        { label: t.footer.glossary, to: href("glossary") },
        { label: t.footer.comparison, to: href("comparisonHub") },
        { label: t.footer.riskMap, to: href("riskMap") },
      ],
    },
    {
      title: t.footer.quick,
      links: [
        { label: t.nav.about, to: href("about") },
        { label: t.footer.getQuote, to: `${href("home")}#urunler` },
        { label: t.nav.cancel, to: href("policyCancel") },
        { label: t.contact.reachUs, to: href("contact") },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { label: t.legal.home === "Home" ? "KVKK notice" : locale === "ar" ? "إشعار KVKK" : locale === "fa" ? "اطلاعیه KVKK" : "KVKK Aydınlatma Metni", to: href("kvkk") },
        { label: locale === "en" ? "Privacy policy" : locale === "ar" ? "سياسة الخصوصية" : locale === "fa" ? "سیاست حریم خصوصی" : "Gizlilik Politikası", to: href("privacy") },
        { label: t.cookies.link, to: href("cookies") },
        { label: t.footer.cookiePrefs, action: "cookies" },
        { label: locale === "en" ? "KVKK application" : locale === "ar" ? "طلب KVKK" : locale === "fa" ? "درخواست KVKK" : "KVKK Başvuru Formu", to: href("kvkkApplication") },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer__bg" aria-hidden="true">
        <AmbientBackdrop variant="footer" />
        <div className="footer__vignette" />
      </div>

      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to={href("home")} className="footer__brand-link">
              <img src="/sigortauzmani-logo.svg" alt="Sigorta Uzmanı" />
              <span>
                sigorta<strong>uzmanı</strong>
              </span>
            </Link>
            <p>{t.footer.blurb}</p>
            <a href={`tel:${COMPANY.telefonE164}`} className="footer__phone">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                  fill="currentColor"
                />
              </svg>
              {COMPANY.telefon}
            </a>
          </div>

          <div className="footer__columns">
            {columns.map((column) => (
              <div className="footer__column" key={column.title}>
                <h3>{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={`${link.label}-${link.to ?? link.action}`}>
                      {link.action === "cookies" ? (
                        <button type="button" onClick={openPreferences}>
                          {link.label}
                        </button>
                      ) : link.to ? (
                        <Link to={link.to}>{link.label}</Link>
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
          <div className="footer__credits">
            <span>{t.footer.copyright}</span>
            <span>
              Powered by{" "}
              <a href="https://juststack.co/" target="_blank" rel="noreferrer">
                Juststack Software &amp; Tech
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
