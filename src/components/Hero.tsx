import { Link } from "react-router-dom";
import { heroProducts } from "../data/products";
import { productIcons } from "../data/productIcons";
import { useSiteSettings } from "../lib/settings/context";
import { useLocale, useT } from "../lib/i18n/context";
import { localizedProduct } from "../lib/i18n/products";
import AmbientBackdrop from "./AmbientBackdrop";
import "./Hero.css";

export default function Hero() {
  const { isProductEnabled } = useSiteSettings();
  const { locale, quoteHref } = useLocale();
  const t = useT();
  const visibleProducts = heroProducts
    .filter((product) => isProductEnabled(product.slug))
    .map((product) => localizedProduct(product, locale));
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        <AmbientBackdrop />
        <div className="hero__vignette" />
      </div>

      <div className="hero__content">
        <h1 className="hero__title">
          {t.hero.titleBefore} <span className="hero__title-dot">·</span> {t.hero.compare}{" "}
          <span className="hero__title-dot">·</span> {t.hero.staySafe}
        </h1>
        <p className="hero__subtitle">{t.hero.subtitle}</p>

        <div className="hero__cards" id="urunler">
          {visibleProducts.map((product, i) => (
            <Link
              key={product.slug}
              to={quoteHref(product.slug)}
              className="product-card"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {product.badge && <span className="product-card__badge">{product.badge}</span>}
              <div className="product-card__icon" data-slug={product.slug}>
                <img src={productIcons[product.slug]} alt="" />
              </div>
              <span className="product-card__title">{product.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
