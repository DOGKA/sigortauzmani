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
        <div className="hero__grid-pattern" />
        <div className="hero__ring" />
        <div className="hero__ring hero__ring--2" />
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
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
