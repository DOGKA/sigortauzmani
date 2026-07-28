import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  /** Her sayfa için gerçek URL — tarayıcı ve arama motoru sayfaları tek tek gezebilsin. */
  hrefFor: (page: number) => string;
  onPageChange: (page: number) => void;
}

/** 1, güncel sayfanın komşuları ve son sayfa; aradaki boşluklar "..." ile temsil edilir. */
function buildPageList(currentPage: number, totalPages: number): (number | "gap")[] {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  return pages.flatMap((page, i) => {
    const prev = pages[i - 1];
    return prev && page - prev > 1 ? (["gap", page] as (number | "gap")[]) : [page];
  });
}

export default function BlogPagination({
  currentPage,
  totalPages,
  hrefFor,
  onPageChange,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  function handleClick(event: MouseEvent, page: number) {
    // Yeni sekmede açma niyetini bozma; aksi halde tam gezinme yerine
    // istemci tarafında sayfa değiştir.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    onPageChange(page);
  }

  return (
    <nav className="blog-pagination" aria-label="Blog sayfaları">
      {hasPrev ? (
        <Link
          to={hrefFor(currentPage - 1)}
          onClick={(event) => handleClick(event, currentPage - 1)}
          className="blog-pagination__arrow"
          rel="prev"
          aria-label="Önceki sayfa"
        >
          <ChevronLeft aria-hidden="true" />
          <span className="blog-pagination__arrow-text">Önceki</span>
        </Link>
      ) : (
        <span
          className="blog-pagination__arrow blog-pagination__arrow--disabled"
          aria-hidden="true"
        >
          <ChevronLeft />
          <span className="blog-pagination__arrow-text">Önceki</span>
        </span>
      )}

      <div className="blog-pagination__pages">
        {buildPageList(currentPage, totalPages).map((page, i) =>
          page === "gap" ? (
            <span key={`gap-${i}`} className="blog-pagination__gap" aria-hidden="true">
              &hellip;
            </span>
          ) : (
            <Link
              key={page}
              to={hrefFor(page)}
              onClick={(event) => handleClick(event, page)}
              className={`blog-pagination__page ${
                page === currentPage ? "blog-pagination__page--active" : ""
              }`}
              aria-label={`Sayfa ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Link>
          ),
        )}
      </div>

      {hasNext ? (
        <Link
          to={hrefFor(currentPage + 1)}
          onClick={(event) => handleClick(event, currentPage + 1)}
          className="blog-pagination__arrow"
          rel="next"
          aria-label="Sonraki sayfa"
        >
          <span className="blog-pagination__arrow-text">Sonraki</span>
          <ChevronRight aria-hidden="true" />
        </Link>
      ) : (
        <span
          className="blog-pagination__arrow blog-pagination__arrow--disabled"
          aria-hidden="true"
        >
          <span className="blog-pagination__arrow-text">Sonraki</span>
          <ChevronRight />
        </span>
      )}
    </nav>
  );
}
