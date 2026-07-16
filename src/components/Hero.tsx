import { Link } from "react-router-dom";
import { products } from "../data/products";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
        <div className="hero__blob hero__blob--3" />
        <div className="hero__floor" />
        <div className="hero__beam hero__beam--1" />
        <div className="hero__beam hero__beam--2" />
        <div className="hero__vignette" />
      </div>

      <div className="hero__content">
        <h1 className="hero__title">Lorem Ipsum Dolor Sit Amet</h1>
        <p className="hero__subtitle">Consectetur Adipiscing. Sed Do Eiusmod. Tempor Incididunt.</p>

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

        <button className="hero__all-link">Tüm ürünleri gör</button>
      </div>
    </section>
  );
}
