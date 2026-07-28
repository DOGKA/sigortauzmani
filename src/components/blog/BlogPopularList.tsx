import { Link } from "react-router-dom";
import { Eye, TrendingUp } from "lucide-react";

export interface PopularPost {
  slug: string;
  title: string;
  category: string | null;
  viewCount: number;
}

interface BlogPopularListProps {
  posts: PopularPost[];
  heading?: string;
  limit?: number;
  excludeSlug?: string;
  className?: string;
}

export default function BlogPopularList({
  posts,
  heading = "En Çok Okunanlar",
  limit = 5,
  excludeSlug,
  className = "",
}: BlogPopularListProps) {
  const ranked = [...posts]
    .filter((post) => post.slug !== excludeSlug && post.viewCount > 0)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);

  if (ranked.length === 0) return null;

  return (
    <section className={`blog-popular ${className}`.trim()}>
      <h2 className="blog-popular__heading">
        <TrendingUp aria-hidden="true" />
        {heading}
      </h2>
      <ol className="blog-popular__list">
        {ranked.map((post, index) => (
          <li key={post.slug}>
            <Link to={`/blog/${post.slug}`} className="blog-popular__item">
              <span className="blog-popular__rank">{index + 1}</span>
              <span className="blog-popular__body">
                <span className="blog-popular__title">{post.title}</span>
                <span className="blog-popular__meta">
                  {post.category && (
                    <span className="blog-popular__category">{post.category}</span>
                  )}
                  <span className="blog-popular__views">
                    <Eye aria-hidden="true" />
                    {post.viewCount.toLocaleString("tr-TR")}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
