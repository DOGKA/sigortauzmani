import { Link } from "react-router-dom";
import { Clock, Eye, TrendingUp } from "lucide-react";
import { blogCover } from "../../lib/blog/cover";
import type { BlogSort } from "./BlogFilterBar";

export interface PopularPost {
  slug: string;
  title: string;
  category: string | null;
  viewCount: number;
  featuredImage?: string | null;
  publishedAt?: string;
}

interface BlogPopularListProps {
  posts: PopularPost[];
  heading?: string;
  sort?: BlogSort;
  limit?: number;
  excludeSlug?: string;
  className?: string;
}

export default function BlogPopularList({
  posts,
  heading,
  sort = "popular",
  limit = 5,
  excludeSlug,
  className = "",
}: BlogPopularListProps) {
  const ranked = [...posts]
    .filter((post) => post.slug !== excludeSlug)
    .filter((post) => sort === "recent" || post.viewCount > 0)
    .sort((a, b) =>
      sort === "recent"
        ? Date.parse(b.publishedAt ?? "") - Date.parse(a.publishedAt ?? "")
        : b.viewCount - a.viewCount,
    )
    .slice(0, limit);

  if (ranked.length === 0) return null;

  const title = heading ?? (sort === "recent" ? "En yeni" : "En çok okunanlar");
  const Icon = sort === "recent" ? Clock : TrendingUp;

  return (
    <section className={`blog-popular ${className}`.trim()}>
      <h2 className="blog-popular__heading">
        <Icon aria-hidden="true" />
        {title}
      </h2>
      <ol className="blog-popular__list">
        {ranked.map((post, index) => {
          const cover = blogCover(post.featuredImage);
          return (
            <li key={post.slug}>
              <Link to={`/blog/${post.slug}`} className="blog-popular__item">
                <span className="blog-popular__rank">{index + 1}</span>
                {cover && (
                  <img
                    className="blog-popular__thumb"
                    src={cover.src}
                    width={800}
                    height={450}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <span className="blog-popular__body">
                  <span className="blog-popular__title">{post.title}</span>
                  <span className="blog-popular__meta">
                    {post.category && (
                      <span className="blog-popular__category">{post.category}</span>
                    )}
                    <span className="blog-popular__views">
                      <Eye aria-hidden="true" />
                      {post.viewCount.toLocaleString("tr-TR")} görüntülenme
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
