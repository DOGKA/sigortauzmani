import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";
import BlogPostRow from "./BlogPostRow";
import BlogPopularList from "./BlogPopularList";
import BlogFilterBar, { type BlogSort } from "./BlogFilterBar";
import BlogPagination from "./BlogPagination";

const POSTS_PER_PAGE = 12;

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string | null;
  readingTime: number;
  viewCount: number;
}

interface BlogPageClientProps {
  posts: BlogPost[];
  categories: { name: string; count: number }[];
  /** `/blog?cat=` ile gelen filtre (sayfa doğrular) */
  initialCategory?: string | null;
  /** `/blog?q=` ile gelen arama terimi */
  initialQuery?: string;
  /** `/blog?sort=` ile gelen sıralama */
  initialSort?: BlogSort;
  /** `/blog?page=` ile gelen sayfa (sayfa doğrular) */
  initialPage?: number;
}

/** Türkçe büyük/küçük ve aksan farklarını yok sayan arama anahtarı. */
function foldForSearch(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function BlogPageClient({
  posts,
  categories,
  initialCategory = null,
  initialQuery = "",
  initialSort = "recent",
  initialPage = 1,
}: BlogPageClientProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<BlogSort>(initialSort);
  const [page, setPage] = useState(initialPage);
  const listRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  // Geri/ileri gezinmede URL yeniden kaynak olur. Arama kutusu bilinçli olarak
  // dışarıda: kullanıcı yazarken gecikmeli URL yazımı metni geri alabilirdi.
  const [urlState, setUrlState] = useState({
    category: initialCategory,
    sort: initialSort,
    page: initialPage,
  });

  if (
    urlState.category !== initialCategory ||
    urlState.sort !== initialSort ||
    urlState.page !== initialPage
  ) {
    setUrlState({ category: initialCategory, sort: initialSort, page: initialPage });
    setActiveCategory(initialCategory);
    setSort(initialSort);
    setPage(initialPage);
  }

  const hrefFor = useCallback(
    (next: { cat?: string | null; q?: string; sort?: BlogSort; page?: number }) => {
      const params = new URLSearchParams();
      const cat = next.cat !== undefined ? next.cat : activeCategory;
      const q = next.q !== undefined ? next.q : query;
      const sortValue = next.sort !== undefined ? next.sort : sort;
      const targetPage = next.page !== undefined ? next.page : page;

      if (cat) params.set("cat", cat);
      if (q.trim()) params.set("q", q.trim());
      if (sortValue !== "recent") params.set("sort", sortValue);
      if (targetPage > 1) params.set("page", String(targetPage));

      const search = params.toString();
      return search ? `/blog?${search}` : "/blog";
    },
    [activeCategory, query, sort, page],
  );

  const setCategory = useCallback(
    (cat: string | null) => {
      setActiveCategory(cat);
      setPage(1);
      navigate(hrefFor({ cat, page: 1 }), { replace: true });
    },
    [navigate, hrefFor],
  );

  const setSortValue = useCallback(
    (value: BlogSort) => {
      setSort(value);
      setPage(1);
      navigate(hrefFor({ sort: value, page: 1 }), { replace: true });
    },
    [navigate, hrefFor],
  );

  const setQueryValue = useCallback((value: string) => {
    setQuery(value);
    setPage(1);
  }, []);

  // Yazarken her tuşta URL yazmamak için arama terimi geciktirilerek senkronlanır.
  useEffect(() => {
    if (query === initialQuery) return;
    const timeout = setTimeout(() => {
      navigate(hrefFor({ q: query, page: 1 }), { replace: true });
    }, 350);
    return () => clearTimeout(timeout);
  }, [query, initialQuery, navigate, hrefFor]);

  const filteredPosts = useMemo(() => {
    const term = foldForSearch(query.trim());
    const byCategory = activeCategory
      ? posts.filter((post) => post.category === activeCategory)
      : posts;

    const bySearch = term
      ? byCategory.filter(
          (post) =>
            foldForSearch(post.title).includes(term) ||
            foldForSearch(post.excerpt).includes(term) ||
            foldForSearch(post.category ?? "").includes(term),
        )
      : byCategory;

    if (sort === "popular") {
      return [...bySearch].sort((a, b) => b.viewCount - a.viewCount);
    }
    return bySearch;
  }, [posts, activeCategory, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  // Filtre daralınca mevcut sayfa aralık dışında kalabilir.
  const currentPage = Math.min(page, totalPages);

  const visiblePosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const hasQuery = query.trim().length > 0;
  // Öne çıkan yazı, seçili kategori ve sıralamanın ilk yazısıdır. Aramada
  // sonuçların hepsi eşit ağırlıkta olduğu için düz liste gösterilir.
  const featuredPost = !hasQuery && currentPage === 1 ? visiblePosts[0] : undefined;
  const restPosts = featuredPost ? visiblePosts.slice(1) : visiblePosts;
  const featuredLabel = sort === "popular" ? "En çok okunan" : "Son yazı";

  const goToPage = useCallback(
    (targetPage: number) => {
      shouldScrollRef.current = true;
      setPage(targetPage);
      navigate(hrefFor({ page: targetPage }));
    },
    [navigate, hrefFor],
  );

  // Sayfa değişince listenin başına dön; sayfanın en tepesine değil.
  useEffect(() => {
    if (!shouldScrollRef.current) return;
    shouldScrollRef.current = false;
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  // En çok okunanlar da seçili kategoriyi izler; arama terimi burayı etkilemez.
  const popularPosts = useMemo(() => {
    const scope = activeCategory
      ? posts.filter((post) => post.category === activeCategory)
      : posts;

    return scope.map((post) => ({
      slug: post.slug,
      title: post.title,
      category: post.category,
      viewCount: post.viewCount,
    }));
  }, [posts, activeCategory]);

  return (
    <div className="blog-index">
      {/* Masaüstünde sağ sütun; dar ekranda `display: contents` ile parçalanıp
          filtreler listenin üstüne, popüler liste altına düşer. */}
      <aside className="blog-index__aside">
        <BlogFilterBar
          categories={categories}
          totalCount={posts.length}
          activeCategory={activeCategory}
          onCategoryChange={setCategory}
          query={query}
          onQueryChange={setQueryValue}
          sort={sort}
          onSortChange={setSortValue}
          resultCount={filteredPosts.length}
        />

        <BlogPopularList posts={popularPosts} className="blog-index__popular" />
      </aside>

      <div className="blog-index__list" ref={listRef}>
        {filteredPosts.length === 0 ? (
          <div className="blog-empty">
            <SearchX className="blog-empty__icon" aria-hidden="true" />
            <h2 className="blog-empty__title">
              {query.trim()
                ? `"${query.trim()}" için sonuç yok`
                : "Bu kategoride yazı yok"}
            </h2>
            <p className="blog-empty__text">
              Farklı bir arama deneyin veya tüm yazılara dönün.
            </p>
            <button
              type="button"
              className="blog-empty__reset"
              onClick={() => {
                setQuery("");
                setCategory(null);
              }}
            >
              Tüm yazılar
            </button>
          </div>
        ) : (
          <>
            {featuredPost && (
              <div className="blog-index__featured">
                <BlogPostRow
                  slug={featuredPost.slug}
                  title={featuredPost.title}
                  excerpt={featuredPost.excerpt}
                  publishedAt={featuredPost.publishedAt}
                  category={featuredPost.category}
                  readingTime={featuredPost.readingTime}
                  viewCount={featuredPost.viewCount}
                  variant="featured"
                  flag={featuredLabel}
                />
              </div>
            )}

            <div className="blog-rows">
              {restPosts.map((post) => (
                <BlogPostRow
                  key={post.id}
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  publishedAt={post.publishedAt}
                  category={post.category}
                  readingTime={post.readingTime}
                  viewCount={post.viewCount}
                  query={query}
                />
              ))}
            </div>

            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              hrefFor={(target) => hrefFor({ page: target })}
              onPageChange={goToPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
