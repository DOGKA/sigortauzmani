import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import "./HomeBlog.css";
import { fetchBlogCards, type BlogCard } from "../lib/blog/api";
import { blogCover } from "../lib/blog/cover";
import { useT } from "../lib/i18n/context";
import { ROUTES } from "../lib/seo/routes";

type Sort = "recent" | "popular";

const LIMIT = 6;

export default function HomeBlog() {
  const t = useT();
  const [cards, setCards] = useState<BlogCard[] | null>(null);
  const [sort, setSort] = useState<Sort>("recent");
  useEffect(() => {
    let active = true;
    fetchBlogCards()
      .then((list) => active && setCards(list))
      .catch(() => active && setCards([]));
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (!cards) return [];
    const list =
      sort === "popular" ? [...cards].sort((a, b) => b.viewCount - a.viewCount) : cards;
    return list.slice(0, LIMIT);
  }, [cards, sort]);

  if (cards && cards.length === 0) return null;

  return (
    <section className="home-blog" aria-labelledby="home-blog-title">
      <div className="home-blog__inner">
        <div className="home-blog__heading">
          <span className="home-blog__eyebrow">{t.homeBlog.eyebrow}</span>
          <h2 id="home-blog-title">{t.homeBlog.title}</h2>
          <p>{t.homeBlog.lead}</p>
        </div>

        <div className="home-blog__tabs" role="group" aria-label={t.homeBlog.title}>
          {(["recent", "popular"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className="home-blog__tab"
              aria-pressed={sort === value}
              onClick={() => setSort(value)}
            >
              {value === "recent" ? t.homeBlog.recent : t.homeBlog.popular}
            </button>
          ))}
        </div>

        {/* Dar ekranda liste yatay kayar; seçim değişince yeni liste ilk karttan başlar. */}
        <ul key={sort} className="home-blog__grid" aria-busy={!cards}>
          {cards
            ? visible.map((card) => {
                const cover = blogCover(card.featuredImage);
                return (
                  <li key={card.slug}>
                    <Link to={ROUTES.blogPost(card.slug)} className="home-blog__card">
                      <span className="home-blog__media">
                        {cover && (
                          <img
                            src={cover.src}
                            srcSet={cover.srcSet}
                            sizes="(max-width: 900px) 80vw, 340px"
                            width={800}
                            height={450}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </span>
                      <span className="home-blog__body">
                        {card.category && (
                          <span className="home-blog__category">{card.category}</span>
                        )}
                        <span className="home-blog__title">{card.title}</span>
                        <span className="home-blog__meta">
                          <Clock aria-hidden="true" />
                          {card.readingTime} {t.homeBlog.minutes}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })
            : Array.from({ length: LIMIT }, (_, i) => (
                <li key={i} aria-hidden="true">
                  <span className="home-blog__card home-blog__card--skeleton">
                    <span className="home-blog__media" />
                    <span className="home-blog__body">
                      <span className="home-blog__line" />
                      <span className="home-blog__line home-blog__line--short" />
                    </span>
                  </span>
                </li>
              ))}
        </ul>

        <div className="home-blog__footer">
          <Link to={ROUTES.blog} className="home-blog__all">
            {t.homeBlog.all}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
