import { Link } from "react-router-dom";
import { Clock, Eye } from "lucide-react";

interface BlogHeaderProps {
  title: string;
  publishedAt: string;
  updatedAt?: string;
  category?: string;
  readingTime?: number;
  viewCount?: number;
  author?: string;
}

const LONG_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

export default function BlogHeader({
  title,
  publishedAt,
  updatedAt,
  category,
  readingTime,
  viewCount = 0,
  author = "Sigorta Uzmanı",
}: BlogHeaderProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString("tr-TR", LONG_DATE);
  const formattedUpdateDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString("tr-TR", LONG_DATE)
    : null;
  const showUpdate = formattedUpdateDate && formattedUpdateDate !== formattedDate;

  return (
    <header className="blog-article__header">
      <nav className="blog-crumbs" aria-label="Sayfa yolu">
        <Link to="/">Ana Sayfa</Link>
        <span aria-hidden="true">/</span>
        <Link to="/blog">Blog</Link>
        {category && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={`/blog?cat=${encodeURIComponent(category)}`}>{category}</Link>
          </>
        )}
      </nav>

      {category && (
        <Link
          to={`/blog?cat=${encodeURIComponent(category)}`}
          className="blog-article__category"
        >
          {category}
        </Link>
      )}

      <h1 className="blog-article__title">{title}</h1>

      <div className="blog-article__meta">
        <span className="blog-article__author">{author}</span>
        <span className="blog-article__meta-divider" aria-hidden="true" />
        <time className="blog-article__meta-item" dateTime={publishedAt}>
          {formattedDate}
        </time>

        {readingTime ? (
          <>
            <span className="blog-article__meta-divider" aria-hidden="true" />
            <span className="blog-article__meta-item">
              <Clock aria-hidden="true" />
              {readingTime} dakika okuma
            </span>
          </>
        ) : null}

        {viewCount > 0 && (
          <>
            <span className="blog-article__meta-divider" aria-hidden="true" />
            <span className="blog-article__meta-item">
              <Eye aria-hidden="true" />
              {viewCount.toLocaleString("tr-TR")} görüntülenme
            </span>
          </>
        )}

        {showUpdate && (
          <>
            <span className="blog-article__meta-divider" aria-hidden="true" />
            <span className="blog-article__meta-item blog-article__meta-item--muted">
              Güncelleme: {formattedUpdateDate}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
