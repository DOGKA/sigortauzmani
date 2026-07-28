import { Fragment, useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Eye } from "lucide-react";

type RowVariant = "default" | "featured" | "compact";

interface BlogPostRowProps {
  slug: string;
  title: string;
  excerpt?: string;
  publishedAt: string;
  category?: string | null;
  readingTime?: number;
  viewCount?: number;
  variant?: RowVariant;
  /** Kategori ve tarihin önünde duran bağlam etiketi ("Son yazı" gibi). */
  flag?: string;
  /** Arama terimi verilirse başlık ve özette eşleşen parça vurgulanır. */
  query?: string;
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/** Türkçe büyük/küçük harf farklarını yok sayan, aksansız karşılaştırma anahtarı. */
function foldForSearch(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function highlight(text: string, query?: string): ReactNode {
  const term = query?.trim();
  if (!term) return text;

  const haystack = foldForSearch(text);
  const needle = foldForSearch(term);
  if (!needle || !haystack.includes(needle)) return text;

  const parts: ReactNode[] = [];
  let cursor = 0;
  let match = haystack.indexOf(needle);

  while (match !== -1) {
    if (match > cursor) parts.push(text.slice(cursor, match));
    parts.push(
      <mark key={`${match}-${parts.length}`} className="blog-mark">
        {text.slice(match, match + needle.length)}
      </mark>,
    );
    cursor = match + needle.length;
    match = haystack.indexOf(needle, cursor);
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}

export default function BlogPostRow({
  slug,
  title,
  excerpt,
  publishedAt,
  category,
  readingTime,
  viewCount = 0,
  variant = "default",
  flag,
  query,
}: BlogPostRowProps) {
  const formattedDate = useMemo(
    () => new Date(publishedAt).toLocaleDateString("tr-TR", DATE_FORMAT),
    [publishedAt],
  );

  const showExcerpt = variant !== "compact" && !!excerpt;

  return (
    <article className={`blog-row blog-row--${variant}`}>
      <Link to={`/blog/${slug}`} className="blog-row__link">
        <div className="blog-row__head">
          {flag && <span className="blog-row__flag">{flag}</span>}
          {variant !== "featured" && category && (
            <span className="blog-row__category">{category}</span>
          )}
          {variant !== "featured" && (
            <time className="blog-row__date" dateTime={publishedAt}>
              {formattedDate}
            </time>
          )}
        </div>

        <h2 className="blog-row__title">{highlight(title, query)}</h2>

        {showExcerpt && (
          <p className="blog-row__excerpt">{highlight(excerpt, query)}</p>
        )}

        <div className="blog-row__meta">
          {readingTime ? (
            <span className="blog-row__meta-item">
              <Clock aria-hidden="true" />
              {readingTime} dk okuma
            </span>
          ) : null}

          {viewCount > 0 && (
            <span className="blog-row__meta-item">
              <Eye aria-hidden="true" />
              {viewCount.toLocaleString("tr-TR")}
            </span>
          )}

          <span className="blog-row__cta">
            {variant === "featured" ? "Yazıyı oku" : "Oku"}
            <ArrowRight aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
