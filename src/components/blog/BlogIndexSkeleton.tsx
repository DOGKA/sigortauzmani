/** Blog ana sayfası yüklenirken gösterilen iskelet liste. */
export default function BlogIndexSkeleton() {
  return (
    <div
      className="blog-index blog-index--loading"
      role="status"
      aria-live="polite"
      aria-label="Yazılar yükleniyor"
    >
      <span className="blog-index__sr-only">Yazılar yükleniyor</span>

      <aside className="blog-index__aside" aria-hidden="true">
        <div className="blog-skeleton blog-skeleton--filters" />
        <div className="blog-skeleton blog-skeleton--popular" />
      </aside>

      <div className="blog-index__list">
        <div className="blog-skeleton blog-skeleton--featured" />
        <div className="blog-skeleton-rows">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="blog-skeleton blog-skeleton--row" />
          ))}
        </div>
      </div>
    </div>
  );
}
