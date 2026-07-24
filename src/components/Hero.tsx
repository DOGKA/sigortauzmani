import { Link } from "react-router-dom";
import { products } from "../data/products";
import HeroScene from "./HeroScene";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        <HeroScene />
        <div className="hero__vignette" />
      </div>

      <div className="hero__content">
        <h1 className="hero__title">
          Teklif Al <span className="hero__title-dot">·</span> Karşılaştır{" "}
          <span className="hero__title-dot">·</span> Güvende Kal
        </h1>
        <p className="hero__subtitle">
          Doğru sigorta. Uygun Fiyat. Hızlı Destek
        </p>

        <div className="hero__cards">
          {products.map((product, i) => (
            <Link
              key={product.slug}
              to={`/teklif/${product.slug}`}
              className="product-card"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {product.badge && <span className="product-card__badge">{product.badge}</span>}
              <div className="product-card__icon">
                <img src={product.icon} alt="" />
              </div>
              <span className="product-card__title">{product.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
