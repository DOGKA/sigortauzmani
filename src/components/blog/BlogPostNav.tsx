import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface AdjacentPost {
  slug: string;
  title: string;
  category: string | null;
}

interface BlogPostNavProps {
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
}

export default function BlogPostNav({ previous, next }: BlogPostNavProps) {
  if (!previous && !next) return null;

  return (
    <nav className="blog-postnav" aria-label="Diğer yazılar">
      {previous ? (
        <Link to={`/blog/${previous.slug}`} className="blog-postnav__item" rel="prev">
          <span className="blog-postnav__label">
            <ArrowLeft aria-hidden="true" />
            Önceki yazı
          </span>
          <span className="blog-postnav__title">{previous.title}</span>
        </Link>
      ) : (
        <span className="blog-postnav__spacer" />
      )}

      {next && (
        <Link
          to={`/blog/${next.slug}`}
          className="blog-postnav__item blog-postnav__item--next"
          rel="next"
        >
          <span className="blog-postnav__label">
            Sonraki yazı
            <ArrowRight aria-hidden="true" />
          </span>
          <span className="blog-postnav__title">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
